# Kill process on port 4000
$port = 4000
$connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }

if ($connection) {
    $processId = $connection.OwningProcess
    Write-Host "Killing process $processId on port $port"
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 1
    Write-Host "Process killed successfully"
} else {
    Write-Host "No process found listening on port $port"
}
