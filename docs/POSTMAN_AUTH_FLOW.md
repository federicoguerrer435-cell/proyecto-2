# Pruebas de autenticación (Postman) — Flujo paso a paso

Este documento describe los llamados HTTP que usé para probar la creación de usuarios y la autenticación en el proyecto.
Incluye bodies, headers, y cómo usar variables de entorno en Postman para facilitar pruebas repetibles.

Ruta base

- Base URL (entorno local): `http://localhost:3000`

Variables recomendadas en el Environment de Postman

- base_url = http://localhost:3000
- admin_email = admin@creditos.com
- admin_password = Admin123!
- test_email = (rellenar cuando se cree el usuario)
- test_password = TestPass1!
- accessToken = (rellenar / guardar tras login)
- refreshToken = (rellenar / guardar tras login)

Consejos rápidos para Postman

- En Headers: siempre usar `Content-Type: application/json` para los POST con body JSON.
- Para endpoints protegidos añadir header `Authorization: Bearer {{accessToken}}` (reemplazar variable si usas entorno).
- Puedes usar la sección "Environment" de Postman para guardar `base_url`, `accessToken` y `refreshToken`.

Flujo de pruebas (orden)

1) Login con admin (obtener access + refresh token)
2) Registrar usuario nuevo (usar token admin)
3) Login del usuario nuevo (obtener sus tokens)
4) Obtener perfil con accessToken del usuario
5) Renovar tokens (refresh)
6) Logout (revocar refresh token)

---

1) ADMIN - Login

- Método: POST
- URL: `{{base_url}}/api/auth/login`
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

{
  "email": "{{admin_email}}",
  "password": "{{admin_password}}"
}

- Respuesta esperada (200):
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { /* datos del usuario */ },
    "accessToken": "<JWT>",
    "refreshToken": "<JWT>"
  }
}

Acción en Postman: copiar `data.accessToken` y `data.refreshToken` a las variables de entorno `accessToken` y `refreshToken` respectivamente.

---

2) REGISTER - Crear nuevo usuario (solo ADMIN)

- Método: POST
- URL: `{{base_url}}/api/auth/register`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{accessToken}}  <-- usar el token del admin obtenido en paso 1
- Body (raw JSON) ejemplo:

{
  "nombre": "Test User",
  "email": "testuser_20251107@example.com",
  "password": "TestPass1!",
  "telefono": "123456789",
  "roleId": 2
}

Notas:
- `roleId` opcional. En el seed el rol `COBRADOR` suele ser id `2`. Ajusta según tu BD si es distinto.
- Si usas Postman puedes poner `test_email` como variable antes de ejecutar y referenciarla como `{{test_email}}`.

Respuesta esperada (201):
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": { "user": { "id": 2, "nombre": "Test User", "email": "...", ... } }
}

Acción en Postman: guardar el `email` que usaste en `test_email` para futuras pruebas.

---

3) LOGIN - Usuario nuevo

- Método: POST
- URL: `{{base_url}}/api/auth/login`
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}

Respuesta esperada (200): similar al login admin; contiene `data.accessToken` y `data.refreshToken`.
Acción: guardar `data.accessToken` en la variable `accessToken` y `data.refreshToken` en `refreshToken` (si quieres probar renuevo/logout de este usuario).

---

4) PROFILE - Obtener perfil del usuario autenticado

- Método: GET
- URL: `{{base_url}}/api/auth/profile`
- Headers:
  - Authorization: Bearer {{accessToken}}

Respuesta esperada (200):
{
  "success": true,
  "data": {
    "user": { "id": 2, "nombre": "Test User", "email": "...", "roles": [...], "permissions": [...], ... }
  }
}

---

5) REFRESH - Renovar access token con refresh token

- Método: POST
- URL: `{{base_url}}/api/auth/refresh`
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

{
  "refreshToken": "{{refreshToken}}"
}

Respuesta esperada (200):
{
  "success": true,
  "message": "Token renovado",
  "data": { "accessToken": "<newJWT>", "refreshToken": "<newRefreshJWT>" }
}

Acción: si recibes nuevos tokens, actualiza las variables `accessToken` y `refreshToken` en Postman.

---

6) LOGOUT - Revocar refresh token

- Método: POST
- URL: `{{base_url}}/api/auth/logout`
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

{
  "refreshToken": "{{refreshToken}}"
}

Respuesta esperada (200):
{
  "success": true,
  "message": "Logout exitoso"
}

---

Errores comunes y cómo resolverlos

- "Invalid token format": asegúrate de copiar el token completo y que el header Authorization sea `Bearer <token>` (sin comillas).
- 401 / 403 en register: el endpoint `POST /api/auth/register` requiere que el requester tenga rol `ADMIN`. Usa el token del admin seed.
- 409 EMAIL_EXISTS: el email ya existe; usa un email distinto (puedes añadir timestamp o GUID para hacerlo único).
- Problemas con Prisma/migraciones: asegúrate de haber corrido `npx prisma migrate deploy` y `npm run prisma:seed` (ver README_DOCKER.md).

