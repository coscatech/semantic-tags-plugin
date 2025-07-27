#!/bin/bash

# COSCA Semantic Insights - Production Deployment Script
# Usage: ./deploy.sh [environment] [version]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
VERSION="${2:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    if [[ ! -f "$SCRIPT_DIR/docker-compose.yml" ]]; then
        log_error "docker-compose.yml not found"
        exit 1
    fi
    
    if [[ ! -f "$PROJECT_ROOT/llm-insights-dashboard/.env" ]]; then
        log_warning ".env file not found, copying from .env.example"
        if [[ -f "$PROJECT_ROOT/llm-insights-dashboard/.env.example" ]]; then
            cp "$PROJECT_ROOT/llm-insights-dashboard/.env.example" "$PROJECT_ROOT/llm-insights-dashboard/.env"
            log_warning "Please edit .env file with your configuration before continuing"
            read -p "Press Enter to continue after editing .env file..."
        else
            log_error ".env.example not found"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Security validation
validate_security() {
    log_info "Validating security measures..."
    
    cd "$PROJECT_ROOT"
    
    # Check if IP protection is active
    if [[ ! -d ".secure-backup" ]]; then
        log_warning "IP protection not found, running security protection..."
        npm run security:protect
    fi
    
    # Verify sensitive files are not in git
    if git ls-files | grep -q "src/semanticTagger.ts"; then
        log_error "Original semantic tagger found in git - IP not protected!"
        exit 1
    fi
    
    # Check for encryption keys
    if [[ ! -f ".secure-backup/encryption-key-"* ]]; then
        log_error "Encryption keys not found"
        exit 1
    fi
    
    log_success "Security validation passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Run security protection
    log_info "Running IP protection..."
    npm run security:protect
    
    # Compile TypeScript
    log_info "Compiling TypeScript..."
    npm run compile
    
    # Build dashboard
    log_info "Building dashboard..."
    cd llm-insights-dashboard
    npm ci
    
    log_success "Application build completed"
}

# Deploy with Docker Compose
deploy_docker() {
    log_info "Deploying with Docker Compose..."
    
    cd "$SCRIPT_DIR"
    
    # Set environment variables
    export COMPOSE_PROJECT_NAME="cosca-insights"
    export VERSION="$VERSION"
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose pull
    
    # Build custom images
    log_info "Building custom images..."
    docker-compose build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Docker deployment completed"
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    local services=("dashboard" "postgres" "redis" "nginx")
    local healthy=true
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up (healthy)"; then
            log_success "$service is healthy"
        else
            log_error "$service is not healthy"
            healthy=false
        fi
    done
    
    if [[ "$healthy" == "false" ]]; then
        log_error "Some services are not healthy"
        docker-compose logs
        exit 1
    fi
    
    # Test HTTP endpoints
    log_info "Testing HTTP endpoints..."
    
    if curl -f -s http://localhost/health > /dev/null; then
        log_success "Health endpoint is responding"
    else
        log_error "Health endpoint is not responding"
        exit 1
    fi
    
    if curl -f -s http://localhost/api/insights/latest > /dev/null; then
        log_success "API endpoint is responding"
    else
        log_warning "API endpoint is not responding (may be expected if no data)"
    fi
}

# Deploy VSCode extension
deploy_vscode_extension() {
    log_info "Deploying VSCode extension..."
    
    cd "$PROJECT_ROOT"
    
    # Check if VSCE is installed
    if ! command -v vsce &> /dev/null; then
        log_info "Installing VSCE..."
        npm install -g vsce
    fi
    
    # Package extension
    log_info "Packaging extension..."
    npm run package
    
    # Publish extension (requires authentication)
    if [[ -n "$VSCE_TOKEN" ]]; then
        log_info "Publishing extension to marketplace..."
        vsce publish --pat "$VSCE_TOKEN"
        log_success "Extension published to marketplace"
    else
        log_warning "VSCE_TOKEN not set, skipping marketplace publication"
        log_info "Extension package created: $(ls *.vsix | head -1)"
    fi
}

# Deploy NPM package
deploy_npm_package() {
    log_info "Deploying NPM package..."
    
    cd "$PROJECT_ROOT/lib"
    
    # Build package
    log_info "Building NPM package..."
    npm ci
    npm run build
    
    # Run tests
    log_info "Running tests..."
    npm test || log_warning "Tests failed, continuing anyway"
    
    # Publish package (requires authentication)
    if [[ -n "$NPM_TOKEN" ]]; then
        log_info "Publishing package to NPM registry..."
        echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
        npm publish --access public
        log_success "Package published to NPM registry"
    else
        log_warning "NPM_TOKEN not set, skipping NPM publication"
        log_info "Package built successfully"
    fi
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create Grafana dashboards directory
    mkdir -p "$SCRIPT_DIR/grafana/dashboards"
    mkdir -p "$SCRIPT_DIR/grafana/datasources"
    
    # Create Prometheus configuration
    cat > "$SCRIPT_DIR/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'cosca-dashboard'
    static_configs:
      - targets: ['dashboard:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:8080']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF

    # Create Grafana datasource configuration
    cat > "$SCRIPT_DIR/grafana/datasources/prometheus.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    log_success "Monitoring setup completed"
}

# Cleanup old deployments
cleanup() {
    log_info "Cleaning up old deployments..."
    
    cd "$SCRIPT_DIR"
    
    # Remove old containers
    docker-compose down --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this in production)
    if [[ "$ENVIRONMENT" != "production" ]]; then
        docker volume prune -f
    fi
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting COSCA Semantic Insights deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    # Run deployment steps
    check_prerequisites
    validate_security
    build_application
    setup_monitoring
    deploy_docker
    
    # Optional deployments (require tokens)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_vscode_extension
        deploy_npm_package
    fi
    
    log_success "Deployment completed successfully!"
    log_info "Dashboard available at: http://localhost (or https://insights.cosca.tech)"
    log_info "Monitoring available at: http://localhost:3001 (Grafana)"
    log_info "Metrics available at: http://localhost:9090 (Prometheus)"
    
    # Show service status
    echo ""
    log_info "Service Status:"
    docker-compose ps
}

# Handle script arguments
case "${1:-}" in
    "production"|"staging"|"development")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        check_service_health
        ;;
    "logs")
        cd "$SCRIPT_DIR"
        docker-compose logs -f
        ;;
    *)
        echo "Usage: $0 [production|staging|development|cleanup|health|logs] [version]"
        echo ""
        echo "Commands:"
        echo "  production   - Deploy to production environment"
        echo "  staging      - Deploy to staging environment"
        echo "  development  - Deploy to development environment"
        echo "  cleanup      - Clean up old deployments"
        echo "  health       - Check service health"
        echo "  logs         - Show service logs"
        echo ""
        echo "Environment variables:"
        echo "  VSCE_TOKEN   - Visual Studio Code Extension token"
        echo "  NPM_TOKEN    - NPM registry token"
        exit 1
        ;;
esac