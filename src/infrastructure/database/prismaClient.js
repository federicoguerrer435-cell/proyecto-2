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

        if (!args.data.createdBy) args.data.createdBy = userId;
        if (!args.data.updatedBy) args.data.updatedBy = userId;

        return query(args);
      },

      async update({ args, query }) {
        const userId = global.currentUserId || null;

        if (!args.data) args.data = {};
        args.data.updatedBy = userId;

        return query(args);
      }
    }
  }
});

// ✅ Manejo de cierre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
