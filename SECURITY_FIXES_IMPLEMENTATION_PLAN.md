# PLAN DE IMPLEMENTACIÓN DE CORRECCIONES DE SEGURIDAD
**Proyecto:** Product Catalog Admin
**Fecha inicio:** 17 de julio de 2026
**Objetivo:** Score 85-90/100 | Riesgo BAJO
**Tiempo estimado:** 6-8 horas

---

## ESTADO GENERAL

**Score Inicial:** 47/100 (Riesgo ALTO)
**Score Objetivo:** 85-90/100 (Riesgo BAJO)
**Total vulnerabilidades:** 38
**Vulnerabilidades a corregir:**
- Críticas: 3
- Altas: 8
- Medias: 12 (principales)
- Bajas: 6 (seleccionadas)

---

## ESTRATEGIA DE TRABAJO

### Metodología: **TRABAJO POR ETAPAS**
- ✅ Una etapa a la vez
- ✅ Commit después de cada etapa
- ✅ Testing antes de continuar
- ✅ Rollback fácil si algo falla

### Sistema de Commits:
```
git commit -m "Etapa X: [descripción]"
```

---

## ETAPAS DE IMPLEMENTACIÓN

```
ETAPA 1: FUNDACIÓN ⚪ (Sin Riesgo)
├─ Dependencias, headers, configuración
├─ Duración: 30-45 min
└─ Estado: [x] COMPLETADO ✅

ETAPA 2: INFRAESTRUCTURA 🟢 (Nuevos Módulos)
├─ Rate limiting, error handler, validación
├─ Duración: 1-1.5h
└─ Estado: [ ] PENDIENTE

ETAPA 3: AUTENTICACIÓN 🟡 (Crítico)
├─ JWT, secrets, sesiones
├─ Duración: 45 min - 1h
└─ Estado: [ ] PENDIENTE

ETAPA 4: APIs 🔴 (Alto Impacto)
├─ Validación endpoints, IDOR, upload
├─ Duración: 2.5-3.5h
└─ Estado: [ ] PENDIENTE

ETAPA 5: FRONTEND 🟢 (Bajo Riesgo)
├─ localStorage, cookies, formularios
├─ Duración: 30-45 min
└─ Estado: [ ] PENDIENTE

ETAPA 6: VALIDACIÓN FINAL 🔵 (Testing)
├─ Testing integral, verificación
├─ Duración: 1h
└─ Estado: [ ] PENDIENTE
```

---

## 📋 ETAPA 1: FUNDACIÓN

**Objetivo:** Preparar terreno sin romper funcionalidad existente
**Riesgo:** BAJO ⚪
**Duración:** 30-45 min

### Tareas:

#### 1.1 - V-001: Actualizar dependencias
- [x] Actualizar Next.js: `14.2.5` → `14.2.35` (o `15.5.16+`)
- [x] Actualizar postcss a última versión
- [x] Actualizar eslint-config-next
- [x] Ejecutar `npm audit fix`
- [x] Archivo: `package.json`

#### 1.2 - V-008: Headers de seguridad HTTP
- [x] Configurar headers en `next.config.js`
- [x] Headers a agregar:
  - Strict-Transport-Security
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy
  - Content-Security-Policy
- [x] Archivo: `next.config.js`

#### 1.3 - V-007: Limpiar .env del repositorio
- [x] Verificar que `.env` esté en `.gitignore`
- [x] Agregar `.env.local` y `.env.*.local` a `.gitignore`
- [x] Remover `.env` del staging: `git rm --cached .env`
- [x] Archivo: `.gitignore`

#### 1.4 - Crear .env.example
- [x] Crear archivo `.env.example` con placeholders
- [x] NO incluir valores reales
- [x] Documentar cada variable
- [x] Archivo: `.env.example` (NUEVO)

### Verificación Etapa 1:
```bash
# 1. Instalación
[x] npm install
[x] Sin errores de dependencias

# 2. Build
[x] npm run build
[x] Build exitoso sin errores

# 3. Servidor dev
[x] npm run dev
[x] Inicia correctamente

# 4. Testing funcional
[x] Abrir http://localhost:3000
[x] Login funciona
[x] Ver productos funciona
[x] Panel admin accesible

# 5. Verificar headers (DevTools → Network → Headers)
[x] X-Frame-Options presente
[x] CSP presente
[x] HSTS presente

# 6. Git
[x] git status (verificar .env no está staged)
[x] git add .
[x] git commit -m "Etapa 1: Security - Update dependencies and add security headers"
```

