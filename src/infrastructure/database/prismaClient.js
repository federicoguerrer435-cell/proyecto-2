const { PrismaClient } = require('@prisma/client');

const prismaBase = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// ✅ Extensión / Middleware en Prisma 6
const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async create({ args, query }) {
        const userId = global.currentUserId || null;

        // Añadir auditoría si aplica. Algunos modelos (ej. RefreshToken) no tienen
        // campos createdBy/updatedBy, por lo que intentamos la operación y, en
        // caso de error por argumentos desconocidos, reintentamos sin esos campos.
        if (!args.data) args.data = {};
        if (!args.data.createdBy) args.data.createdBy = userId;
        if (!args.data.updatedBy) args.data.updatedBy = userId;

        try {
          return await query(args);
        } catch (err) {
          // Detectar error de validación de Prisma por campo desconocido
          const msg = err && err.message ? err.message : '';
          if (msg.includes('Unknown argument `createdBy`') || msg.includes('Unknown argument `updatedBy`')) {
            // Eliminar los campos de auditoría y reintentar
            delete args.data.createdBy;
            delete args.data.updatedBy;
            return query(args);
          }

          throw err;
        }
      },

      async update({ args, query }) {
        const userId = global.currentUserId || null;

        if (!args.data) args.data = {};
        args.data.updatedBy = userId;

        try {
          return await query(args);
        } catch (err) {
          const msg = err && err.message ? err.message : '';
          if (msg.includes('Unknown argument `updatedBy`')) {
            delete args.data.updatedBy;
            return query(args);
          }

          throw err;
        }
      }
    }
  }
});

// ✅ Manejo de cierre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
