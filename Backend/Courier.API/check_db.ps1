# check_db.ps1
$body = @{
    email = "admin@gmail.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5144/api/Auth/login" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
$token = $response.token

$orders = Invoke-RestMethod -Uri "http://localhost:5144/api/Orders" -Headers @{ Authorization = "Bearer $token" }
$orders | Select-Object -First 5 | ConvertTo-Json -Depth 5
