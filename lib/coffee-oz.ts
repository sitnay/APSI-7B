import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSessionSecret } from "@/lib/security";

export type SessionUser = {
  id_pengguna: string;
  username: string;
  role: string;
  nama: string;
};

const SESSION_COOKIE = "coffee_oz_session";

export async function hashPassword(password: string) {
  return hash(password.trim(), 12);
}

function makeId(prefix: string, existingIds: string[]) {
  const values = existingIds
    .map((id) => {
      const match = id.match(new RegExp(`^${prefix}([0-9]+)$`));
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((value) => Number.isFinite(value));

  const nextNumber = values.length > 0 ? Math.max(...values) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

export function createSessionCookie(user: SessionUser) {
  const payload = {
    userId: user.id_pengguna,
    username: user.username,
    role: user.role,
    nama: user.nama,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("hex");

  return Buffer.from(JSON.stringify({ payload, sig: signature })).toString("base64url");
}

export function verifySessionCookie(rawValue?: string | null) {
  if (!rawValue) {
    return null;
  }

  const secret = getSessionSecret();

  try {
    const decoded = JSON.parse(Buffer.from(rawValue, "base64url").toString("utf8")) as {
      payload: { userId: string; username: string; role: string; nama: string; exp: number };
      sig: string;
    };

    if (!decoded.payload || !decoded.sig) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(Buffer.from(JSON.stringify(decoded.payload)).toString("base64url"))
      .digest("hex");

    const providedSignature = Buffer.from(decoded.sig, "hex");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
    if (
      providedSignature.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)
    ) {
      return null;
    }

    if (decoded.payload.exp < Date.now()) {
      return null;
    }

    return {
      id_pengguna: decoded.payload.userId,
      username: decoded.payload.username,
      role: decoded.payload.role,
      nama: decoded.payload.nama,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionCookie(value);
}

export async function setSessionUser(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionCookie(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getRoleLandingPage(role: string) {
  switch (role) {
    case "Pemilik":
      return "/dashboard/owner";
    case "Kasir":
      return "/dashboard/kasir";
    default:
      return "/";
  }
}

export async function loginUser(username: string, password: string, expectedRole: string) {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();
  if (!normalizedUsername || !normalizedPassword) {
    return null;
  }

  if (!["Pemilik", "Kasir"].includes(expectedRole)) {
    return null;
  }

  const user = await prisma.pengguna.findFirst({
    where: {
      username: normalizedUsername,
    },
  });

  if (!user || !user.username || !user.password || !user.role) {
    return null;
  }

  const role = user.role.toLowerCase() === "pemilik"
    ? "Pemilik"
    : user.role.toLowerCase() === "kasir"
      ? "Kasir"
      : null;

  if (!role || role !== expectedRole) {
    return null;
  }

  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
  const isLegacyHash = /^[a-f\d]{64}$/i.test(user.password);
  const passwordMatches = isBcryptHash
    ? await compare(normalizedPassword, user.password)
    : isLegacyHash &&
      crypto.timingSafeEqual(
        Buffer.from(user.password.toLowerCase(), "hex"),
        Buffer.from(crypto.createHash("sha256").update(normalizedPassword).digest("hex"), "hex"),
      );

  if (!passwordMatches) {
    return null;
  }

  if (!isBcryptHash) {
    await prisma.pengguna.update({
      where: { id_pengguna: user.id_pengguna },
      data: { password: await hashPassword(normalizedPassword) },
    });
  }

  return {
    id_pengguna: user.id_pengguna,
    username: user.username,
    role,
    nama: user.nama ?? user.username,
  } satisfies SessionUser;
}

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultSalesDateRange() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    from: formatDateInputValue(startOfMonth),
    to: formatDateInputValue(endOfMonth),
  };
}

export function formatCurrency(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export async function getPaymentContext() {
  const order = await prisma.pesanan.findFirst({
    where: {
      status_pesanan: {
        not: "Batal",
      },
    },
    orderBy: {
      tanggal: "desc",
    },
    include: {
      pelanggan: true,
      detail_pesanan: {
        include: {
          menu: true,
        },
      },
      pembayaran: true,
    },
  });

  if (!order) {
    return null;
  }

  const subtotal = order.detail_pesanan.reduce((total, item) => total + Number(item.subtotal ?? 0), 0);

  return {
    order,
    subtotal,
    paymentMethod: order.pembayaran[0]?.metode ?? "QRIS",
  };
}

export async function getCashierOrders() {
  const orders = await prisma.pesanan.findMany({
    where: {
      status_pesanan: {
        not: "Batal",
      },
    },
    orderBy: {
      tanggal: "desc",
    },
    include: {
      pelanggan: true,
      detail_pesanan: {
        include: {
          menu: true,
        },
      },
      pembayaran: true,
    },
  });

  const unpaid = [];
  const paid = [];

  for (const order of orders) {
    const hasPaid = order.pembayaran.some((payment) => payment.status_pembayaran === "Lunas");
    const normalizedOrder = {
      ...order,
      total: Number(order.total_tagihan ?? 0),
      items: order.detail_pesanan.map((detail) => ({
        ...detail,
        subtotalValue: Number(detail.subtotal ?? 0),
      })),
      pembayaran: order.pembayaran,
      payment: order.pembayaran[0] ?? null,
    };

    if (hasPaid) {
      paid.push(normalizedOrder);
    } else {
      unpaid.push(normalizedOrder);
    }
  }

  return { unpaid, paid };
}

export async function getOrderDetail(orderId: string) {
  if (!orderId) {
    return null;
  }

  return prisma.pesanan.findUnique({
    where: { id_pesanan: orderId },
    include: {
      pelanggan: true,
      detail_pesanan: {
        include: {
          menu: true,
        },
      },
      pembayaran: true,
    },
  });
}

export async function getTransactionRecord(transactionId: string) {
  if (!transactionId) {
    return null;
  }

  return prisma.transaksi.findUnique({
    where: { id_transaksi: transactionId },
    include: {
      pembayaran: {
        include: {
          pesanan: {
            include: {
              pelanggan: true,
              detail_pesanan: {
                include: {
                  menu: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getSalesReport(from?: string, to?: string) {
  const defaultRange = getDefaultSalesDateRange();
  const startDate = from
    ? new Date(`${from}T00:00:00.000Z`)
    : new Date(`${defaultRange.from}T00:00:00.000Z`);
  const endDate = to
    ? new Date(`${to}T23:59:59.999Z`)
    : new Date(`${defaultRange.to}T23:59:59.999Z`);

  const transactions = await prisma.transaksi.findMany({
    where: {
      tanggal_transaksi: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      pembayaran: {
        include: {
          pesanan: {
            include: {
              detail_pesanan: {
                include: {
                  menu: true,
                },
              },
              pelanggan: true,
            },
          },
        },
      },
    },
    orderBy: {
      tanggal_transaksi: "desc",
    },
  });

  const validTransactions = transactions.filter(
    (transaction) => !["Dibatalkan", "Gagal"].includes(transaction.pembayaran?.status_pembayaran ?? ""),
  );

  const totalRevenue = validTransactions.reduce(
    (sum, item) => sum + Number(item.total_transaksi ?? 0),
    0,
  );
  const averageTicket = validTransactions.length > 0 ? totalRevenue / validTransactions.length : 0;

  const productSales = new Map<string, number>();
  for (const transaction of validTransactions) {
    const order = transaction.pembayaran?.pesanan;
    for (const detail of order?.detail_pesanan ?? []) {
      const productName = detail.menu?.nama_menu ?? "Menu lain";
      productSales.set(productName, (productSales.get(productName) ?? 0) + Number(detail.kuantitas_produk ?? 0));
    }
  }

  return {
    transactions: validTransactions,
    totalRevenue,
    totalTransactions: validTransactions.length,
    averageTicket,
    productSales: Array.from(productSales.entries()).map(([name, qty]) => ({ name, qty })),
  };
}

export const PAYMENT_METHODS = [
  "QRIS",
  "Transfer Bank",
  "Kartu Debit",
  "Tunai di Kasir",
] as const;

export function normalizePaymentMethod(value: string) {
  const trimmedValue = String(value ?? "").trim();
  const normalized = PAYMENT_METHODS.find((method) => method.toLowerCase() === trimmedValue.toLowerCase());

  if (normalized) {
    return normalized;
  }

  if (trimmedValue.toLowerCase() === "tunai") {
    return "Tunai di Kasir";
  }

  throw new Error("Metode pembayaran yang dipilih tidak didukung.");
}

export async function processPayment(orderId: string, paymentMethod: string, actorId: string) {
  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  const order = await prisma.pesanan.findUnique({
    where: { id_pesanan: orderId },
    include: {
      detail_pesanan: {
        include: { menu: true },
      },
      pembayaran: true,
    },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.status_pesanan === "Batal") {
    throw new Error("Pesanan sudah dibatalkan dan tidak dapat dibayar.");
  }

  const existingPaidPayment = order.pembayaran.find((payment) => payment.status_pembayaran === "Lunas");
  if (existingPaidPayment) {
    throw new Error("Pembayaran untuk pesanan ini sudah selesai.");
  }

  const freshTotal = Number(order.total_tagihan ?? 0);
  if (!Number.isFinite(freshTotal) || freshTotal <= 0) {
    throw new Error("Total tagihan pesanan tidak valid.");
  }

  const paymentId =
    order.pembayaran[0]?.id_pembayaran ??
    makeId(
      "PM",
      (await prisma.pembayaran.findMany({ select: { id_pembayaran: true } })).map((row) => row.id_pembayaran),
    );

  const transactionId = makeId(
    "TR",
    (await prisma.transaksi.findMany({ select: { id_transaksi: true } })).map((row) => row.id_transaksi),
  );

  const result = await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.pesanan.findUnique({
      where: { id_pesanan: orderId },
      include: { pembayaran: true },
    });

    if (!latestOrder) {
      throw new Error("Pesanan tidak ditemukan saat memproses pembayaran.");
    }

    const duplicatePayment = latestOrder.pembayaran?.find((payment) => payment.status_pembayaran === "Lunas");
    if (duplicatePayment) {
      throw new Error("Pembayaran untuk pesanan ini sudah selesai.");
    }

    if (latestOrder.status_pesanan === "Batal") {
      throw new Error("Pesanan sudah dibatalkan dan tidak dapat dibayar.");
    }

    if (order.pembayaran[0]) {
      await tx.pembayaran.update({
        where: { id_pembayaran: order.pembayaran[0].id_pembayaran },
        data: {
          metode: normalizedMethod,
          jumlah_bayar: freshTotal,
          status_pembayaran: "Lunas",
          id_pengguna: actorId,
        },
      });
    } else {
      await tx.pembayaran.create({
        data: {
          id_pembayaran: paymentId,
          id_pesanan: orderId,
          metode: normalizedMethod,
          jumlah_bayar: freshTotal,
          status_pembayaran: "Lunas",
          id_pengguna: actorId,
        },
      });
    }

    await tx.transaksi.create({
      data: {
        id_transaksi: transactionId,
        tanggal_transaksi: new Date(),
        total_transaksi: freshTotal,
        id_pembayaran: paymentId,
      },
    });

    await tx.pesanan.update({
      where: { id_pesanan: orderId },
      data: {
        status_pesanan: "Selesai",
        total_tagihan: freshTotal,
      },
    });

    return {
      paymentId,
      transactionId,
      total: freshTotal,
      orderId,
      paymentMethod: normalizedMethod,
    };
  });

  return result;
}

export async function updateOwnerTransaction(
  transactionId: string,
  totalTransaksi: number,
  transactionDate: string,
) {
  const normalizedTotal = Number(totalTransaksi);
  if (
    !Number.isSafeInteger(normalizedTotal) ||
    normalizedTotal < 1 ||
    normalizedTotal > 99_999_999
  ) {
    throw new Error("Jumlah transaksi harus antara Rp1 dan Rp99.999.999.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    throw new Error("Tanggal transaksi tidak valid.");
  }

  const normalizedDate = new Date(`${transactionDate}T00:00:00.000Z`);
  if (
    Number.isNaN(normalizedDate.getTime()) ||
    normalizedDate.toISOString().slice(0, 10) !== transactionDate
  ) {
    throw new Error("Tanggal transaksi tidak valid.");
  }

  const record = await prisma.transaksi.findUnique({
    where: { id_transaksi: transactionId },
    include: {
      pembayaran: {
        include: {
          pesanan: true,
        },
      },
    },
  });

  if (!record?.pembayaran) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (["Dibatalkan", "Gagal"].includes(record.pembayaran.status_pembayaran ?? "")) {
    throw new Error("Transaksi yang dibatalkan atau gagal tidak dapat diubah.");
  }

  const paymentId = record.id_pembayaran ?? record.pembayaran.id_pembayaran;
  const orderId = record.pembayaran.id_pesanan ?? record.pembayaran.pesanan?.id_pesanan;

  await prisma.$transaction(async (tx) => {
    await tx.transaksi.update({
      where: { id_transaksi: transactionId },
      data: {
        total_transaksi: normalizedTotal,
        tanggal_transaksi: normalizedDate,
      },
    });

    await tx.pembayaran.update({
      where: { id_pembayaran: paymentId },
      data: {
        jumlah_bayar: normalizedTotal,
        status_pembayaran: "Lunas",
      },
    });

    if (orderId) {
      await tx.pesanan.update({
        where: { id_pesanan: orderId },
        data: {
          total_tagihan: normalizedTotal,
          status_pesanan: "Selesai",
        },
      });
    }
  });

  return true;
}

export async function deleteOwnerTransaction(transactionId: string) {
  const record = await prisma.transaksi.findUnique({
    where: { id_transaksi: transactionId },
    include: {
      pembayaran: {
        include: {
          pesanan: true,
        },
      },
    },
  });

  if (!record?.pembayaran) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (["Dibatalkan", "Gagal"].includes(record.pembayaran.status_pembayaran ?? "")) {
    throw new Error("Transaksi yang dibatalkan atau gagal tidak dapat dihapus.");
  }

  const paymentId = record.id_pembayaran ?? record.pembayaran.id_pembayaran;
  const orderId = record.pembayaran.id_pesanan ?? record.pembayaran.pesanan?.id_pesanan;

  await prisma.$transaction(async (tx) => {
    await tx.pembayaran.update({
      where: { id_pembayaran: paymentId },
      data: {
        status_pembayaran: "Dibatalkan",
      },
    });

    if (orderId) {
      await tx.pesanan.update({
        where: { id_pesanan: orderId },
        data: {
          status_pesanan: "Batal",
        },
      });
    }
  });

  return true;
}

export async function deleteOwnerOrderDetail(detailId: string) {
  const detail = await prisma.detail_pesanan.findUnique({
    where: { id_detail: detailId },
    include: {
      pesanan: true,
    },
  });

  if (!detail) {
    throw new Error("Detail pesanan tidak ditemukan.");
  }

  const remainingDetails = await prisma.detail_pesanan.findMany({
    where: { id_pesanan: detail.id_pesanan ?? undefined },
    include: { menu: true },
  });

  const nextDetails = remainingDetails.filter((item) => item.id_detail !== detailId);
  const nextTotal = nextDetails.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);

  await prisma.$transaction(async (tx) => {
    await tx.detail_pesanan.delete({
      where: { id_detail: detailId },
    });

    if (detail.id_pesanan) {
      await tx.pesanan.update({
        where: { id_pesanan: detail.id_pesanan },
        data: {
          total_tagihan: nextTotal,
        },
      });

      const relatedPayment = await tx.pembayaran.findFirst({
        where: { id_pesanan: detail.id_pesanan },
      });

      if (relatedPayment) {
        await tx.pembayaran.update({
          where: { id_pembayaran: relatedPayment.id_pembayaran },
          data: {
            jumlah_bayar: nextTotal,
          },
        });

        await tx.transaksi.updateMany({
          where: { id_pembayaran: relatedPayment.id_pembayaran },
          data: {
            total_transaksi: nextTotal,
          },
        });
      }
    }
  });

  return true;
}

export function getRoleRedirectUrl(role: string) {
  return getRoleLandingPage(role);
}

export function getSessionResponseRedirectWithMessage(url: string, message: string) {
  const destination = new URL(url, "http://localhost");
  destination.searchParams.set("message", message);
  return NextResponse.redirect(destination);
}

export { makeId };
