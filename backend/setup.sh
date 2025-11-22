#!/bin/bash

echo "Setting up Colly - College Life Management App"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "Starting PostgreSQL and Redis containers..."
npm run docker:up

echo "Waiting for services to be ready..."
sleep 10

echo "Installing dependencies..."
npm install

echo "Setting up database..."
npm run db:generate
npm run db:migrate

echo ""
echo "Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To stop the containers:"
echo "  npm run docker:down"
echo ""
echo "Happy coding!"