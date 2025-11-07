const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    for (const role of roles) {
      console.log(`Role: ${role.name}`);
      if (role.rolePermissions.length === 0) {
        console.log('  (no permissions)');
      } else {
        for (const rp of role.rolePermissions) {
          console.log(`  - ${rp.permission.name} (${rp.permission.module}.${rp.permission.action})`);
        }
      }
    }
  } catch (err) {
    console.error('Error listing roles/permissions:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
