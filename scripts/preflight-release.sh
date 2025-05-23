#!/bin/bash

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ 'act' is not installed."
    echo "visit: https://github.com/nektos/act#installation"
    exit 1
fi

# Detect OS and set container architecture for macOS
CONTAINER_ARCH=""
if [[ "$(uname -s)" == "Darwin" ]]; then
    CONTAINER_ARCH="--container-architecture linux/amd64"
    echo "macOS detected - using linux/amd64 container architecture"
fi

act workflow_dispatch \
  -W .github/workflows/release-dry-run.yml \
  -s NPM_TOKEN=$NPM_TOKEN \
   $CONTAINER_ARCH
