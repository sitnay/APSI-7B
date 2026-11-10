DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "pengguna"
        WHERE "username" IS NULL OR BTRIM("username") = ''
    ) THEN
        RAISE EXCEPTION 'Resolve empty or NULL pengguna.username values before applying this migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "pengguna"
        GROUP BY "username"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Resolve duplicate pengguna.username values before applying this migration';
    END IF;
END $$;

ALTER TABLE "pengguna"
    ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "pengguna_username_key"
    ON "pengguna"("username");