Sugerencia: colección Postman

- Puedes copiar estos pasos manualmente en Postman o crear una colección y añadir estas requests. Usa una Environment con las variables listadas al inicio (`base_url`, `admin_email`, `admin_password`, `test_email`, `test_password`, `accessToken`, `refreshToken`).

Ejemplo rápido para generar un email único (Pre-request script en Postman)

// Pre-request script (JavaScript)
const ts = new Date().toISOString().replace(/[:.]/g, "-");
pm.environment.set('test_email', `testuser_${ts}@example.com`);

(Ojo: la forma de guardar variable depende de Postman: `pm.environment.set('test_email', value)`.)

---

Notas finales

- El seed del proyecto crea un admin por defecto: `admin@creditos.com` / `Admin123!`.
- Si vas a automatizar pruebas, añade assertions en Postman (Tests tab) para chequear `response.success === true` o que `status === 200`.

Si quieres, genero también una colección JSON de Postman con estos requests ya montados para que la importes directamente. ¿Quieres que la cree ahora?

---

## Pruebas CRUD de Usuarios (Postman)

Esta sección agrega los endpoints para crear, leer, actualizar y eliminar usuarios (`/api/users`) y ejemplos listos para usar en Postman.

Variables recomendadas adicionales

- user_id: id del usuario creado durante las pruebas (llenar/guardar desde la respuesta)

Endpoints y ejemplos

1) Crear usuario (requiere permiso users.create — usualmente Admin)

- Método: POST
- URL: `{{base_url}}/api/users`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{accessToken}}  (token de un admin)
- Body (raw JSON):

{
  "nombre": "Prueba Usuario",
  "email": "{{test_email}}",
  "password": "{{test_password}}",
  "telefono": "300111222",
  "roleIds": [2]
}

Respuesta esperada: 201 con `data` del usuario creado. Guardar `data.id` en la variable `user_id`.

2) Listar usuarios

- Método: GET
- URL: `{{base_url}}/api/users?limit=10&page=1`
- Headers:
  - Authorization: Bearer {{accessToken}}

Respuesta esperada: 200 con arreglo en `data` y `meta`.

3) Obtener usuario por ID

- Método: GET
- URL: `{{base_url}}/api/users/{{user_id}}`
- Headers:
  - Authorization: Bearer {{accessToken}}

Respuesta esperada: 200 con `data` del usuario. Revisar `isActive` y `roles`.

4) Actualizar usuario

- Método: PUT
- URL: `{{base_url}}/api/users/{{user_id}}`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{accessToken}}
- Body (raw JSON) ejemplo:

{
  "nombre": "Nombre Actualizado",
  "telefono": "300999888",
  "isActive": true,
  "roleIds": [2]
}

Respuesta esperada: 200 con `data` actualizado.

5) Asignar rol a usuario

- Método: POST
- URL: `{{base_url}}/api/users/{{user_id}}/roles`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{accessToken}}  (admin)
- Body:

{
  "roleId": 2
}

Respuesta: 200 con usuario actualizado.

6) Remover rol de usuario

- Método: DELETE
- URL: `{{base_url}}/api/users/{{user_id}}/roles/2`
- Headers:
  - Authorization: Bearer {{accessToken}}

Respuesta: 200 con usuario actualizado.

7) Eliminar (soft) usuario

- Método: DELETE
- URL: `{{base_url}}/api/users/{{user_id}}`
- Headers:
  - Authorization: Bearer {{accessToken}}  (admin)

Respuesta: 200 con mensaje de desactivación. Luego `GET /api/users/{{user_id}}` debe mostrar `isActive: false`.

8) Intento de crear usuario con cuenta sin permisos

- Usa el token de un usuario con rol `COBRADOR` (no admin) y realiza `POST /api/users`.
- Respuesta esperada: 403 FORBIDDEN con `code: 'FORBIDDEN'`.

Notes y validaciones esperadas

- `POST /api/users` valida `nombre`, `email` (formato) y `password` (min 6). Si falta alguno devuelve 400 con errores de validación.
- `PUT /api/users/:id` valida campos opcionales (`email` formato, longitud de `nombre`, `password` min 6, etc.).
- `DELETE /api/users/:id` impide que un usuario se elimine a sí mismo y previene eliminar el admin principal `admin@creditos.com`.

Test rápido en Postman (orden resumido)

1. Run admin login → guardar accessToken
2. Run POST /api/users → guardar user_id y test_email
3. Run GET /api/users → verificar listado
4. Run GET /api/users/{{user_id}} → verificar detalles
5. Run PUT /api/users/{{user_id}} → verificar cambios
6. Run POST /api/users/{{user_id}}/roles → asignar rol
7. Run DELETE /api/users/{{user_id}}/roles/2 → remover rol
8. Run DELETE /api/users/{{user_id}} → soft delete
9. Run GET /api/users/{{user_id}} → verificar isActive:false

Si quieres, puedo generar la colección Postman (.json) con estas requests ya listas para importar. Dime si la quieres y la creo a continuación.