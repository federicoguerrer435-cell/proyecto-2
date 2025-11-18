const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear permisos
  console.log('📝 Creando permisos...');
  const permissions = [
    // Usuarios
    { name: 'users.create', module: 'users', action: 'create', description: 'Crear usuarios' },
    { name: 'users.read', module: 'users', action: 'read', description: 'Ver usuarios' },
    { name: 'users.update', module: 'users', action: 'update', description: 'Actualizar usuarios' },
    { name: 'users.delete', module: 'users', action: 'delete', description: 'Eliminar usuarios' },
    
    // Clientes
    { name: 'clients.create', module: 'clients', action: 'create', description: 'Crear clientes' },
    { name: 'clients.read', module: 'clients', action: 'read', description: 'Ver clientes' },
    { name: 'clients.update', module: 'clients', action: 'update', description: 'Actualizar clientes' },
    { name: 'clients.delete', module: 'clients', action: 'delete', description: 'Eliminar clientes' },
    
    // Créditos
    { name: 'credits.create', module: 'credits', action: 'create', description: 'Crear créditos' },
    { name: 'credits.read', module: 'credits', action: 'read', description: 'Ver créditos' },
    { name: 'credits.update', module: 'credits', action: 'update', description: 'Actualizar créditos' },
    { name: 'credits.delete', module: 'credits', action: 'delete', description: 'Eliminar créditos' },
    { name: 'credits.approve', module: 'credits', action: 'approve', description: 'Aprobar créditos' },
    { name: 'credits.reject', module: 'credits', action: 'reject', description: 'Rechazar créditos' },
    
    // Pagos
    { name: 'payments.create', module: 'payments', action: 'create', description: 'Registrar pagos' },
    { name: 'payments.read', module: 'payments', action: 'read', description: 'Ver pagos' },
    
    // Reportes
    { name: 'reports.read', module: 'reports', action: 'read', description: 'Ver reportes' },
    { name: 'reports.download', module: 'reports', action: 'download', description: 'Descargar reportes' },
    { name: 'dashboard.read', module: 'dashboard', action: 'read', description: 'Ver dashboard' },
    
    // Roles
    { name: 'roles.create', module: 'roles', action: 'create', description: 'Crear roles' },
    { name: 'roles.read', module: 'roles', action: 'read', description: 'Ver roles' },
    { name: 'roles.update', module: 'roles', action: 'update', description: 'Actualizar roles' },
    { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Eliminar roles' }
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission
    });
  }

  console.log(`✅ ${permissions.length} permisos creados`);

  // 2. Crear roles
  console.log('👥 Creando roles...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador con acceso total'
    }
  });

  const cobradorRole = await prisma.role.upsert({
    where: { name: 'COBRADOR' },
    update: {},
    create: {
      name: 'COBRADOR',
      description: 'Cobrador de créditos'
    }
  });

  console.log('✅ Roles creados: ADMIN, COBRADOR');

  // 3. Asignar TODOS los permisos al rol ADMIN
  console.log('🔐 Asignando permisos al rol ADMIN...');
  
  const allPermissions = await prisma.permission.findMany();
  
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  console.log(`✅ ${allPermissions.length} permisos asignados al rol ADMIN`);

  // 4. Asignar permisos limitados al rol COBRADOR
  console.log('🔐 Asignando permisos al rol COBRADOR...');
  
  const cobradorPermissions = [
    'clients.read',
    'clients.create',
    'clients.update',
    'credits.read',
    'payments.create',
    'payments.read',
    'reports.download',
    'dashboard.read'
  ];

  for (const permName of cobradorPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName }
    });
    
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cobradorRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: cobradorRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  console.log(`✅ ${cobradorPermissions.length} permisos asignados al rol COBRADOR`);

  // 5. Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  
  const adminPassword = 'Admin123!'; // Cambiar en producción
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@creditos.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@creditos.com',
      passwordHash: hashedPassword,
      telefono: '1234567890',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log('✅ Usuario administrador creado');
  console.log('   Email: admin@creditos.com');
  console.log('   Password: Admin123!');
  console.log('   ⚠️  CAMBIAR CONTRASEÑA EN PRODUCCIÓN');

  // 6. Asignar rol ADMIN al usuario administrador
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('✅ Rol ADMIN asignado al usuario administrador');

  // 7. Crear configuraciones globales
  console.log('⚙️  Creando configuraciones globales...');
  
  const configs = [
    {
      key: 'tasa_interes_global',
      value: '0.20',
      descripcion: 'Tasa de interés global por defecto (20%)'
    },
    {
      key: 'horario_cron',
      value: '0 8 * * *',
      descripcion: 'Horario del cron job de notificaciones (8 AM diario)'
    },
    {
      key: 'dias_recordatorio_previo',
      value: '3',
      descripcion: 'Días antes del vencimiento para enviar recordatorio'
    }
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
  }

  console.log(`✅ ${configs.length} configuraciones creadas`);

  // 8. Crear algunos clientes de prueba y créditos asociados (idempotente)
  console.log('\n👥 Creando clientes de prueba y créditos asociados...');

  const sampleClients = [
    { nombre: 'Cliente Uno', cedula: 'C10001', email: 'cliente1@example.com', telefono: '3001001001', direccion: 'Calle 10' },
    { nombre: 'Cliente Dos', cedula: 'C10002', email: 'cliente2@example.com', telefono: '3001001002', direccion: 'Calle 11' },
    { nombre: 'Cliente Tres', cedula: 'C10003', email: 'cliente3@example.com', telefono: '3001001003', direccion: 'Calle 12' }
  ];

  const createdClients = [];
  for (const c of sampleClients) {
    const client = await prisma.client.upsert({
      where: { cedula: c.cedula },
      update: {
        nombre: c.nombre,
        email: c.email,
        telefono: c.telefono,
        direccion: c.direccion,
        updatedAt: new Date(),
        updatedBy: adminUser.id
      },
      create: {
        nombre: c.nombre,
        cedula: c.cedula,
        email: c.email,
        telefono: c.telefono,
        direccion: c.direccion,
        assignedTo: adminUser.id,
        createdAt: new Date(),
        createdBy: adminUser.id
      }
    });
    createdClients.push(client);
  }

  console.log(`✅ ${createdClients.length} clientes asegurados`);

  // Crear créditos de ejemplo para los clientes (si no existen)
  const now = Date.now();
  let creditCount = 0;
  for (let i = 0; i < createdClients.length; i++) {
    const client = createdClients[i];
    const numeroCredito = `CRE-${new Date().getFullYear()}-${now}-${i+1}`;

    const existing = await prisma.credit.findUnique({ where: { numeroCredito } });
    if (!existing) {
      await prisma.credit.create({
        data: {
          numeroCredito,
          clienteId: client.id,
          montoPrincipal: '1000000.00',
          cuotas: 12,
          tasaInteresAplicada: '0.2000',
          fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          estado: 'ACTIVO',
          createdAt: new Date(),
          createdBy: adminUser.id
        }
      });
      creditCount++;
    }
  }

  console.log(`✅ ${creditCount} créditos creados (si no existían)`);

  console.log('\n🎉 Seed completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
