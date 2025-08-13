#!/bin/bash

# EZ-GEN Docker Build and Deploy Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to show usage
show_usage() {
    echo "🐳 EZ-GEN Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image"
    echo "  build-prod    Build production Docker image"
    echo "  run           Run the container"
    echo "  dev           Start development environment"
    echo "  prod          Start production environment"
    echo "  stop          Stop all containers"
    echo "  clean         Clean up containers and images"
    echo "  logs          Show container logs"
    echo "  shell         Access container shell"
    echo "  status        Show container status"
    echo "  update        Update and restart containers"
    echo ""
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build Docker image
build_image() {
    print_info "Building EZ-GEN Docker image..."
    docker build -t ez-gen:latest .
    print_success "Docker image built successfully!"
}

# Function to build production Docker image
build_prod_image() {
    print_info "Building EZ-GEN production Docker image..."
    docker build -f Dockerfile.prod -t ez-gen:prod .
    print_success "Production Docker image built successfully!"
}

# Function to run container
run_container() {
    print_info "Starting EZ-GEN container..."
    docker run -d \
        --name ez-gen-app \
        -p 3000:3000 \
        -v "$(pwd)/generated-apps:/app/generated-apps" \
        -v "$(pwd)/uploads:/app/uploads" \
        ez-gen:latest
    print_success "Container started! Access at http://localhost:3000"
}

# Function to start development environment
start_dev() {
    print_info "Starting development environment..."
    docker-compose up -d
    print_success "Development environment started! Access at http://localhost:3000"
}

# Function to start production environment
start_prod() {
    print_info "Starting production environment..."
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "Production docker-compose file not found!"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production environment started! Access at http://localhost:3000"
}

# Function to stop containers
stop_containers() {
    print_info "Stopping EZ-GEN containers..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker stop ez-gen-app 2>/dev/null || true
    docker rm ez-gen-app 2>/dev/null || true
    print_success "Containers stopped!"
}

# Function to clean up
cleanup() {
    print_warning "This will remove all EZ-GEN containers and images. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up containers and images..."
        stop_containers
        docker rmi ez-gen:latest 2>/dev/null || true
        docker rmi ez-gen:prod 2>/dev/null || true
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Function to show logs
show_logs() {
    if docker ps | grep -q ez-gen; then
        print_info "Showing EZ-GEN logs (press Ctrl+C to exit)..."
        if docker-compose ps | grep -q ez-gen; then
            docker-compose logs -f ez-gen
        else
            docker logs -f ez-gen-app
        fi
    else
        print_error "No running EZ-GEN containers found!"
    fi
}

# Function to access shell
access_shell() {
    if docker ps | grep -q ez-gen; then
        print_info "Accessing container shell..."
        if docker ps | grep -q ez-gen-app; then
            docker exec -it ez-gen-app bash
        elif docker ps | grep -q ez-gen_ez-gen; then
            docker exec -it ez-gen_ez-gen_1 bash
        else
            docker exec -it $(docker ps | grep ez-gen | awk '{print $1}' | head -n1) bash
        fi
    else
        print_error "No running EZ-GEN containers found!"
    fi
}

# Function to show status
show_status() {
    print_info "EZ-GEN Docker Status:"
    echo ""
    
    # Check images
    echo "📦 Images:"
    docker images | grep -E "(REPOSITORY|ez-gen)" || echo "  No EZ-GEN images found"
    echo ""
    
    # Check containers
    echo "🐳 Containers:"
    docker ps -a | grep -E "(CONTAINER|ez-gen)" || echo "  No EZ-GEN containers found"
    echo ""
    
    # Check if accessible
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "EZ-GEN is accessible at http://localhost:3000"
    else
        print_warning "EZ-GEN is not accessible at http://localhost:3000"
    fi
}

# Function to update
update_containers() {
    print_info "Updating EZ-GEN containers..."
    stop_containers
    build_image
    start_dev
    print_success "Update completed!"
}

# Main script logic
case "${1:-}" in
    "build")
        check_docker
        build_image
        ;;
    "build-prod")
        check_docker
        build_prod_image
        ;;
    "run")
        check_docker
        run_container
        ;;
    "dev")
        check_docker
        start_dev
        ;;
    "prod")
        check_docker
        start_prod
        ;;
    "stop")
        check_docker
        stop_containers
        ;;
    "clean")
        check_docker
        cleanup
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "shell")
        check_docker
        access_shell
        ;;
    "status")
        check_docker
        show_status
        ;;
    "update")
        check_docker
        update_containers
        ;;
    *)
        show_usage
        ;;
esac
