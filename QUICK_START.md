# 🚀 Guía Rápida de Inicio - Créditos Backend

## ⚡ Instalación Rápida

\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones (DATABASE_URL es obligatorio)

# 3. Crear base de datos
# En PostgreSQL, ejecutar: CREATE DATABASE creditos_db;

# 4. Generar Prisma Client
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev --name init

# 6. Cargar datos iniciales (admin + roles + permisos)
npm run prisma:seed

# 7. Iniciar servidor
npm run dev
\`\`\`

## 🔑 Credenciales por Defecto

**Usuario Administrador:**
- Email: \`admin@creditos.com\`
- Password: \`Admin123!\`

⚠️ **IMPORTANTE**: Cambiar esta contraseña en producción.

## 📡 Endpoints Disponibles

### Health Check
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@creditos.com",
    "password": "Admin123!"
  }'
\`\`\`

### Obtener Perfil (requiere token)
\`\`\`bash
curl http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
\`\`\`

## 🗄️ Prisma Studio (Interfaz Visual)

Para ver y editar datos en la base de datos:

\`\`\`bash
npm run prisma:studio
\`\`\`

Abre en: http://localhost:5555

## 🛠️ Comandos Útiles

\`\`\`bash
# Ver logs de Prisma
npx prisma migrate status

# Resetear base de datos (⚠️ elimina todos los datos)
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Formatear schema.prisma
npx prisma format
\`\`\`

## ✅ Verificación

Después de seguir los pasos:

1. ✅ Servidor corriendo en http://localhost:3000
2. ✅ Health check responde: \`GET /health\`
3. ✅ Login funciona: \`POST /api/auth/login\`
4. ✅ Cron job iniciado (ver logs)
5. ✅ Prisma Studio accesible

## 🐛 Problemas Comunes

### Error de conexión a PostgreSQL

**Problema**: \`Error: P1001: Can't reach database server\`

**Solución**:
1. Verificar que PostgreSQL esté corriendo
2. Revisar \`DATABASE_URL\` en \`.env\`
3. Verificar que la base de datos existe

\`\`\`bash
# Windows
net start postgresql-x64-12

# Linux/Mac
sudo service postgresql start
\`\`\`

### Error: Prisma Client no generado

**Problema**: \`@prisma/client did not initialize yet\`

**Solución**:
\`\`\`bash
npx prisma generate
\`\`\`

### Error: Migraciones pendientes

**Problema**: \`Prisma Migrate found pending migrations\`

**Solución**:
\`\`\`bash
npx prisma migrate deploy
# o
npx prisma migrate dev
\`\`\`

## 📚 Documentación Completa

Ver \`README_NEW.md\` para documentación completa del proyecto.

## 🎯 Próximos Pasos

1. Probar el login con las credenciales por defecto
2. Explorar la base de datos con Prisma Studio
3. Revisar el schema.prisma para entender el modelo de datos
4. Implementar los endpoints REST pendientes (ver README_NEW.md)
5. Configurar WhatsApp Cloud API para notificaciones

---

**¿Necesitas ayuda?** Revisa el README_NEW.md completo.
