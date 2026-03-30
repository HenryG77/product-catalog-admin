# Catálogo de Productos + Admin

Sistema web completo para catálogo de productos con panel de administración y pedidos por WhatsApp.

## 🚀 Características

### Catálogo Público
- ✅ Mostrar productos con imágenes
- ✅ Filtrar por categorías
- ✅ Buscar productos
- ✅ Pedidos vía WhatsApp con mensaje automático
- ✅ Diseño responsive y moderno
- ✅ Personalización de colores y branding

### Panel Admin
- ✅ CRUD de productos
- ✅ CRUD de categorías
- ✅ Configuración de tienda
- ✅ Subida de imágenes
- ✅ Activar/desactivar productos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB + Mongoose
- **Estilos**: Tailwind CSS
- **Icons**: Lucide React
- **Deploy**: Vercel

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno en `.env.local`: (Usar nomas ya postgres)
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5434/product-catalog"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Iniciar MongoDB localmente o configurar MongoDB Atlas (Se utiliza ahora PostgreSQL)

5. Ejecutar en desarrollo:
```bash
npm run dev
```

## 🏗️ Estructura del Proyecto

```
product-catalog-admin/
├── app/
│   ├── (catalog)/           # Catálogo público
│   │   └── ProductCatalog.tsx
│   ├── admin/              # Panel admin
│   ├── api/                # APIs
│   │   ├── products/
│   │   ├── categories/
│   │   └── store/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── mongodb.ts
├── models/
│   ├── Product.ts
│   ├── Category.ts
│   └── Store.ts
├── components/
├── public/
└── package.json
```

## 🎯 MVP Funcional

El sistema está diseñado para ser:

1. **Simple**: Fácil de usar y mantener
2. **Rápido**: Optimizado para conversión
3. **Reusable**: Fácil de desplegar para múltiples clientes
4. **Escalable**: Arquitectura modular para futuras mejoras

## 🚀 Deploy

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Manual
```bash
npm run build
npm start
```

## 📈 Próximas Mejoras

- [ ] Sistema de autenticación mejorado
- [ ] Dashboard analytics
- [ ] Multi-tenant (múltiples tiendas)
- [ ] Exportación de catálogo
- [ ] Integración con pasarelas de pago
- [ ] Sistema de notificaciones

## 📄 Licencia

MIT License - Libre para uso comercial
