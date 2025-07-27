# Multi-stage build for COSCA Insights Dashboard
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create production build
RUN npm run build 2>/dev/null || echo "No build script found"

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cosca -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy application code from builder
COPY --from=builder --chown=cosca:nodejs /app .

# Create necessary directories
RUN mkdir -p data logs reports && \
    chown -R cosca:nodejs data logs reports

# Switch to non-root user
USER cosca

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]