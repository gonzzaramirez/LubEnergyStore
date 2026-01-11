const { PrismaClient } = require('@prisma/client');

async function fixMigrations() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Marcando migraciones como aplicadas...');

    // Marcar todas las migraciones como aplicadas
    const migrations = [
      '20250613000000_remove_delivered_status',
      '20260108201403_add_guest_customers_and_orders',
      '20260109001007_add_is_featured',
      '20260109012512_add_promotions_and_discount_codes',
      '20260111135411_add_product_flavors'
    ];

    for (const migration of migrations) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
          VALUES (${migration}, '', NOW(), ${migration}, '', NULL, NOW(), 1)
          ON CONFLICT ("id") DO NOTHING;
        `;
        console.log(`✅ Migración ${migration} marcada como aplicada`);
      } catch (error) {
        console.log(`⚠️  Migración ${migration} ya estaba aplicada o error: ${error.message}`);
      }
    }

    console.log('🎉 Todas las migraciones han sido procesadas!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrations();