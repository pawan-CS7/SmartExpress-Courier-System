$body = @{
    Email = 'admin@gmail.com'
    Password = 'password123'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5144/api/Auth/login' -Method Post -Body $body -ContentType 'application/json'
    Write-Output "LOGIN SUCCESS"
    Write-Output $response | ConvertTo-Json
} catch {
    Write-Output "LOGIN FAILED"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