---

## 📋 ETAPA 2: INFRAESTRUCTURA

**Objetivo:** Crear utilidades sin modificar código existente
**Riesgo:** NINGUNO 🟢 (archivos nuevos)
**Duración:** 1-1.5h

### Tareas:

#### 2.1 - Instalar dependencias necesarias
- [ ] `npm install zod`
- [ ] Verificar instalación correcta

#### 2.2 - Crear lib/rate-limit.ts
- [ ] Crear archivo nuevo
- [ ] Implementar clase RateLimiter
- [ ] Exportar loginLimiter, apiLimiter, uploadLimiter
- [ ] Exportar función getClientIp
- [ ] Archivo: `lib/rate-limit.ts` (NUEVO)

#### 2.3 - Crear lib/error-handler.ts
- [ ] Crear archivo nuevo
- [ ] Implementar handleApiError
- [ ] Logging apropiado (ocultar stack en producción)
- [ ] Archivo: `lib/error-handler.ts` (NUEVO)

#### 2.4 - Crear lib/validation.ts
- [ ] Crear archivo nuevo
- [ ] Schemas Zod para:
  - ProductSchema
  - CategorySchema
  - BannerSchema
  - UserSchema (create)
  - UserUpdateSchema
  - LoginSchema
- [ ] Archivo: `lib/validation.ts` (NUEVO)

### Verificación Etapa 2:
```bash
# 1. Compilación TypeScript
[ ] npm run build
[ ] Sin errores de tipos

# 2. Imports
[ ] Archivos compilan correctamente
[ ] No hay errores de sintaxis

# 3. App funciona igual
[ ] npm run dev
[ ] Login funciona (sin cambios)
[ ] Ver productos funciona (sin cambios)

# 4. Git
[ ] git add lib/rate-limit.ts lib/error-handler.ts lib/validation.ts
[ ] git commit -m "Etapa 2: Security - Add infrastructure utilities"
```

---

## 📋 ETAPA 3: AUTENTICACIÓN

**Objetivo:** Mejorar seguridad de autenticación
**Riesgo:** MEDIO 🟡 (afecta sesiones)
**Duración:** 45 min - 1h

### ⚠️ ADVERTENCIA:
- Cambiar JWT_SECRET invalidará todos los tokens existentes
- Usuarios tendrán que hacer login nuevamente
- Hacer en horario de bajo tráfico si es posible

### Tareas:

#### 3.1 - V-004: Generar nuevos secretos JWT
- [ ] Generar JWT_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
- [ ] Generar NEXTAUTH_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
- [ ] Actualizar `.env` con nuevos valores
- [ ] NO commitear .env
- [ ] Actualizar `.env.example` con comentarios
- [ ] Archivo: `.env`, `.env.example`

#### 3.2 - V-004: Validación de JWT_SECRET en startup
- [ ] Agregar validación en `lib/auth.ts`
- [ ] Lanzar error si JWT_SECRET < 64 caracteres
- [ ] Implementar rotación de secretos (JWT_SECRET_OLD)
- [ ] Archivo: `lib/auth.ts`

#### 3.3 - V-012: Cookie SameSite=strict
- [ ] Cambiar `sameSite: 'lax'` → `sameSite: 'strict'`
- [ ] Asegurar `secure: true` en producción
- [ ] Archivo: `app/api/auth/login/route.ts`

#### 3.4 - V-018: Timeout de inactividad
- [ ] Agregar `lastActivity` a JWTPayload
- [ ] Implementar verificación de inactividad (30 min)
- [ ] Actualizar `lastActivity` en middleware
- [ ] Archivo: `lib/auth.ts`, `middleware.ts`

#### 3.5 - V-014: Contraseñas temporales más fuertes
- [ ] Reescribir `generateTemporaryPassword()`
- [ ] Usar crypto.randomInt en lugar de Math.random
- [ ] Generar password de 16 caracteres
- [ ] Incluir mayúsculas, minúsculas, números, símbolos
- [ ] Archivo: `lib/password.ts`

