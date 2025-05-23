#!/bin/bash

# GitHub Actions Linter Script
# Lints all YAML files in .github directory and subdirectories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Check if actionlint is installed
check_actionlint() {
    if ! command -v actionlint &> /dev/null; then
        print_color $RED "❌ actionlint is not installed"
        echo ""
        echo "Install actionlint:"
        echo "  macOS: brew install actionlint"
        echo "  Linux: Download from https://github.com/rhymond/actionlint/releases"
        echo "  Or use: go install github.com/rhymond/actionlint/cmd/actionlint@latest"
        exit 1
    fi
}

# Check if .github directory exists
check_github_dir() {
    if [ ! -d ".github" ]; then
        print_color $YELLOW "⚠️  No .github directory found in current path"
        print_color $BLUE "ℹ️  Current directory: $(pwd)"
        exit 0
    fi
}

# Find and lint YAML files
lint_yaml_files() {
    print_color $BLUE "🔍 Searching for YAML files in .github directory..."
    
    # Find all .yml and .yaml files in .github directory and subdirectories
    local yaml_files
    yaml_files=$(find .github -type f \( -name "*.yml" -o -name "*.yaml" \) 2>/dev/null || true)
    
    if [ -z "$yaml_files" ]; then
        print_color $YELLOW "⚠️  No YAML files found in .github directory"
        return 0
    fi
    
    local total_files=0
    local passed_files=0
    local failed_files=0
    
    echo ""
    print_color $BLUE "📋 Found YAML files:"
    
    # Process each file
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        
        total_files=$((total_files + 1))
        printf "  • %s\n" "$file"
        
        # Check if it's likely a GitHub Actions workflow
        if grep -q "jobs:" "$file" 2>/dev/null; then
            echo "    → GitHub Actions workflow detected"
            
            # Run actionlint on the file
            if actionlint "$file" 2>/dev/null; then
                print_color $GREEN "    ✅ Passed"
                passed_files=$((passed_files + 1))
            else
                print_color $RED "    ❌ Failed"
                echo "    Errors:"
                actionlint "$file" 2>&1 | sed 's/^/      /'
                failed_files=$((failed_files + 1))
            fi
        else
            print_color $YELLOW "    ⏭️  Skipped (not a GitHub Actions workflow)"
        fi
        echo ""
    done <<< "$yaml_files"
    
    # Summary
    print_color $BLUE "📊 Summary:"
    printf "  Total YAML files: %d\n" "$total_files"
    printf "  Workflows passed: %d\n" "$passed_files"
    printf "  Workflows failed: %d\n" "$failed_files"
    printf "  Skipped files: %d\n" $((total_files - passed_files - failed_files))
    
    if [ $failed_files -gt 0 ]; then
        echo ""
        print_color $RED "❌ Some workflows failed validation"
        exit 1
    elif [ $passed_files -gt 0 ]; then
        echo ""
        print_color $GREEN "🎉 All workflows passed validation!"
    fi
}

# Main execution
main() {
    print_color $BLUE "🚀 GitHub Actions Linter"
    echo "========================================"
    
    check_actionlint
    check_github_dir
    lint_yaml_files
}

# Run the script
main "$@"
