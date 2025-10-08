#!/bin/bash
# Script to sync image tags between overlays when merging branches
# Usage: ./scripts/sync-image-tags.sh <source-overlay> <target-overlay>
# Example: ./scripts/sync-image-tags.sh development staging

set -e

SOURCE_OVERLAY=$1
TARGET_OVERLAY=$2

if [ -z "$SOURCE_OVERLAY" ] || [ -z "$TARGET_OVERLAY" ]; then
  echo "Usage: $0 <source-overlay> <target-overlay>"
  echo "Example: $0 development staging"
  exit 1
fi

SOURCE_FILE="k8s/overlays/${SOURCE_OVERLAY}/kustomization.yaml"
TARGET_FILE="k8s/overlays/${TARGET_OVERLAY}/kustomization.yaml"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Error: Source file not found: $SOURCE_FILE"
  exit 1
fi

if [ ! -f "$TARGET_FILE" ]; then
  echo "Error: Target file not found: $TARGET_FILE"
  exit 1
fi

# Extract the image tag from source overlay
SOURCE_TAG=$(grep "newTag:" "$SOURCE_FILE" | awk '{print $2}')

if [ -z "$SOURCE_TAG" ]; then
  echo "Error: Could not find image tag in $SOURCE_FILE"
  exit 1
fi

echo "📦 Source overlay: $SOURCE_OVERLAY"
echo "🎯 Target overlay: $TARGET_OVERLAY"
echo "🏷️  Image tag: $SOURCE_TAG"

# Update the target overlay with the source tag
sed -i "s|newTag: .*|newTag: $SOURCE_TAG|" "$TARGET_FILE"

echo "✅ Updated $TARGET_FILE with tag: $SOURCE_TAG"

# Show the change
echo ""
echo "Updated section:"
grep -A2 "images:" "$TARGET_FILE"