#### 3.6 - V-015: Prevenir enumeración de usuarios
- [ ] Mismo mensaje para usuario no existe y cuenta desactivada
- [ ] Timing constante (hash dummy si usuario no existe)
- [ ] Archivo: `app/api/auth/login/route.ts`

### Verificación Etapa 3:
```bash
# 1. Compilación
[ ] npm run build
[ ] Sin errores

# 2. Testing manual - Login
[ ] Logout de todas las sesiones
[ ] Login con usuario existente → Éxito
[ ] Verificar cookie en DevTools
[ ] Cookie tiene SameSite=strict
[ ] Cookie tiene secure=true (en producción)

# 3. Testing - Reset password
[ ] Resetear password de usuario
[ ] Verificar contraseña temporal generada (16+ chars, compleja)
[ ] Login con contraseña temporal → Éxito
[ ] Cambiar contraseña → Éxito

# 4. Testing - Enumeración
[ ] Login con email inexistente → Mensaje genérico
[ ] Login con email válido pero cuenta desactivada → Mensaje genérico (igual)

# 5. Testing - Inactividad
[ ] Login exitoso
[ ] Esperar 31 minutos (o modificar timeout para testing)
[ ] Hacer request → Debe rechazar por inactividad

# 6. Git
[ ] git add .
[ ] git commit -m "Etapa 3: Security - Improve authentication (JWT rotation, cookies, sessions)"
```

---

## 📋 ETAPA 4: APIs (MÁS IMPORTANTE)

**Objetivo:** Asegurar todos los endpoints
**Riesgo:** ALTO 🔴 (afecta funcionalidad crítica)
**Duración:** 2.5-3.5h

### ⚠️ PUNTOS CRÍTICOS:
- Validación muy estricta puede rechazar requests legítimos
- Upload es funcionalidad crítica
- IDOR requiere entender arquitectura multi-tenant
- Testing exhaustivo requerido después de cada sub-tarea

---

### 4.1 - V-005: Rate limiting en login

- [ ] Importar loginLimiter en `app/api/auth/login/route.ts`
- [ ] Agregar verificación al inicio del POST
- [ ] Límite: 5 intentos por 15 minutos por IP
- [ ] Retornar 429 si excede
- [ ] Archivo: `app/api/auth/login/route.ts`

**Testing 4.1:**
```bash
[ ] Login normal → Éxito
[ ] Intentar login 5 veces → OK
[ ] Intento 6 → Error 429 "Demasiados intentos"
[ ] Esperar 15 min (o limpiar cache) → Login OK nuevamente
```

---

### 4.2 - V-003 + V-009: Asegurar /api/upload COMPLETAMENTE

**REESCRITURA COMPLETA DEL ENDPOINT**

- [ ] Importar path, crypto, mkdir
- [ ] Validación de tamaño: MAX 5MB
- [ ] Validación de tipo MIME: solo imágenes
- [ ] Validación de extensión: .jpg, .jpeg, .png, .webp, .gif
- [ ] Generar nombre aleatorio (NO usar file.name)
- [ ] Validación de path traversal
- [ ] Validación de magic bytes (primeros bytes del archivo)
- [ ] Rate limiting: 10 uploads por hora
- [ ] Archivo: `app/api/upload/route.ts`

**Testing 4.2 (CRÍTICO - MUY IMPORTANTE):**
```bash
[ ] Upload imagen JPG válida (1MB) → Éxito, archivo guardado
[ ] Upload imagen PNG válida (2MB) → Éxito
[ ] Upload archivo 6MB → Error 400 "File too large"
[ ] Upload archivo .php → Error 400 "Invalid file type"
[ ] Upload con filename "../../../etc/passwd" → Error 400 "Invalid path"
[ ] Upload .jpg con contenido de texto → Error 400 "Invalid file format" (magic bytes)
[ ] Verificar archivo guardado con nombre aleatorio (no file.name)
[ ] Verificar archivo NO está en public/ (debe estar en private-uploads/)
[ ] 11 uploads en 1 hora → Último rechazado por rate limit
```

---

### 4.3 - V-002 + V-011: Validación Zod en endpoints

**IMPORTANTE:** Hacer UNO a la vez, testing después de cada uno

