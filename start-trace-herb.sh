#!/bin/bash

echo ""
echo "========================================"
echo "   🌿 TRACE HERB - Complete Startup    "
echo "========================================"
echo ""
echo "Starting TRACE HERB Blockchain-based Herb Supply Chain Traceability System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed or not in PATH"
    echo "Please install Node.js which includes npm"
    exit 1
fi

echo "✅ Node.js and npm are available"
echo ""

# Install dependencies if node_modules don't exist
echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
else
    echo "✅ Backend dependencies already installed"
fi

# Enhanced Consumer Portal dependencies
if [ ! -d "frontend/enhanced-consumer-portal/node_modules" ]; then
    echo "Installing Enhanced Consumer Portal dependencies..."
    cd frontend/enhanced-consumer-portal
    npm install
    cd ../..
else
    echo "✅ Enhanced Consumer Portal dependencies already installed"
fi

# Farmer Portal dependencies
if [ ! -d "frontend/farmer-dapp/node_modules" ]; then
    echo "Installing Farmer Portal dependencies..."
    cd frontend/farmer-dapp
    npm install
    cd ../..
else
    echo "✅ Farmer Portal dependencies already installed"
fi

# Supply Chain Overview dependencies
if [ ! -d "frontend/supply-chain-overview/node_modules" ]; then
    echo "Installing Supply Chain Overview dependencies..."
    cd frontend/supply-chain-overview
    npm install
    cd ../..
else
    echo "✅ Supply Chain Overview dependencies already installed"
fi

# Consumer Portal dependencies
if [ ! -d "frontend/consumer-portal/node_modules" ]; then
    echo "Installing Consumer Portal dependencies..."
    cd frontend/consumer-portal
    npm install
    cd ../..
else
    echo "✅ Consumer Portal dependencies already installed"
fi

# Processor Portal dependencies
if [ ! -d "frontend/processor-portal/node_modules" ]; then
    echo "Installing Processor Portal dependencies..."
    cd frontend/processor-portal
    npm install
    cd ../..
else
    echo "✅ Processor Portal dependencies already installed"
fi

# Lab Portal dependencies
if [ ! -d "frontend/lab-portal/node_modules" ]; then
    echo "Installing Lab Portal dependencies..."
    cd frontend/lab-portal
    npm install
    cd ../..
else
    echo "✅ Lab Portal dependencies already installed"
fi

# Regulator Portal dependencies
if [ ! -d "frontend/regulator-portal/node_modules" ]; then
    echo "Installing Regulator Portal dependencies..."
    cd frontend/regulator-portal
    npm install
    cd ../..
else
    echo "✅ Regulator Portal dependencies already installed"
fi

echo ""
echo "🚀 Starting all services..."
echo ""

# Start Backend (CA-Connected Blockchain Mode)
echo "Starting Backend API Server (CA-Connected Mode)..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start Enhanced Consumer Portal (Main Demo Portal)
echo "Starting Enhanced Consumer Portal (Port 3010)..."
cd frontend/enhanced-consumer-portal && npm run dev &
ENHANCED_CONSUMER_PID=$!
cd ../..

# Start Farmer Portal
echo "Starting Farmer Portal (Port 3002)..."
cd frontend/farmer-dapp && npm run dev &
FARMER_PID=$!
cd ../..

# Start Supply Chain Overview
echo "Starting Supply Chain Overview (Port 3000)..."
cd frontend/supply-chain-overview && npm run dev &
OVERVIEW_PID=$!
cd ../..

# Start Consumer Portal (Original)
echo "Starting Consumer Portal (Port 3001)..."
cd frontend/consumer-portal && npm run dev &
CONSUMER_PID=$!
cd ../..

# Start Processor Portal
echo "Starting Processor Portal (Port 3004)..."
cd frontend/processor-portal && npm run dev &
PROCESSOR_PID=$!
cd ../..

# Start Lab Portal
echo "Starting Lab Portal (Port 3005)..."
cd frontend/lab-portal && npm run dev &
LAB_PID=$!
cd ../..

# Start Regulator Portal
echo "Starting Regulator Portal (Port 3006)..."
cd frontend/regulator-portal && npm run dev &
REGULATOR_PID=$!
cd ../..

echo ""
echo "========================================"
echo "   🎉 TRACE HERB SYSTEM STARTED!      "
echo "========================================"
echo ""
echo "🌐 Access Points:"
echo ""
echo "📱 MAIN DEMO - Enhanced Consumer Portal: http://localhost:3010"
echo "🚜 Farmer Portal:                       http://localhost:3002"  
echo "📊 Supply Chain Overview:               http://localhost:3000"
echo "👤 Consumer Portal (Original):          http://localhost:3001"
echo "🏭 Processor Portal:                    http://localhost:3004"
echo "🔬 Lab Portal:                          http://localhost:3005"
echo "🏛️  Regulator Portal:                   http://localhost:3006"
echo "🔧 Backend API:                         http://localhost:3000/api"
echo ""
echo "🔗 Blockchain Status: CA-Connected Mode (Certificate Authority)"
echo ""
echo "⚡ Demo QR Codes for Testing:"
echo "   • QR_DEMO_ASHWAGANDHA_001 (Ashwagandha Root)"
echo "   • QR_DEMO_TURMERIC_001    (Turmeric Powder)"
echo "   • QR_DEMO_BRAHMI_001      (Brahmi Leaves)"
echo "   • QR_DEMO_NEEM_001        (Neem Leaves)"
echo ""
echo "🎯 For Judges Demo: Start with Enhanced Consumer Portal"
echo "   1. Visit: http://localhost:3010"
echo "   2. Enter any demo QR code above"
echo "   3. View tracking progress → Click \"Advanced Insights\""
echo "   4. Create new batches in Farmer Portal"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $ENHANCED_CONSUMER_PID $FARMER_PID $OVERVIEW_PID $CONSUMER_PID $PROCESSOR_PID $LAB_PID $REGULATOR_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
