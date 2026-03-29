# 🔐 Sistema de Autenticación - Guía de Instalación

## 📋 Requisitos

- Node.js 18+
- PostgreSQL
- Dependencias instaladas

## 🚀 Instalación

### 1. Instalar Dependencias
```bash
npm install jsonwebtoken bcryptjs zod @types/jsonwebtoken @types/bcryptjs
```

### 2. Configurar Variables de Entorno
Crea el archivo `.env.local` en la raíz del proyecto:
```env
JWT_SECRET=super-secret-jwt-key-change-this-in-production-2024
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=development
```

### 3. Ejecutar Migración de Base de Datos
```bash
# Opción A: Usar el script SQL
psql -U username -d database_name < prisma/migrations/add_admins_table.sql

# Opción B: Generar hash manualmente
node scripts/create-admin.js
```

### 4. Generar Cliente Prisma
```bash
npx prisma generate
```

### 5. Iniciar Servidor
```bash
npm run dev
```

## 🔐 Credenciales de Demo

**Email:** `admin@tienda.com`  
**Contraseña:** `admin123`

## 🛡️ Características de Seguridad

- ✅ **Encriptación BCrypt** (12 rounds)
- ✅ **Tokens JWT** con expiración 24h
- ✅ **Cookies HTTP-Only** y seguras
- ✅ **Middleware** de protección de rutas
- ✅ **Validación** con Zod schema
- ✅ **Logout** seguro con eliminación de cookies

## 🔄 Flujo de Autenticación

1. **Login**: POST `/api/auth/login`
   - Validación de email y contraseña
   - Generación de token JWT
   - Cookie segura por 24h

2. **Middleware**: Protección automática
   - Verificación de token en cada request
   - Redirección a login si no autenticado
   - Headers con información del usuario

3. **Logout**: POST `/api/auth/logout`
   - Eliminación de cookie
   - Redirección a login

## 🛡️ Rutas Protegidas

- `/admin` - Panel completo
- `/api/products` - CRUD de productos
- `/api/categories` - CRUD de categorías

## 🌐 Rutas Públicas

- `/` - Catálogo público
- `/login` - Página de login
- `/api/auth/login` - Endpoint de login
- `/api/auth/logout` - Endpoint de logout
- `/api/auth/verify` - Verificación de token

## 🔧 Configuración Adicional

### Cambiar Contraseña de Admin
```javascript
// Ejecutar este script para generar nuevo hash
node scripts/create-admin.js
```

### Personalizar JWT Secret
```env
# En producción, usa una clave fuerte y única
JWT_SECRET=tu-clave-super-secreta-y-única-2024
```

## 🚨 Notas de Seguridad

1. **Cambia el JWT_SECRET** en producción
2. **Usa HTTPS** en producción
3. **Configura firewall** si es necesario
4. **Monitorea logs** de intentos fallidos
5. **Implementa rate limiting** si es necesario

## 📱 Acceso Móvil

1. **Login**: `http://tu-ip:3000/login`
2. **Admin**: `http://tu-ip:3000/admin`
3. **Catálogo**: `http://tu-ip:3000/`

## 🔍 Verificación

Para verificar que todo funciona:

1. **Login** con credenciales de demo
2. **Acceso** a panel admin
3. **Protección** de rutas (intenta acceder sin login)
4. **Logout** y redirección automática

## 🎯 Listo para Producción

Una vez configurado, tu sistema tendrá:
- 🔐 Autenticación segura
- 🛡️ Protección de rutas
- 📱 Soporte móvil
- 🔄 Sesiones persistentes
- 🚪 Panel profesional

---

**¡Listo para usar!** 🎉