#### 4.3.1 - /api/admin/users (POST)
- [ ] Importar schemas de `lib/validation.ts`
- [ ] Validar body con UserSchema
- [ ] Retornar 400 si validación falla
- [ ] Archivo: `app/api/admin/users/route.ts`

**Testing 4.3.1:**
```bash
[ ] Crear usuario válido → Éxito
[ ] Crear usuario sin email → Error 400 con detalles
[ ] Crear usuario con email inválido → Error 400
[ ] Crear usuario con password < 8 chars → Error 400
[ ] Crear usuario con rol inválido → Error 400
```

#### 4.3.2 - /api/admin/users (GET con filtros)
- [ ] Validar parámetros search, role, active
- [ ] Sanitizar inputs (regex permitiendo solo caracteres seguros)
- [ ] Prevenir NoSQL injection
- [ ] Archivo: `app/api/admin/users/route.ts`

**Testing 4.3.2:**
```bash
[ ] GET /api/admin/users → Lista todos
[ ] GET /api/admin/users?search=admin → Filtra correctamente
[ ] GET /api/admin/users?role=superadmin → Filtra por rol
[ ] GET /api/admin/users?search={"$ne": null} → Rechaza (injection attempt)
```

#### 4.3.3 - /api/admin/users/[id] (PUT)
- [ ] Validar con UserUpdateSchema
- [ ] Verificar que usuario existe primero
- [ ] Archivo: `app/api/admin/users/[id]/route.ts`

**Testing 4.3.3:**
```bash
[ ] Actualizar usuario válido → Éxito
[ ] Actualizar con datos inválidos → Error 400
[ ] Actualizar usuario inexistente → Error 404
```

#### 4.3.4 - /api/products (POST)
- [ ] Validar con ProductSchema
- [ ] Archivo: `app/api/products/route.ts`

**Testing 4.3.4:**
```bash
[ ] Crear producto válido → Éxito
[ ] Crear producto sin nombre → Error 400
[ ] Crear producto con precio negativo → Error 400
[ ] Crear producto con URL de imagen inválida → Error 400
```

#### 4.3.5 - /api/products/[id] (PUT)
- [ ] Validar con ProductSchema.partial()
- [ ] Archivo: `app/api/products/[id]/route.ts`

**Testing 4.3.5:**
```bash
[ ] Actualizar producto válido → Éxito
[ ] Actualizar con datos inválidos → Error 400
```

#### 4.3.6 - /api/categories (POST, PUT)
- [ ] Validar con CategorySchema
- [ ] Archivo: `app/api/categories/route.ts`

**Testing 4.3.6:**
```bash
[ ] Crear categoría válida → Éxito
[ ] Actualizar categoría válida → Éxito
[ ] Crear categoría sin nombre → Error 400
```

#### 4.3.7 - /api/banners (POST)
- [ ] Validar con BannerSchema
- [ ] Archivo: `app/api/banners/route.ts`

**Testing 4.3.7:**
```bash
[ ] Crear banner válido → Éxito
[ ] Crear banner sin imagen → Error 400
```

---

### 4.4 - V-006: IDOR - Ownership validation

**NOTA:** Esto requiere entender la arquitectura multi-tenant.
**PREGUNTA:** ¿Hay relación Admin → Store en el schema actual?

Si NO hay relación Admin-Store:
- [ ] **OPCIÓN A:** Agregar relación en schema Prisma (requiere migración)
- [ ] **OPCIÓN B:** Validar solo para superadmin (admins pueden ver todo)

Si SÍ hay relación:
- [ ] Implementar validación de ownership en:
  - [ ] /api/products/[id] (GET, PUT, DELETE)
  - [ ] /api/categories/[id] (GET, PUT, DELETE)
  - [ ] /api/banners/[id] (GET, PUT, DELETE)

**Lógica:**
```typescript
// Superadmin puede acceder a todo
if (userRole === 'superadmin') {
  // permitir
}

// Admin solo puede acceder a recursos de su tienda
const admin = await db.admin.findUnique({
  where: { id: userId },
  include: { store: true }
})

if (resource.storeId !== admin.storeId) {
  return 403 Forbidden
}
```

