try {
    $baseUrl = 'http://localhost:3000'
    Write-Host "Base URL: $baseUrl"

    Write-Host "\n1) Admin login..."
    $loginBody = @{ email = 'admin@creditos.com'; password = 'Admin123!' } | ConvertTo-Json
    $loginResp = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Body $loginBody -ContentType 'application/json'
    if (-not $loginResp -or -not $loginResp.data) { throw "Login failed or unexpected response: $($loginResp | ConvertTo-Json -Depth 5)" }
    $accessToken = $loginResp.data.accessToken
    $refreshToken = $loginResp.data.refreshToken
    Write-Host "Access token length: $($accessToken.Length)"

    $headers = @{ Authorization = "Bearer $accessToken" }

    Write-Host "\n2) Create client..."
    $clientBody = @{ nombre='Cliente Prueba'; cedula='12345487'; email='cliente.prueba@example.com'; telefono='3000000000'; direccion='Calle 1 #2-3' } | ConvertTo-Json
    $createResp = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/clients" -Body $clientBody -ContentType 'application/json' -Headers $headers
    Write-Host ("Create response: " + ($createResp | ConvertTo-Json -Depth 5))
    $clientId = $createResp.data.id
    if (-not $clientId) { throw "Create did not return id" }
    Write-Host "Created client id: $clientId"

    Write-Host "\n3) List clients..."
    $listResp = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/clients?limit=10&page=1" -Headers $headers
    Write-Host ("List response: " + ($listResp | ConvertTo-Json -Depth 5))

    Write-Host "\n4) Get client by ID..."
    $getResp = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/clients/$clientId" -Headers $headers
    Write-Host ("Get response: " + ($getResp | ConvertTo-Json -Depth 5))

    Write-Host "\n5) Update client..."
    $updateBody = @{ nombre='Cliente Actualizado'; telefono='3101112222'; isActive = $true } | ConvertTo-Json
    $updateResp = Invoke-RestMethod -Method Put -Uri "$baseUrl/api/clients/$clientId" -Body $updateBody -ContentType 'application/json' -Headers $headers
    Write-Host ("Update response: " + ($updateResp | ConvertTo-Json -Depth 5))

    Write-Host "\n6) Delete client..."
    $deleteResp = Invoke-RestMethod -Method Delete -Uri "$baseUrl/api/clients/$clientId" -Headers $headers
    Write-Host ("Delete response: " + ($deleteResp | ConvertTo-Json -Depth 5))

    Write-Host "\nAll steps completed successfully."
    exit 0
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        try { $err = $_.Exception.Response | ConvertTo-Json -Depth 5; Write-Host $err } catch {}
    }
    exit 1
}
