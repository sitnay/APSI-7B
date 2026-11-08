import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id_pengguna: string;
  username: string;
  role: string;
  nama: string;
};

const SESSION_COOKIE = "coffee_oz_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "coffee-oz-local-secret";

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
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
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(encodedPayload).digest("hex");

  return Buffer.from(JSON.stringify({ payload, sig: signature })).toString("base64url");
}

export function verifySessionCookie(rawValue?: string | null) {
  if (!rawValue) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(rawValue, "base64url").toString("utf8")) as {
      payload: { userId: string; username: string; role: string; nama: string; exp: number };
      sig: string;
    };

    if (!decoded.payload || !decoded.sig) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(Buffer.from(JSON.stringify(decoded.payload)).toString("base64url"))
      .digest("hex");

    if (decoded.sig !== expectedSignature) {
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

export async function ensureSeedUsers() {
  const requiredUsers = [
    {
      id_pengguna: "USR01",
      nama: "Rhadya",
      username: "rhadya",
      password: hashPassword("pemilik123"),
      role: "Pemilik",
    },
    {
      id_pengguna: "USR02",
      nama: "Rahma",
      username: "rahma",
      password: hashPassword("kasir123"),
      role: "Kasir",
    },
  ];

  for (const candidate of requiredUsers) {
    const existing = await prisma.pengguna.findUnique({
      where: { id_pengguna: candidate.id_pengguna },
    });

    if (existing) {
      await prisma.pengguna.update({
        where: { id_pengguna: candidate.id_pengguna },
        data: {
          nama: candidate.nama,
          username: candidate.username,
          password: candidate.password,
          role: candidate.role,
        },
      });
      continue;
    }

    await prisma.pengguna.create({ data: candidate });
  }
}

export async function loginUser(username: string, password: string, expectedRole?: string) {
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password.trim()) {
    return null;
  }

  if (expectedRole && !["Pemilik", "Kasir"].includes(expectedRole)) {
    return null;
  }

  await ensureSeedUsers();

  const user = await prisma.pengguna.findFirst({
    where: {
      username: {
        equals: normalizedUsername,
        mode: "insensitive",
      },
      ...(expectedRole
        ? {
            role: {
              equals: expectedRole,
              mode: "insensitive",
            },
          }
        : {}),
    },
  });

  if (!user) {
    return null;
  }

  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    return null;
  }

  return {
    id_pengguna: user.id_pengguna,
    username: user.username ?? normalizedUsername,
    role: user.role ?? "Kasir",
    nama: user.nama ?? user.username ?? normalizedUsername,
  } satisfies SessionUser;
}

export function formatCurrency(value: any) {
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

  const subtotal = order.detail_pesanan.reduce(
    (total: number, item: any) => total + Number(item.subtotal ?? 0),
    0,
  );

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

  const unpaid: any[] = [];
  const paid: any[] = [];

  for (const order of orders) {
    const hasPaid = (order.pembayaran ?? []).some((payment: any) => payment.status_pembayaran === "Lunas");
    const normalizedOrder = {
      ...order,
      total: Number(order.total_tagihan ?? 0),
      items: (order.detail_pesanan ?? []).map((detail: any) => ({
        ...detail,
        subtotalValue: Number(detail.subtotal ?? 0),
      })),
      pembayaran: order.pembayaran ?? [],
      payment: (order.pembayaran ?? [])[0] ?? null,
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
  const startDate = from ? new Date(`${from}T00:00:00`) : new Date("2026-01-01T00:00:00");
  const endDate = to ? new Date(`${to}T23:59:59`) : new Date("2026-12-31T23:59:59");

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

  const validTransactions = (transactions as any[]).filter(
    (transaction: any) => !["Dibatalkan", "Gagal"].includes(transaction.pembayaran?.status_pembayaran ?? ""),
  );

  const totalRevenue = validTransactions.reduce(
    (sum: number, item: any) => sum + Number(item.total_transaksi ?? 0),
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

export async function processPayment(orderId: string, paymentMethod: string, actorId: string) {
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

  const existingPaidPayment = order.pembayaran.find((payment: any) => payment.status_pembayaran === "Lunas");
  if (existingPaidPayment) {
    throw new Error("Pembayaran untuk pesanan ini sudah selesai.");
  }

  const paymentId =
    order.pembayaran[0]?.id_pembayaran ??
    makeId(
      "PM",
      (await prisma.pembayaran.findMany({ select: { id_pembayaran: true } })).map((row: any) => row.id_pembayaran),
    );

  const transactionId = makeId(
    "TR",
    (await prisma.transaksi.findMany({ select: { id_transaksi: true } })).map((row: any) => row.id_transaksi),
  );

  const result = await prisma.$transaction(async (tx: any) => {
    if (order.pembayaran[0]) {
      await tx.pembayaran.update({
        where: { id_pembayaran: order.pembayaran[0].id_pembayaran },
        data: {
          metode: paymentMethod,
          jumlah_bayar: order.total_tagihan,
          status_pembayaran: "Lunas",
          id_pengguna: actorId,
        },
      });
    } else {
      await tx.pembayaran.create({
        data: {
          id_pembayaran: paymentId,
          id_pesanan: orderId,
          metode: paymentMethod,
          jumlah_bayar: order.total_tagihan,
          status_pembayaran: "Lunas",
          id_pengguna: actorId,
        },
      });
    }

    await tx.transaksi.create({
      data: {
        id_transaksi: transactionId,
        tanggal_transaksi: new Date(),
        total_transaksi: order.total_tagihan,
        id_pembayaran: paymentId,
      },
    });

    await tx.pesanan.update({
      where: { id_pesanan: orderId },
      data: {
        status_pesanan: "Selesai",
      },
    });

    return {
      paymentId,
      transactionId,
      total: Number(order.total_tagihan ?? 0),
      orderId,
    };
  });

  return result;
}

export async function updateOwnerTransaction(transactionId: string, totalTransaksi: number, paymentMethod: string) {
  const record: any = await prisma.transaksi.findUnique({
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

  const normalizedTotal = Number(totalTransaksi || 0);
  const paymentId = record.id_pembayaran ?? record.pembayaran.id_pembayaran;
  const orderId = record.pembayaran.id_pesanan ?? record.pembayaran.pesanan?.id_pesanan;

  await prisma.$transaction(async (tx: any) => {
    await tx.transaksi.update({
      where: { id_transaksi: transactionId },
      data: {
        total_transaksi: normalizedTotal,
      },
    });

    await tx.pembayaran.update({
      where: { id_pembayaran: paymentId },
      data: {
        metode: paymentMethod,
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
  const record: any = await prisma.transaksi.findUnique({
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

  const paymentId = record.id_pembayaran ?? record.pembayaran.id_pembayaran;
  const orderId = record.pembayaran.id_pesanan ?? record.pembayaran.pesanan?.id_pesanan;

  await prisma.$transaction(async (tx: any) => {
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

  const nextDetails = remainingDetails.filter((item: any) => item.id_detail !== detailId);
  const nextTotal = nextDetails.reduce((sum: number, item: any) => sum + Number(item.subtotal ?? 0), 0);

  await prisma.$transaction(async (tx: any) => {
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
