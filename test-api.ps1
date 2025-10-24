# Script de pruebas para endpoints de la API
# Ejecutar con: .\test-api.ps1

$baseUrl = "http://localhost:3000/api"
$healthUrl = "http://localhost:3000/health"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE API - PLATAFORMA CRÉDITOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get
    Write-Host "✅ Servidor funcionando correctamente" -ForegroundColor Green
    $response | ConvertTo-Json
    Write-Host ""
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Login
Write-Host "2. Login con usuario admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@creditos.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    $refreshToken = $loginResponse.data.refreshToken
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 3: Listar usuarios
Write-Host "3. Listar usuarios..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users?page=1&limit=10" -Method Get -Headers $headers
    Write-Host "✅ Usuarios obtenidos: $($usersResponse.data.Count)" -ForegroundColor Green
    Write-Host "Total: $($usersResponse.meta.total)" -ForegroundColor Gray
    
    Write-Host "`nUsuarios:" -ForegroundColor Cyan
    foreach ($user in $usersResponse.data) {
        Write-Host "  - ID: $($user.id) | Nombre: $($user.nombre) | Email: $($user.email) | Activo: $($user.isActive)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error listando usuarios: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Obtener usuario por ID
Write-Host "4. Obtener usuario por ID (1)..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/users/1" -Method Get -Headers $headers
    Write-Host "✅ Usuario obtenido" -ForegroundColor Green
    Write-Host "Nombre: $($userResponse.data.nombre)" -ForegroundColor Gray
    Write-Host "Email: $($userResponse.data.email)" -ForegroundColor Gray
    Write-Host "Roles: $($userResponse.data.roles -join ', ')" -ForegroundColor Gray
    Write-Host "Permisos: $($userResponse.data.permissions.Count) permisos" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error obteniendo usuario: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Crear nuevo usuario
Write-Host "5. Crear nuevo usuario..." -ForegroundColor Yellow
try {
    $newUserBody = @{
        nombre = "Juan Pérez Test"
        email = "juan.perez.test@example.com"
        password = "password123"
        telefono = "555-1234"
        roleIds = @(2)
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUserBody -ContentType "application/json" -Headers $headers
    $newUserId = $createResponse.data.id
    
    Write-Host "✅ Usuario creado exitosamente" -ForegroundColor Green
    Write-Host "ID: $newUserId | Nombre: $($createResponse.data.nombre)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error creando usuario: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Detalles: $($errorDetails.errors[0].msg)" -ForegroundColor Red
    }
    Write-Host ""
    $newUserId = $null
}

# Test 6: Actualizar usuario
if ($newUserId) {
    Write-Host "6. Actualizar usuario creado..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            telefono = "555-9999"
            isActive = $true
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/$newUserId" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
        
        Write-Host "✅ Usuario actualizado exitosamente" -ForegroundColor Green
        Write-Host "Teléfono actualizado: $($updateResponse.data.telefono)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ Error actualizando usuario: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

    # Test 7: Asignar rol
    Write-Host "7. Asignar rol ADMIN al usuario..." -ForegroundColor Yellow
    try {
        $roleBody = @{
            roleId = 1
        } | ConvertTo-Json

        $roleResponse = Invoke-RestMethod -Uri "$baseUrl/users/$newUserId/roles" -Method Post -Body $roleBody -ContentType "application/json" -Headers $headers
        
        Write-Host "✅ Rol asignado exitosamente" -ForegroundColor Green
        Write-Host "Roles actuales: $($roleResponse.data.roles -join ', ')" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ Error asignando rol: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

    # Test 8: Remover rol
    Write-Host "8. Remover rol ADMIN del usuario..." -ForegroundColor Yellow
    try {
        $removeRoleResponse = Invoke-RestMethod -Uri "$baseUrl/users/$newUserId/roles/1" -Method Delete -Headers $headers
        
        Write-Host "✅ Rol removido exitosamente" -ForegroundColor Green
        Write-Host "Roles actuales: $($removeRoleResponse.data.roles -join ', ')" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ Error removiendo rol: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }

    # Test 9: Desactivar usuario (soft delete)
    Write-Host "9. Desactivar usuario (soft delete)..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/users/$newUserId" -Method Delete -Headers $headers
        
        Write-Host "✅ Usuario desactivado exitosamente" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Error desactivando usuario: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 10: Validaciones - Email duplicado
Write-Host "10. Prueba de validación - Email duplicado (debe fallar)..." -ForegroundColor Yellow
try {
    $duplicateBody = @{
        nombre = "Usuario Duplicado"
        email = "admin@creditos.com"
        password = "password123"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $duplicateBody -ContentType "application/json" -Headers $headers
    Write-Host "❌ La validación no funcionó correctamente" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✅ Validación funcionó correctamente - Email duplicado rechazado" -ForegroundColor Green
    Write-Host ""
}

# Test 11: Búsqueda de usuarios
Write-Host "11. Buscar usuarios con filtro..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/users?search=admin" -Method Get -Headers $headers
    Write-Host "✅ Búsqueda exitosa - $($searchResponse.data.Count) resultado(s)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
