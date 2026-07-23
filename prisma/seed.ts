import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear SUPERADMIN
  const superAdminEmail = 'admin@hentech.com'
  const superAdminPassword = 'SuperAdmin2024!'

  // Verificar si ya existe
  const existingSuperAdmin = await prisma.admin.findUnique({
    where: { email: superAdminEmail }
  })

  if (existingSuperAdmin) {
    console.log('⚠️  Ya existe un SUPERADMIN con el email:', superAdminEmail)
    console.log('   Actualizando contraseña...')

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

    await prisma.admin.update({
      where: { email: superAdminEmail },
      data: {
        password: hashedPassword,
        role: 'superadmin',
        active: true
      }
    })

    console.log('✅ SUPERADMIN actualizado')
  } else {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

    const superAdmin = await prisma.admin.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Administrador',
        role: 'superadmin',
        active: true
      }
    })

    console.log('✅ SUPERADMIN creado:', superAdmin.email)
  }

  console.log('\n📋 Credenciales del SUPERADMIN:')
  console.log('   Email:', superAdminEmail)
  console.log('   Password:', superAdminPassword)
  console.log('\n⚠️  IMPORTANTE: Cambia estas credenciales en producción!\n')

  // Verificar si hay tiendas, si no crear una de ejemplo
  const storeCount = await prisma.store.count()

  if (storeCount === 0) {
    console.log('🏪 No hay tiendas, creando tienda de ejemplo...')

    const store = await prisma.store.create({
      data: {
        name: 'HenTech Store',
        logo: '/logo.png',
        whatsapp: '+595981234567',
        description: 'Tu tienda de tecnología de confianza',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        footerCopyright: '© 2024 HenTech. Todos los derechos reservados.'
      }
    })

    console.log('✅ Tienda creada:', store.name)
  }

  console.log('\n🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
