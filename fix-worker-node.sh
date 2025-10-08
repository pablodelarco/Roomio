#!/bin/bash

# Script to fix worker node kubelet API connectivity by using Tailscale IP
# This script should be run on the worker node with: sudo bash fix-worker-node.sh

set -e

echo "🔧 Fixing worker node kubelet API connectivity..."

# Get current Tailscale IP
TAILSCALE_IP=$(tailscale ip -4)
echo "📍 Worker Tailscale IP: $TAILSCALE_IP"

# Create k3s config directory if it doesn't exist
echo "� Creating k3s config directory..."
mkdir -p /etc/rancher/k3s

# Create k3s agent configuration file
echo "📝 Creating k3s agent configuration..."
cat > /etc/rancher/k3s/config.yaml << EOF
node-ip: $TAILSCALE_IP
EOF

echo "✅ Configuration created:"
cat /etc/rancher/k3s/config.yaml

# Restart k3s-agent to apply new configuration
echo "🔄 Restarting k3s-agent to apply new configuration..."
systemctl restart k3s-agent

# Wait for service to start
echo "⏳ Waiting for k3s-agent to start..."
sleep 15

# Check service status
echo "✅ Checking k3s-agent status..."
systemctl status k3s-agent --no-pager -l | head -20

echo "🎉 Worker node fix completed!"
echo "📝 The node should now register with IP: $TAILSCALE_IP"
echo "🔍 Check with: kubectl get nodes -o wide"
echo "🧪 Test kubelet API with: kubectl logs <pod-on-worker>"
