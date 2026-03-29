const bcrypt = require('bcryptjs')

// Datos del admin
const adminData = {
  email: 'admin@tienda.com',
  name: 'Administrador Principal',
  password: 'admin123'
}

// Generar hash de la contraseña
const saltRounds = 12
const hashedPassword = bcrypt.hashSync(adminData.password, saltRounds)

console.log('=== CREDENCIALES DE ADMIN ===')
console.log('Email:', adminData.email)
console.log('Contraseña:', adminData.password)
console.log('Hash generado:', hashedPassword)
console.log('')
console.log('SQL para insertar en la base de datos:')
console.log(`INSERT INTO "Admin" ("id", "email", "password", "name", "role", "active", "createdAt", "updatedAt")`)
console.log(`VALUES ('admin-001', '${adminData.email}', '${hashedPassword}', '${adminData.name}', 'admin', true, datetime('now'), datetime('now'));`)
console.log('')
console.log('O copia y pega este SQL en tu base de datos PostgreSQL')
