-- CreateAdminsTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Create index for email
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- Insert default admin (password: admin123)
INSERT INTO "Admin" ("id", "email", "password", "name", "role", "active", "createdAt", "updatedAt") 
VALUES (
    'admin-001',
    'admin@tienda.com',
    '$2b$12$LQv3c1yqBWVHxkd0L1kOY6Nqf3E9Ll5T2s5q6',
    'Administrador Principal',
    'admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
