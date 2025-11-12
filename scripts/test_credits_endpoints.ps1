# Tests para endpoints de créditos
# Ejecuta: .\scripts\test_credits_endpoints.ps1

$base = 'http://localhost:3000'
# Cambia si tu seed creó otro admin
$admin = @{ email = 'admin@creditos.com'; password = 'Admin123!' }

Write-Host "Logging in as admin..."
$loginResp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body ($admin | ConvertTo-Json)
if (-not $loginResp) { Write-Error "Login failed: no response"; exit 1 }

# Intenta detectar token en distintos formatos
$token = $null
if ($loginResp.data -and $loginResp.data.accessToken) { $token = $loginResp.data.accessToken }
elseif ($loginResp.accessToken) { $token = $loginResp.accessToken }
elseif ($loginResp.data -and $loginResp.data.token) { $token = $loginResp.data.token }

if (-not $token) { Write-Error "No access token found in login response: $($loginResp | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Host "Access token obtained (length):" $token.Length

$headers = @{ Authorization = "Bearer $token" }

# 1) List all credits (first page)
Write-Host "\n1) GET /api/credits - first page"
try {
    $res1 = Invoke-RestMethod -Method Get -Uri "$base/api/credits?limit=5" -Headers $headers
    Write-Host ($res1 | ConvertTo-Json -Depth 5)
} catch {
    Write-Error "Request failed: $_"
}

# 1.5) Create a credit request for Cliente Uno (if exists)
Write-Host "\n1.5) POST /api/credits - create credit request"
try {
    # find a client to use
    $clients = Invoke-RestMethod -Method Get -Uri "$base/api/clients?limit=10&page=1" -Headers $headers
    if ($clients.data -and $clients.data.Count -gt 0) {
        $clientId = $clients.data[0].id
        $body = @{
            client_id = $clientId
            monto = "250000.00"
            cuotas = 6
            tasa = 0.15
            plazo = 6
            tipo_credito = "PERSONAL"
            nota = "Solicitud automática de prueba"
        } | ConvertTo-Json

        $createResp = Invoke-RestMethod -Method Post -Uri "$base/api/credits" -Headers @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' } -Body $body
        Write-Host "Create response:`n" ($createResp | ConvertTo-Json -Depth 5)

        # If created, call GET /api/credits/{id} to validate
        if ($createResp -and $createResp.data -and $createResp.data.id) {
            $createdId = $createResp.data.id
            Write-Host "\n1.6) GET /api/credits/$createdId - validate created credit"
            try {
                $getResp = Invoke-RestMethod -Method Get -Uri "$base/api/credits/$createdId" -Headers $headers
                Write-Host ($getResp | ConvertTo-Json -Depth 5)
            } catch {
                Write-Error "GET by id failed: $_"
            }
        } else {
            Write-Host "Credit creation did not return an id; skipping GET by id"
        }
    } else {
        Write-Host "No clients available to create credit request"
    }
} catch {
    Write-Error "Create credit request failed: $_"
}

# 2) Filter by nombre (partial) if there is at least one credit with client.nombre
$sampleName = $null
if ($res1 -and $res1.data -and $res1.data.Count -gt 0) {
    $sampleName = $res1.data[0].client.nombre -split ' ' | Select-Object -First 1
    Write-Host "\n2) GET /api/credits - filter by nombre partial: $sampleName"
    try {
        $res2 = Invoke-RestMethod -Method Get -Uri "$base/api/credits?limit=5&nombre=$([System.Uri]::EscapeDataString($sampleName))" -Headers $headers
        Write-Host ($res2 | ConvertTo-Json -Depth 5)
    } catch {
        Write-Error "Filtered request failed: $_"
    }
} else {
    Write-Host "No credits available to sample nombre filter"
}

# 3) If nextCursor present, request next page
$nextCursor = $null
if ($res1 -and $res1.meta -and $res1.meta.nextCursor) { $nextCursor = $res1.meta.nextCursor }
elseif ($res1 -and $res1.nextCursor) { $nextCursor = $res1.nextCursor }

if ($nextCursor) {
    Write-Host "\n3) GET /api/credits - next page using cursor: $nextCursor"
    try {
        $res3 = Invoke-RestMethod -Method Get -Uri "$base/api/credits?limit=5&cursor=$nextCursor" -Headers $headers
        Write-Host ($res3 | ConvertTo-Json -Depth 5)
    } catch {
        Write-Error "Cursor request failed: $_"
    }
} else {
    Write-Host "No nextCursor returned in first page; skipping cursor test"
}

Write-Host "\nTests completed."