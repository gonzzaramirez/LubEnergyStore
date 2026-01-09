import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Configurar Prisma con el adaptador de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  // Configuración del admin - CAMBIAR ESTOS VALORES
  const adminData = {
    email: 'admin@lubenergystore.com',
    password: 'AdminSeguro123!', // Cambiar por una contraseña segura
    firstName: 'Admin',
    lastName: 'LubEnergy',
    phone: '+54000000000',
  };

  console.log('🔐 Creando usuario administrador...\n');

  // Verificar si ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminData.email },
  });

  if (existingAdmin) {
    console.log('⚠️  Ya existe un usuario con ese email.');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Rol: ${existingAdmin.role}`);
    
    // Preguntar si quiere actualizar la contraseña
    const updatePassword = process.argv.includes('--update-password');
    
    if (updatePassword) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      await prisma.user.update({
        where: { email: adminData.email },
        data: { passwordHash: hashedPassword },
      });
      console.log('✅ Contraseña actualizada');
    }
    
    return;
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  // Crear el admin
  const admin = await prisma.user.create({
    data: {
      email: adminData.email,
      passwordHash: hashedPassword,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      phone: adminData.phone,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Administrador creado exitosamente!\n');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Contraseña:', adminData.password);
  console.log('👤 Nombre:', `${admin.firstName} ${admin.lastName}`);
  console.log('🎭 Rol:', admin.role);
  console.log('\n⚠️  IMPORTANTE: Cambiá la contraseña después del primer login!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
