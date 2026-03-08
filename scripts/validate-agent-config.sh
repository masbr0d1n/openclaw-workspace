#!/bin/bash

# validate-agent-config.sh
# Validates agent configuration files for Discord channels
# Usage: ./validate-agent-config.sh <channel-id> | ./validate-agent-config.sh --all

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
CHANNELS_DIR="$WORKSPACE_DIR/discord/channels"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required files
REQUIRED_FILES=("IDENTITY.md" "SOUL.md" "AGENTS.md")
OPTIONAL_FILES=("TOOLS.md")

# Helper functions
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Validate single channel
validate_channel() {
    local channel_id=$1
    local channel_dir="$CHANNELS_DIR/$channel_id"
    local has_errors=0
    
    print_header "Validating Channel: $channel_id"
    
    # Check if directory exists
    if [ ! -d "$channel_dir" ]; then
        print_error "Directory not found: $channel_dir"
        return 1
    fi
    
    print_info "Location: $channel_dir"
    echo ""
    
    # Check required files
    echo "Required Files:"
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$channel_dir/$file" ]; then
            local size=$(wc -c < "$channel_dir/$file")
            print_success "$file exists ($size bytes)"
            
            # Check if file is not empty
            if [ "$size" -eq 0 ]; then
                print_warning "$file is empty!"
                has_errors=1
            fi
        else
            print_error "$file is MISSING"
            has_errors=1
        fi
    done
    
    echo ""
    
    # Check optional files
    echo "Optional Files:"
    for file in "${OPTIONAL_FILES[@]}"; do
        if [ -f "$channel_dir/$file" ]; then
            local size=$(wc -c < "$channel_dir/$file")
            print_success "$file exists ($size bytes)"
        else
            print_warning "$file not found (optional)"
        fi
    done
    
    echo ""
    
    # Validate content structure
    echo "Content Validation:"
    
    # Check IDENTITY.md structure
    if [ -f "$channel_dir/IDENTITY.md" ]; then
        if grep -q "# IDENTITY" "$channel_dir/IDENTITY.md"; then
            print_success "IDENTITY.md has proper header"
        else
            print_warning "IDENTITY.md missing '# IDENTITY' header"
        fi
        
        if grep -q "Agent ID\|agent_id\|AgentID" "$channel_dir/IDENTITY.md"; then
            print_success "IDENTITY.md contains agent identifier"
        else
            print_warning "IDENTITY.md missing agent identifier"
        fi
    fi
    
    # Check SOUL.md structure
    if [ -f "$channel_dir/SOUL.md" ]; then
        if grep -q "# SOUL" "$channel_dir/SOUL.md"; then
            print_success "SOUL.md has proper header"
        else
            print_warning "SOUL.md missing '# SOUL' header"
        fi
        
        if grep -q "Core\|Belief\|Principle\|Philosophy" "$channel_dir/SOUL.md"; then
            print_success "SOUL.md contains core beliefs/principles"
        else
            print_warning "SOUL.md may be missing core beliefs"
        fi
    fi
    
    # Check AGENTS.md structure
    if [ -f "$channel_dir/AGENTS.md" ]; then
        if grep -q "# AGENTS" "$channel_dir/AGENTS.md"; then
            print_success "AGENTS.md has proper header"
        else
            print_warning "AGENTS.md missing '# AGENTS' header"
        fi
        
        if grep -q "Behavioral\|Directive\|Standard\|Protocol" "$channel_dir/AGENTS.md"; then
            print_success "AGENTS.md contains behavioral directives"
        else
            print_warning "AGENTS.md may be missing behavioral directives"
        fi
    fi
    
    echo ""
    
    # Summary
    if [ $has_errors -eq 0 ]; then
        print_success "✓ Channel $channel_id validation PASSED"
        return 0
    else
        print_error "✗ Channel $channel_id validation FAILED (has errors)"
        return 1
    fi
}

# Validate all channels
validate_all() {
    print_header "Validating All Channel Configurations"
    
    local total=0
    local passed=0
    local failed=0
    
    # Check if channels directory exists
    if [ ! -d "$CHANNELS_DIR" ]; then
        print_error "Channels directory not found: $CHANNELS_DIR"
        exit 1
    fi
    
    # Iterate through channel directories
    for channel_dir in "$CHANNELS_DIR"/*/; do
        if [ -d "$channel_dir" ]; then
            local channel_id=$(basename "$channel_dir")
            total=$((total + 1))
            
            if validate_channel "$channel_id"; then
                passed=$((passed + 1))
            else
                failed=$((failed + 1))
            fi
        fi
    done
    
    # Summary
    print_header "Validation Summary"
    echo -e "Total Channels: ${BLUE}$total${NC}"
    echo -e "Passed: ${GREEN}$passed${NC}"
    echo -e "Failed: ${RED}$failed${NC}"
    echo ""
    
    if [ $failed -eq 0 ]; then
        print_success "All channel configurations are valid!"
        return 0
    else
        print_error "$failed channel(s) have validation errors"
        return 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 <channel-id> | --all"
    echo ""
    echo "Options:"
    echo "  <channel-id>    Validate specific channel (e.g., 1480203406420217928)"
    echo "  --all           Validate all channels"
    echo "  --help, -h      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 1480203406420217928    # Validate #single-fe channel"
    echo "  $0 --all                  # Validate all configured channels"
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        print_error "No arguments provided"
        show_usage
        exit 1
    fi
    
    case "$1" in
        --all)
            validate_all
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            validate_channel "$1"
            ;;
    esac
}

main "$@"
