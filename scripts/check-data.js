const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    const products = await prisma.product.findMany()
    const categories = await prisma.category.findMany()
    const store = await prisma.store.findFirst()
    
    console.log('=== PRODUCTOS ===')
    console.log(`Total: ${products.length}`)
    products.forEach(p => console.log(`- ${p.name}: ${p.image}`))
    
    console.log('\n=== CATEGORIAS ===')
    console.log(`Total: ${categories.length}`)
    categories.forEach(c => console.log(`- ${c.name}`))
    
    console.log('\n=== TIENDA ===')
    console.log(store ? `- ${store.name}` : 'No hay tienda')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
