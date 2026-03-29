// Script para verificar datos de APIs
async function checkData() {
  try {
    console.log('=== VERIFICANDO DATOS ===\n')
    
    // Verificar products
    const productsRes = await fetch('http://localhost:3000/api/products')
    const productsData = await productsRes.json()
    console.log('PRODUCTOS:', productsData.length || 'Error:', productsData.error)
    
    // Verificar categories
    const categoriesRes = await fetch('http://localhost:3000/api/categories')
    const categoriesData = await categoriesRes.json()
    console.log('CATEGORÍAS:', categoriesData.length || 'Error:', categoriesData.error)
    
    // Verificar store
    const storeRes = await fetch('http://localhost:3000/api/store')
    const storeData = await storeRes.json()
    console.log('TIENDA:', storeData?.name || 'Error:', storeData?.error)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkData()
