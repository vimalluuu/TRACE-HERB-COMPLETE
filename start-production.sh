#!/bin/sh

# TRACE HERB - Production Startup Script

echo "🚀 Starting TRACE HERB Production System..."

# Start backend in background
echo "🔧 Starting Backend API..."
cd /app/backend && npm start &

# Wait for backend to start
sleep 5

# Start frontend portals
echo "🧑‍🌾 Starting Farmer Portal..."
cd /app/frontend/farmer-dapp && npm start &

echo "👥 Starting Consumer Portal..."
cd /app/frontend/enhanced-consumer-portal && npm start &

echo "🏭 Starting Processor Portal..."
cd /app/frontend/processor-portal && npm start &

echo "🔬 Starting Lab Portal..."
cd /app/frontend/lab-portal && npm start &

echo "🏛️ Starting Regulator Portal..."
cd /app/frontend/regulator-portal && npm start &

echo "📊 Starting Stakeholder Dashboard..."
cd /app/frontend/stakeholder-dashboard && npm start &

echo "🏢 Starting Management Portal..."
cd /app/frontend/management-portal && npm start &

echo "🔗 Starting Supply Chain Overview..."
cd /app/frontend/supply-chain-overview && npm start &

echo "✅ All services started!"
echo "🌐 TRACE HERB is now running in production mode"

# Keep container running
wait
