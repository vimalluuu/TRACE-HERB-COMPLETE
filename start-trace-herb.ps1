#!/usr/bin/env pwsh

Write-Host ""
Write-Host "========================================"
Write-Host "   🌿 TRACE HERB - Complete Startup"
Write-Host "========================================"
Write-Host ""
Write-Host "Starting TRACE HERB Blockchain-based Herb Supply Chain Traceability System..."
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion"
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH"
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion"
} catch {
    Write-Host "❌ ERROR: npm is not installed or not in PATH"
    Write-Host "Please install Node.js which includes npm"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..."
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend dependencies
$backendPath = Join-Path $scriptDir "backend"
if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Host "Installing backend dependencies..."
    Set-Location $backendPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Backend dependencies already installed"
}

# Enhanced Consumer Portal dependencies
$enhancedPortalPath = Join-Path $scriptDir "frontend\enhanced-consumer-portal"
if (-not (Test-Path (Join-Path $enhancedPortalPath "node_modules"))) {
    Write-Host "Installing Enhanced Consumer Portal dependencies..."
    Set-Location $enhancedPortalPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Enhanced Consumer Portal dependencies already installed"
}

# Farmer Portal dependencies
$farmerPath = Join-Path $scriptDir "frontend\farmer-dapp"
if (-not (Test-Path (Join-Path $farmerPath "node_modules"))) {
    Write-Host "Installing Farmer Portal dependencies..."
    Set-Location $farmerPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Farmer Portal dependencies already installed"
}

# Supply Chain Overview dependencies
$supplyChainPath = Join-Path $scriptDir "frontend\supply-chain-overview"
if (-not (Test-Path (Join-Path $supplyChainPath "node_modules"))) {
    Write-Host "Installing Supply Chain Overview dependencies..."
    Set-Location $supplyChainPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Supply Chain Overview dependencies already installed"
}

# Consumer Portal dependencies
$consumerPath = Join-Path $scriptDir "frontend\consumer-portal"
if (-not (Test-Path (Join-Path $consumerPath "node_modules"))) {
    Write-Host "Installing Consumer Portal dependencies..."
    Set-Location $consumerPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Consumer Portal dependencies already installed"
}

# Processor Portal dependencies
$processorPath = Join-Path $scriptDir "frontend\processor-portal"
if (-not (Test-Path (Join-Path $processorPath "node_modules"))) {
    Write-Host "Installing Processor Portal dependencies..."
    Set-Location $processorPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Processor Portal dependencies already installed"
}

# Lab Portal dependencies
$labPath = Join-Path $scriptDir "frontend\lab-portal"
if (-not (Test-Path (Join-Path $labPath "node_modules"))) {
    Write-Host "Installing Lab Portal dependencies..."
    Set-Location $labPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Lab Portal dependencies already installed"
}

# Regulator Portal dependencies
$regulatorPath = Join-Path $scriptDir "frontend\regulator-portal"
if (-not (Test-Path (Join-Path $regulatorPath "node_modules"))) {
    Write-Host "Installing Regulator Portal dependencies..."
    Set-Location $regulatorPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Regulator Portal dependencies already installed"
}

# Stakeholder Dashboard dependencies
$stakeholderPath = Join-Path $scriptDir "frontend\stakeholder-dashboard"
if (-not (Test-Path (Join-Path $stakeholderPath "node_modules"))) {
    Write-Host "Installing Stakeholder Dashboard dependencies..."
    Set-Location $stakeholderPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Stakeholder Dashboard dependencies already installed"
}

# Management Portal dependencies
$managementPath = Join-Path $scriptDir "frontend\management-portal"
if (-not (Test-Path (Join-Path $managementPath "node_modules"))) {
    Write-Host "Installing Management Portal dependencies..."
    Set-Location $managementPath
    npm install
    Set-Location $scriptDir
} else {
    Write-Host "✅ Management Portal dependencies already installed"
}

# Wild Collector Portal dependencies
$wildCollectorPath = Join-Path $scriptDir "frontend\wild-collector-dapp"
if (-not (Test-Path (Join-Path $wildCollectorPath "node_modules"))) {
    Write-Host "Installing Wild Collector Portal dependencies..."
    Set-Location $wildCollectorPath
    npm install --legacy-peer-deps
    Set-Location $scriptDir
} else {
    Write-Host "✅ Wild Collector Portal dependencies already installed"
}

