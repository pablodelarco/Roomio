# Multi-stage build for StayWell Manager
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with network retry
RUN npm ci --silent --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Stage 2: Production runtime
FROM nginx:1.25-alpine AS runtime

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/cache/nginx /tmp && \
    chown -R nginx:nginx /var/cache/nginx /tmp /usr/share/nginx/html && \
    chmod 755 /var/cache/nginx /tmp && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check using nginx status
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