**Testing 4.4:**
```bash
[ ] Login como superadmin → Puede ver/editar todos los productos
[ ] Login como admin de tienda A → Solo ve productos de tienda A
[ ] Login como admin de tienda A → Intentar editar producto de tienda B → Error 403
```

---

### 4.5 - V-010: Error handler centralizado

- [ ] Reemplazar todos los try/catch con handleApiError
- [ ] Archivos a modificar:
  - [ ] /api/admin/users/route.ts
  - [ ] /api/admin/users/[id]/route.ts
  - [ ] /api/admin/users/[id]/reset-password/route.ts
  - [ ] /api/auth/login/route.ts
  - [ ] /api/auth/verify/route.ts
  - [ ] /api/auth/logout/route.ts
  - [ ] /api/auth/change-password/route.ts
  - [ ] /api/products/route.ts
  - [ ] /api/products/[id]/route.ts
  - [ ] /api/categories/route.ts
  - [ ] /api/banners/route.ts
  - [ ] /api/store/route.ts
  - [ ] /api/upload/route.ts

**Testing 4.5:**
```bash
[ ] Forzar error (ej: DB desconectada)
[ ] Verificar respuesta NO incluye stack trace
[ ] Verificar respuesta NO revela rutas internas
[ ] Verificar error genérico en producción
[ ] Verificar error detallado solo en development
```

---

### 4.6 - Rate limiting en otros endpoints críticos
- [ ] /api/admin/users → 100 requests/min
- [ ] /api/products → 200 requests/min
- [ ] /api/upload → 10 uploads/hora (ya hecho en 4.2)

---

### Verificación Final Etapa 4 (EXHAUSTIVA):
```bash
# CRUD Completo
[ ] Login como admin → Éxito
[ ] Crear usuario → Éxito
[ ] Editar usuario → Éxito
[ ] Eliminar usuario → Éxito
[ ] Crear producto → Éxito
[ ] Editar producto → Éxito
[ ] Eliminar producto → Éxito
[ ] Crear categoría → Éxito
[ ] Editar categoría → Éxito
[ ] Crear banner → Éxito
[ ] Upload imagen → Éxito

# Testing de Seguridad
[ ] Intentar NoSQL injection en búsqueda → Rechazado
[ ] Intentar upload .php → Rechazado
[ ] Intentar upload con ../ → Rechazado
[ ] Intentar 10 logins rápidos → Bloqueado
[ ] Crear producto con datos inválidos → Rechazado 400
[ ] Acceder producto de otra tienda → 403 (si IDOR implementado)

# Frontend funciona
[ ] Catálogo público funciona
[ ] Panel admin funciona
[ ] Todos los formularios funcionan

# Git
[ ] git add .
[ ] git commit -m "Etapa 4: Security - Secure API endpoints (validation, IDOR, upload, rate-limit)"
```

---

## 📋 ETAPA 5: FRONTEND

**Objetivo:** Mejoras del lado cliente
**Riesgo:** BAJO 🟢
**Duración:** 30-45 min

### Tareas:

#### 5.1 - V-013: Remover localStorage, usar sessionStorage
- [ ] Cambiar `localStorage.setItem` → `sessionStorage.setItem`
- [ ] Cambiar `localStorage.getItem` → `sessionStorage.getItem`
- [ ] Archivo: `app/login/page.tsx`

#### 5.2 - V-016: Validar dominios de imágenes
- [ ] Actualizar configuración de next/image
- [ ] Usar `remotePatterns` en lugar de `domains`
- [ ] Restricción estricta de protocolos y paths
- [ ] Archivo: `next.config.js`

#### 5.3 - Mejoras menores en formularios
- [ ] Validación de email en cliente
- [ ] Validación de password en cliente
- [ ] Mensajes de error claros

### Verificación Etapa 5:
```bash
# Testing
[ ] Login → Éxito
[ ] Cambio de password forzado → Éxito
[ ] tempToken en sessionStorage (no localStorage)
[ ] Cerrar pestaña → sessionStorage se limpia
[ ] Formularios validan correctamente

# Git
[ ] git add .
[ ] git commit -m "Etapa 5: Security - Frontend security improvements"
```

---

## 📋 ETAPA 6: VALIDACIÓN FINAL

