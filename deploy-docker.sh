#!/bin/bash
# Build and run StreamHub with Docker

set -e

echo "🐳 StreamHub Docker Builder"
echo "============================"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Use docker-compose or docker compose
DOCKER_COMPOSE="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
fi

# Ask what to build
echo "What do you want to deploy?"
echo "1) Full stack (Frontend + Backend + PostgreSQL)"
echo "2) Frontend only (Backend must be running separately)"
echo "3) Backend only (Frontend must be running separately)"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Building full stack..."
    echo ""
    
    # Check if apistreamhub-fastapi exists
    if [ ! -d "./apistreamhub-fastapi" ]; then
      echo "❌ Backend directory not found: ./apistreamhub-fastapi"
      echo "Please clone the backend first:"
      echo "  git clone https://github.com/your-username/apistreamhub-fastapi.git"
      exit 1
    fi
    
    # Build and run full stack
    $DOCKER_COMPOSE -f docker-compose-full.yml down
    $DOCKER_COMPOSE -f docker-compose-full.yml build --no-cache
    $DOCKER_COMPOSE -f docker-compose-full.yml up -d
    
    echo ""
    echo "✅ Full stack deployed!"
    echo ""
    echo "📍 URLs:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:8001"
    echo "  Database:  localhost:5432"
    echo ""
    echo "📊 Logs:"
    echo "  View logs: $DOCKER_COMPOSE -f docker-compose-full.yml logs -f"
    echo "  Stop all:  $DOCKER_COMPOSE -f docker-compose-full.yml down"
    ;;
    
  2)
    echo ""
    echo "🚀 Building frontend only..."
    echo ""
    
    # Build and run frontend only
    $DOCKER_COMPOSE -f docker-compose-frontend.yml down
    $DOCKER_COMPOSE -f docker-compose-frontend.yml build --no-cache
    $DOCKER_COMPOSE -f docker-compose-frontend.yml up -d
    
    echo ""
    echo "✅ Frontend deployed!"
    echo ""
    echo "📍 URL:"
    echo "  Frontend:  http://localhost:3000"
    echo ""
    echo "⚠️  Make sure backend is running at http://localhost:8001"
    echo ""
    echo "📊 Logs:"
    echo "  View logs: $DOCKER_COMPOSE -f docker-compose-frontend.yml logs -f"
    echo "  Stop:      $DOCKER_COMPOSE -f docker-compose-frontend.yml down"
    ;;
    
  3)
    echo ""
    echo "❌ Backend-only deployment not yet implemented."
    echo "Please use option 1 (full stack) or run backend manually."
    exit 1
    ;;
    
  *)
    echo "❌ Invalid option. Exiting."
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
