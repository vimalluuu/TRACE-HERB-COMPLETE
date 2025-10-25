@echo off
title TRACE HERB - Blockchain Network
color 0E
echo.
echo ========================================
echo    STARTING BLOCKCHAIN NETWORK
echo ========================================
echo.

echo Checking Docker...
docker --version
if errorlevel 1 (
    echo ERROR: Docker not found! Please install Docker Desktop
    pause
    exit
)

echo.
echo Starting Hyperledger Fabric Network...
cd blockchain\network
docker-compose up -d

echo.
echo Blockchain network started!
echo Certificate Authorities are running on:
echo - Farmers CA: http://localhost:7054
echo - Processors CA: http://localhost:8054  
echo - Labs CA: http://localhost:9054
echo - Regulators CA: http://localhost:10054
echo.

pause
