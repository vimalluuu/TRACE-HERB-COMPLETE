# Fix TLS Configuration for TRACE HERB blockchain network

Write-Host "Fixing TLS configuration..." -ForegroundColor Cyan

# Fix TLS for farmers peer
Write-Host "Fixing TLS for farmers peer..." -ForegroundColor Yellow
$farmersKeyFile = Get-ChildItem "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/keystore/*.sk" | Select-Object -First 1
if ($farmersKeyFile) {
    Copy-Item $farmersKeyFile.FullName "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/server.key"
    Write-Host "Copied TLS key for farmers peer" -ForegroundColor Green
}

Copy-Item "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/signcerts/cert.pem" "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/server.crt"
Copy-Item "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/tlscacerts/tls-localhost-7054.pem" "organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt"

# Fix TLS for processors peer
Write-Host "Fixing TLS for processors peer..." -ForegroundColor Yellow
$processorsKeyFile = Get-ChildItem "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/keystore/*.sk" | Select-Object -First 1
if ($processorsKeyFile) {
    Copy-Item $processorsKeyFile.FullName "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/server.key"
    Write-Host "Copied TLS key for processors peer" -ForegroundColor Green
}

Copy-Item "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/signcerts/cert.pem" "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/server.crt"
Copy-Item "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/tlscacerts/tls-localhost-8054.pem" "organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt"

# Fix TLS for orderer
Write-Host "Fixing TLS for orderer..." -ForegroundColor Yellow
$ordererKeyFile = Get-ChildItem "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/keystore/*.sk" | Select-Object -First 1
if ($ordererKeyFile) {
    Copy-Item $ordererKeyFile.FullName "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/server.key"
    Write-Host "Copied TLS key for orderer" -ForegroundColor Green
}

Copy-Item "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/signcerts/cert.pem" "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/server.crt"
Copy-Item "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/tlscacerts/tls-localhost-7054.pem" "organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/ca.crt"

Write-Host "TLS configuration fixed!" -ForegroundColor Green

# Restart the network
Write-Host "Restarting blockchain network..." -ForegroundColor Cyan
cd network
docker-compose restart

Write-Host "Network restarted!" -ForegroundColor Green