Write-Host ""
Write-Host "🚀 Starting all services..."
Write-Host ""

# Start Backend (CA-Connected Blockchain Mode)
Write-Host "Starting Backend API Server (CA-Connected Mode)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Enhanced Consumer Portal (Main Demo Portal)
Write-Host "Starting Enhanced Consumer Portal (Port 3010)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$enhancedPortalPath'; npm run dev" -WindowStyle Normal

# Start Farmer Portal
Write-Host "Starting Farmer Portal (Port 3002)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$farmerPath'; npm run dev" -WindowStyle Normal

# Start Supply Chain Overview
Write-Host "Starting Supply Chain Overview (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$supplyChainPath'; npm run dev" -WindowStyle Normal

# Start Consumer Portal (Original)
Write-Host "Starting Consumer Portal (Port 3001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$consumerPath'; npm run dev -- -p 3001" -WindowStyle Normal

# Start Processor Portal
Write-Host "Starting Processor Portal (Port 3004)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$processorPath'; npm run dev -- -p 3004" -WindowStyle Normal

# Start Lab Portal
Write-Host "Starting Lab Portal (Port 3005)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$labPath'; npm run dev -- -p 3005" -WindowStyle Normal

# Start Regulator Portal
Write-Host "Starting Regulator Portal (Port 3006)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$regulatorPath'; npm run dev -- -p 3006" -WindowStyle Normal

# Start Stakeholder Dashboard
Write-Host "Starting Stakeholder Dashboard (Port 3007)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$stakeholderPath'; npm run dev -- -p 3007" -WindowStyle Normal

# Start Management Portal
Write-Host "Starting Management Portal (Port 3008)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$managementPath'; npm run dev -- -p 3008" -WindowStyle Normal

# Start Wild Collector Portal
Write-Host "Starting Wild Collector Portal (Port 3009)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$wildCollectorPath'; npm run dev -- -p 3009" -WindowStyle Normal

Write-Host ""
Write-Host "========================================"
Write-Host "    🎉 TRACE HERB SYSTEM STARTED!"
Write-Host "========================================"
Write-Host ""
Write-Host "🌐 Access Points:"
Write-Host ""
Write-Host "📱 MAIN DEMO - Enhanced Consumer Portal: http://localhost:3010"
Write-Host "🚜 Farmer Portal:                       http://localhost:3002"
Write-Host "📊 Supply Chain Overview:               http://localhost:3000"
Write-Host "👤 Consumer Portal (Original):          http://localhost:3001"
Write-Host "🏭 Processor Portal:                    http://localhost:3004"
Write-Host "🔬 Lab Portal:                          http://localhost:3005"
Write-Host "🏛️  Regulator Portal:                   http://localhost:3006"
Write-Host "👥 Stakeholder Dashboard:               http://localhost:3007"
Write-Host "🎛️  Management Portal:                  http://localhost:3008"
Write-Host "🌿 Wild Collector Portal:               http://localhost:3009"
Write-Host "🔧 Backend API:                         http://localhost:3000/api"
Write-Host ""
Write-Host "🔗 Blockchain Status: CA-Connected Mode (Certificate Authority)"
Write-Host ""
Write-Host "⚡ Demo QR Codes for Testing:"
Write-Host "   • QR_DEMO_ASHWAGANDHA_001 (Ashwagandha Root)"
Write-Host "   • QR_DEMO_TURMERIC_001    (Turmeric Powder)"
Write-Host "   • QR_DEMO_BRAHMI_001      (Brahmi Leaves)"
Write-Host "   • QR_DEMO_NEEM_001        (Neem Leaves)"
Write-Host ""
Write-Host "🎯 For Judges Demo: Start with Enhanced Consumer Portal"
Write-Host "   1. Visit: http://localhost:3010"
Write-Host "   2. Enter any demo QR code above"
Write-Host "   3. View tracking progress → Click 'Advanced Insights'"
Write-Host "   4. Create new batches in Farmer Portal"
Write-Host ""
Write-Host "Press any key to open main demo portal..."
Read-Host
Start-Process "http://localhost:3010"
