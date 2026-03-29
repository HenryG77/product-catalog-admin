const mongoose = require('mongoose');

// Define schemas directly in this file
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  active: { type: Boolean, default: true },
  whatsappMessage: { type: String, required: true }
}, { timestamps: true });

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, required: true },
  whatsapp: { type: String, required: true },
  primaryColor: { type: String, default: '#3b82f6' },
  secondaryColor: { type: String, default: '#1e40af' },
  description: { type: String, required: true },
  address: { type: String },
  email: { type: String }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);
const Store = mongoose.model('Store', StoreSchema);

// Sample data
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

const store = {
  name: 'Mi Tienda Online',
  logo: 'https://via.placeholder.com/100x100/4169E1/FFFFFF?text=LOGO',
  whatsapp: '5491112345678',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  description: 'Tu tienda de confianza para productos de calidad'
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product-catalog');
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Store.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log('Inserted categories:', insertedCategories.length);
    
    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log('Inserted products:', insertedProducts.length);
    
    // Insert store
    const insertedStore = await Store.create(store);
    console.log('Inserted store:', insertedStore.name);
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
