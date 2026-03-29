const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample data
const store = {
  name: 'Mi Tienda Online',
  logo: 'https://via.placeholder.com/100x100/4169E1/FFFFFF?text=LOGO',
  whatsapp: '5491112345678',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  description: 'Tu tienda de confianza para productos de calidad',
  email: 'contacto@mitienda.com',
  address: 'Av. Principal 123, Ciudad'
};

const categories = [
  { name: 'Perfumes en Gral.', description: 'Perfumes de diversas marcas', active: true },
  { name: 'Mochilas', description: 'Mochilas modernas y funcionales', active: true },
  { name: 'Carteras para Damas', description: 'Carteras elegantes para mujer', active: true },
  { name: 'Bolsos Térmicos', description: 'Bolsos que mantienen la temperatura', active: true },
  { name: 'Lienzos', description: 'Lienzos de alta calidad', active: true },
  { name: 'Joyas Aceros Quirurgicos', description: 'Joyas de acero quirúrgico', active: true },
  { name: 'Cremas en Gral.', description: 'Cremas para el cuidado personal', active: true },
  { name: 'Salud', description: 'Productos de salud y bienestar', active: true }
];

const products = [
  {
    name: 'Perfume Elegance',
    description: 'Perfume floral con notas de jazmín y rosa',
    price: 89.99,
    category: 'Perfumes en Gral.',
    image: 'https://via.placeholder.com/300x300/FF69B4/FFFFFF?text=Perfume+Elegance',
    whatsappMessage: 'Hola, estoy interesado en el Perfume Elegance. ¿Tienen stock?',
    active: true
  },
  {
    name: 'Body Splash Fresh',
    description: 'Spray corporal fresco y duradero',
    price: 45.50,
    category: 'Perfumes en Gral.',
    image: 'https://via.placeholder.com/300x300/87CEEB/FFFFFF?text=Body+Splash+Fresh',
    whatsappMessage: 'Hola, quisiera información sobre el Body Splash Fresh',
    active: true
  },
  {
    name: 'Mochila Urbana',
    description: 'Mochila perfecta para el día a día',
    price: 120.00,
    category: 'Mochilas',
    image: 'https://via.placeholder.com/300x300/4169E1/FFFFFF?text=Mochila+Urbana',
    whatsappMessage: 'Hola, me interesa la Mochila Urbana. ¿Qué colores tienen?',
    active: true
  },
  {
    name: 'Cartera Executive',
    description: 'Cartera de cuero elegante para negocios',
    price: 250.00,
    category: 'Carteras para Damas',
    image: 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Cartera+Executive',
    whatsappMessage: 'Hola, ¿tienen disponible la Cartera Executive?',
    active: true
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clean existing data
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.store.deleteMany();
    console.log('Cleared existing data');
    
    // Create store
    const createdStore = await prisma.store.create({
      data: store
    });
    console.log('Created store:', createdStore.name);
    
    // Create categories
    const createdCategories = await Promise.all(
      categories.map(category => 
        prisma.category.create({
          data: {
            ...category,
            storeId: createdStore.id
          }
        })
      )
    );
    console.log('Created categories:', createdCategories.length);
    
    // Create products
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {});
    
    console.log('Category Map:', categoryMap);
    console.log('Products categories:', products.map(p => ({ name: p.name, category: p.category })));
    
    const createdProducts = await Promise.all(
      products.map(product => {
        const categoryId = categoryMap[product.category];
        if (!categoryId) {
          console.warn(`Category not found for product: ${product.name} (${product.category})`);
          return null;
        }
        
        return prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            whatsappMessage: product.whatsappMessage,
            active: product.active,
            storeId: createdStore.id,
            categoryId: categoryId
          }
        });
      }).filter(Boolean) // Remove null entries
    );
    
    console.log('Created products:', createdProducts.filter(Boolean).length);
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