**Objetivo:** Testing integral y documentación
**Riesgo:** NINGUNO 🔵
**Duración:** 1h

### Testing Integral:

#### 6.1 - Testing funcional completo
```bash
[ ] npm run build (producción)
[ ] Build sin errores
[ ] Build sin warnings críticos
[ ] npm run start
[ ] Servidor producción inicia OK
```

#### 6.2 - Testing de flujos completos
```bash
# Flujo 1: Administración de usuarios
[ ] Login como superadmin
[ ] Crear nuevo admin
[ ] Ver lista de usuarios
[ ] Editar usuario
[ ] Resetear password
[ ] Login con password temporal
[ ] Cambiar password
[ ] Eliminar usuario
[ ] Logout

# Flujo 2: Gestión de catálogo
[ ] Login como admin
[ ] Crear categoría
[ ] Crear producto en categoría
[ ] Upload imagen de producto
[ ] Editar producto
[ ] Desactivar producto
[ ] Ver catálogo público
[ ] Producto desactivado no aparece

# Flujo 3: Configuración
[ ] Editar configuración de tienda
[ ] Upload logo
[ ] Cambiar colores
[ ] Configurar redes sociales
[ ] Ver cambios en catálogo público
```

#### 6.3 - Testing de seguridad
```bash
# Injection
[ ] Búsqueda con caracteres especiales → OK (sanitizado)
[ ] Búsqueda con {"$ne": null} → Rechazado

# Upload
[ ] Upload JPG → OK
[ ] Upload PNG → OK
[ ] Upload .php → Rechazado
[ ] Upload archivo gigante → Rechazado
[ ] Upload con ../ en nombre → Rechazado

# Rate Limiting
[ ] 10 logins rápidos → Bloqueado en el 6to
[ ] Esperar timeout → Login OK nuevamente

# Headers
[ ] Verificar en DevTools → Network → Headers:
  [ ] X-Frame-Options: SAMEORIGIN
  [ ] X-Content-Type-Options: nosniff
  [ ] Strict-Transport-Security presente
  [ ] Content-Security-Policy presente

# Cookies
[ ] Cookie auth-token:
  [ ] HttpOnly: true
  [ ] Secure: true (en producción)
  [ ] SameSite: strict

# Errores
[ ] Forzar error 500 → Mensaje genérico (sin stack trace)
```

#### 6.4 - Verificar vulnerabilidades corregidas

Revisar cada una:
```bash
CRÍTICAS:
[ ] V-001: npm audit → 0 vulnerabilidades críticas
[ ] V-002: NoSQL injection → Validación Zod implementada
[ ] V-003: Upload → Completamente asegurado

ALTAS:
[ ] V-004: JWT secret → Seguro y rotable
[ ] V-005: Rate limiting → Implementado
[ ] V-006: IDOR → Ownership validation
[ ] V-007: .env → Removido de git
[ ] V-008: Headers → Todos implementados
[ ] V-009: Path traversal → Prevenido
[ ] V-010: Errores → Handler centralizado

MEDIAS:
[ ] V-011: Validación servidor → Zod en todos los endpoints
[ ] V-012: Cookie SameSite → strict
[ ] V-013: localStorage → Cambiado a sessionStorage
[ ] V-014: Passwords temporales → Criptográficamente seguras
[ ] V-015: Enumeración usuarios → Prevenida
[ ] V-016: Validación imágenes → remotePatterns
```

#### 6.5 - Crear documentación de cambios
- [ ] Actualizar README con nuevas env vars
- [ ] Documentar cambios de seguridad
- [ ] Listar breaking changes (si existen)

#### 6.6 - Reporte final
- [ ] Crear documento con:
  - [ ] Lista de vulnerabilidades corregidas
  - [ ] Score antes/después
  - [ ] Nuevas configuraciones requeridas
  - [ ] Breaking changes
  - [ ] Instrucciones de deployment

### Git Final:
```bash
[ ] git add .
[ ] git commit -m "Etapa 6: Security - Final validation and documentation"
[ ] git tag v1.0.0-security-hardened
```

---

## 📊 VERIFICACIÓN DE SCORE FINAL

### Recalcular score por categoría:

