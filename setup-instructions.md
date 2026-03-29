# 🚀 Instrucciones de Configuración PostgreSQL

## Paso 1: Instalar PostgreSQL

### Windows
```bash
# Opción 1: Chocolatey
choco install postgresql

# Opción 2: Descargar desde web
# Visita: https://www.postgresql.org/download/windows/
```

### macOS
```bash
# Homebrew
brew install postgresql
brew services start postgresql
```

## Paso 2: Crear Base de Datos

```sql
-- Conéctate a PostgreSQL (usando pgAdmin o terminal)
CREATE DATABASE product_catalog;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE product_catalog TO postgres;
```

## Paso 3: Configurar Variables de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/product_catalog?schema=public"
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3001
```

## Paso 4: Generar Cliente Prisma

```bash
npx prisma generate
```

## Paso 5: Crear Migración

```bash
npx prisma migrate dev --name init
```

## Paso 6: Poblar Base de Datos

```bash
node seed-postgres.js
```

## Paso 7: Iniciar Aplicación

```bash
npm run dev
```

## 🔍 Verificación

1. **Catálogo**: http://localhost:3001
2. **Panel Admin**: http://localhost:3001/admin
3. **APIs**: http://localhost:3001/api/products

## 🚨 Problemas Comunes

### Error: "Environment variable not found: DATABASE_URL"
**Solución**: Asegúrate de tener el archivo `.env.local` con la URL correcta

### Error: "Connection refused"
**Solución**: Verifica que PostgreSQL esté corriendo en el puerto 5432

### Error: "Database does not exist"
**Solución**: Crea la base de datos `product_catalog` en PostgreSQL

## 🎯 Listo para Deploy

Una vez configurado localmente, puedes hacer deploy en:
- **Vercel** (con PostgreSQL addon)
- **Railway** (PostgreSQL incluido)
- **Supabase** (PostgreSQL + API)
- **AWS RDS** (PostgreSQL administrado)
