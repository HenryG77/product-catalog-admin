# Migración a PostgreSQL + Prisma

## 🔄 Cambios Realizados

### 📦 Dependencias
- ❌ Removido: `mongodb`, `mongoose`
- ✅ Agregado: `@prisma/client`, `prisma`

### 🗄️ Base de Datos
- **Antes**: MongoDB con Mongoose
- **Ahora**: PostgreSQL con Prisma ORM

### 📁 Archivos Nuevos
- `prisma/schema.prisma` - Esquema de base de datos
- `lib/prisma.ts` - Cliente Prisma
- `seed-postgres.js` - Datos de ejemplo para PostgreSQL
- `.env.example` - Variables de entorno ejemplo

## 🚀 Configuración

### 1. Instalar PostgreSQL
```bash
# Windows (con Chocolatey)
choco install postgresql

# O descargar desde: https://www.postgresql.org/download/
```

### 2. Crear Base de Datos
```sql
CREATE DATABASE product_catalog;
CREATE USER catalog_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE product_catalog TO catalog_user;
```

### 3. Configurar Variables de Entorno
```env
DATABASE_URL="postgresql://catalog_user:tu_password@localhost:5432/product_catalog?schema=public"
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001
```

### 4. Generar Prisma Client
```bash
npx prisma generate
```

### 5. Migrar Base de Datos
```bash
npx prisma migrate dev --name init
```

### 6. Poblar con Datos de Ejemplo
```bash
node seed-postgres.js
```

## 🏗️ Estructura de Base de Datos

### Store (Tienda)
- id, name, logo, whatsapp
- primaryColor, secondaryColor
- description, email, address
- timestamps

### Category (Categoría)
- id, name, description, active
- storeId (relación con tienda)
- timestamps

### Product (Producto)
- id, name, description, price
- image, whatsappMessage, active
- storeId, categoryId (relaciones)
- timestamps

## 🎯 Ventajas de PostgreSQL + Prisma

### ✅ PostgreSQL
- Base de datos relacional robusta
- Mejor para hosting en la nube
- Soporte en la mayoría de proveedores
- Transacciones ACID completas

### ✅ Prisma
- Type safety completo
- Autocompletado en IDE
- Migraciones automáticas
- Mejor rendimiento con queries optimizados

## 🚀 Deploy en Nube

### Opciones de Hosting
- **Vercel** (con PostgreSQL addon)
- **Railway** (PostgreSQL incluido)
- **Supabase** (PostgreSQL + API)
- **AWS RDS** (PostgreSQL administrado)
- **DigitalOcean** (PostgreSQL managed)

### Configuración para Producción
1. Subir código a repositorio
2. Configurar variables de entorno
3. Ejecutar migraciones
4. Poblar datos iniciales

## 🔄 Próximos Pasos

1. **Configurar PostgreSQL local**
2. **Probar migraciones**
3. **Validar APIs con nueva BD**
4. **Mejorar personalización visual**
5. **Agregar autenticación**
6. **Preparar para deploy**
