# 🛍️ Catálogo de Productos con Panel Administrativo

Sistema web completo para gestión de catálogos de productos con pedidos vía WhatsApp y panel de administración integral.

---

## 🧩 Tecnologías Principales

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **UI Framework**: React 18
- **Estilos**: Tailwind CSS 3.4.1
- **Iconos**: Lucide React 0.263.1
- **Fuentes**: Inter (Google Fonts)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Lenguaje**: TypeScript
- **API REST**: Next.js API Routes

---

## 🗄️ Base de Datos

### Tipo de Base de Datos
- **Motor**: PostgreSQL
- **ORM**: Prisma
- **Conexión**: Variable de entorno `DATABASE_URL`

### Configuración
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5434/product-catalog"
```

### Modelos de Datos
- **Store**: Configuración de la tienda (logo, colores, WhatsApp, redes sociales)
- **Category**: Categorías de productos
- **Product**: Productos con imagen, precio y mensaje WhatsApp
- **Admin**: Usuarios administradores
- **Banner**: Banners promocionales

---

## 🔐 Autenticación

- **Framework**: NextAuth.js 4.24.7
- **Configuración**: JWT y sesiones
- **Variables**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Hashing**: bcryptjs para contraseñas

---

## 📦 Librerías Importantes

### UI y Estilos
- `tailwindcss` - Framework CSS
- `autoprefixer` - PostCSS plugin
- `postcss` - Procesador CSS
- `lucide-react` - Iconos modernos
- `clsx` - Utilidades de clases

### Backend y Base de Datos
- `@prisma/client` - ORM para PostgreSQL
- `prisma` - CLI de Prisma
- `bcryptjs` - Hashing de contraseñas

### Desarrollo
- `typescript` - Tipado estático
- `@types/*` - Definiciones TypeScript
- `eslint` - Linting

---

## ⚙️ Arquitectura del Sistema

### Flujo de Información
```
Frontend (React) → API Routes (Next.js) → Prisma ORM → PostgreSQL
```

### Estructura de Carpetas
```
product-catalog-admin/
├── app/
│   ├── (catalog)/           # Catálogo público
│   │   └── ProductCatalog.tsx
│   ├── admin/              # Panel administrativo
│   ├── api/                # Endpoints API
│   │   ├── auth/           # Autenticación
│   │   ├── products/       # CRUD productos
│   │   ├── categories/     # CRUD categorías
│   │   ├── store/          # Configuración tienda
│   │   ├── banners/        # Gestión banners
│   │   └── upload/         # Subida de archivos
│   ├── components/         # Componentes UI
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── lib/
│   └── prisma.ts           # Cliente Prisma
├── models/                 # Modelos Mongoose (legacy)
├── prisma/
│   └── schema.prisma       # Schema Prisma
├── public/                 # Archivos estáticos
└── seed-data.js           # Datos iniciales
```

---

## 🎯 Funcionalidad del Sistema

### Catálogo Público
- **Visualización de productos**: Grid responsive con imágenes
- **Filtrado por categorías**: Navegación dinámica
- **Búsqueda**: Búsqueda en tiempo real de productos
- **Pedidos vía WhatsApp**: Mensaje automático con datos del producto
- **Branding personalizable**: Colores y logo configurables
- **Banners promocionales**: Carrusel de ofertas
- **Footer personalizable**: Redes sociales, contacto, horarios

### Panel Administrativo
- **Gestión de productos**: CRUD completo
- **Gestión de categorías**: Crear, editar, eliminar
- **Configuración de tienda**: Logo, colores, WhatsApp
- **Gestión de banners**: Banners promocionales
- **Subida de imágenes**: Upload de archivos
- **Activar/desactivar**: Control de visibilidad
- **Autenticación**: Login seguro de administradores

### Casos de Uso
1. **Cliente final**: Navega el catálogo, filtra productos, solicita por WhatsApp
2. **Administrador**: Gestiona inventario, configura tienda, analiza productos
3. **Empresa**: Muestra productos online, recibe pedidos, personaliza branding

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Pasos de Instalación

1. **Clonar repositorio**
```bash
git clone <repository-url>
cd product-catalog-admin
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb product-catalog
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

5. **Ejecutar migraciones**
```bash
npx prisma migrate dev
npx prisma generate
```

6. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

### Acceso a la Aplicación
- **Catálogo público**: http://localhost:3000
- **Panel admin**: http://localhost:3000/admin

---

## 🔧 Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linting del código
```

---

## 📊 Características Técnicas

### Performance
- **SSR/SSG**: Next.js App Router
- **Optimización de imágenes**: Next.js Image
- **Bundle splitting**: Automático con Next.js

### Seguridad
- **Autenticación**: NextAuth.js
- **Hashing**: bcryptjs
- **Validación**: TypeScript + Prisma

### SEO
- **Meta tags**: Configurados en layout
- **URLs amigables**: Estructura semántica
- **Responsive**: Mobile-first

---

## 🌟 Próximas Mejoras

- [ ] Multi-tenant (múltiples tiendas)
- [ ] Dashboard analytics
- [ ] Exportación de catálogo
- [ ] Integración pasarelas de pago
- [ ] Sistema de notificaciones
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)

---

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

---

**Desarrollado con ❤️ usando Next.js, TypeScript y PostgreSQL**