| Categoría | Score Inicial | Score Objetivo | Score Real |
|-----------|---------------|----------------|------------|
| Arquitectura | 65/100 | 70/100 | ___ |
| Autenticación | 50/100 | 85/100 | ___ |
| Autorización | 45/100 | 80/100 | ___ |
| Gestión de sesiones | 40/100 | 85/100 | ___ |
| Protección de APIs | 30/100 | 80/100 | ___ |
| Validación de entradas | 35/100 | 90/100 | ___ |
| Protección contra Inyecciones | 25/100 | 90/100 | ___ |
| Base de datos | 55/100 | 85/100 | ___ |
| Gestión de secretos | 20/100 | 90/100 | ___ |
| Variables de entorno | 40/100 | 95/100 | ___ |
| Configuración del servidor | 15/100 | 85/100 | ___ |
| Seguridad del Frontend | 60/100 | 80/100 | ___ |
| Seguridad del Backend | 45/100 | 80/100 | ___ |
| Gestión de archivos | 10/100 | 90/100 | ___ |
| Criptografía | 70/100 | 85/100 | ___ |
| Cabeceras HTTP | 0/100 | 95/100 | ___ |
| Manejo de errores | 35/100 | 85/100 | ___ |
| Logging | 50/100 | 60/100 | ___ |
| Dependencias | 20/100 | 95/100 | ___ |
| Configuración general | 45/100 | 75/100 | ___ |

**Score Inicial:** 47/100
**Score Objetivo:** 85-90/100
**Score Final Real:** ___/100

---

## ⚠️ PLAN DE CONTINGENCIA

### Si algo falla:

1. **No panicarse**
2. **Identificar en qué etapa ocurrió el error**
3. **Rollback:**
   ```bash
   git log --oneline  # Ver commits
   git reset --hard HEAD~1  # Volver 1 commit atrás
   ```
4. **Analizar el error**
5. **Corregir en rama separada si es necesario**
6. **Re-testing**
7. **Aplicar nuevamente**

### Puntos críticos de atención:

| Punto Crítico | Qué puede fallar | Solución |
|---------------|------------------|----------|
| Cambio JWT_SECRET | Todos los usuarios deslogueados | Normal, esperado |
| Upload reescrito | Funcionalidad de upload no funciona | Rollback, revisar código |
| Validación Zod muy estricta | Rechaza requests válidos | Ajustar schemas, hacer menos estrictos |
| IDOR implementado mal | Admins no pueden acceder a sus propios recursos | Revisar lógica de ownership |
| Rate limiting muy agresivo | Bloquea usuarios legítimos | Ajustar límites |

---

## 📝 NOTAS IMPORTANTES

### Antes de empezar:
- [ ] Hacer backup de la base de datos
- [ ] Tener una copia del .env actual
- [ ] Asegurar que tienes acceso de superadmin

### Durante la implementación:
- Hacer commit después de cada etapa
- Testing exhaustivo antes de continuar
- No saltear verificaciones
- Documentar cualquier desviación del plan

### Después de completar:
- Actualizar documentación
- Notificar a usuarios de cambios (si aplica)
- Monitorear errores en las primeras 24h
- Considerar rollback si hay problemas críticos

---

## ✅ CHECKLIST FINAL

Al completar todas las etapas:

```bash
[ ] Todas las etapas 1-6 completadas
[ ] Todos los tests pasan
[ ] npm run build exitoso
[ ] Score objetivo alcanzado (85-90/100)
[ ] Documentación actualizada
[ ] Git history limpio con commits descriptivos
[ ] .env removido de git
[ ] Secretos rotados
[ ] Testing de seguridad completo
[ ] No hay vulnerabilidades críticas
[ ] No hay vulnerabilidades altas
[ ] Aplicación funciona perfectamente
```

**LISTO PARA PRODUCCIÓN** ✅

---

## 🚀 DEPLOYMENT

Una vez completado y verificado:

1. [ ] Generar nuevo .env para producción con secretos nuevos
2. [ ] Configurar variables de entorno en plataforma de hosting
3. [ ] Deploy a staging primero
4. [ ] Testing en staging
5. [ ] Deploy a producción
6. [ ] Monitoreo post-deployment

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**

*Este documento es la guía maestra para todas las correcciones de seguridad*
*Consultar y checkear cada paso antes de proceder*
