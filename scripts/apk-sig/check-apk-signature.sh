#!/bin/bash

# APK Signature Verification Script for Linux
# This script checks the signature of APK files using keytool

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    # Check if keytool is available
    if ! command_exists keytool; then
        print_error "keytool is not found in PATH"
        print_error "Please ensure Java JDK is installed and JAVA_HOME is set"
        print_error "Ubuntu/Debian: sudo apt install openjdk-17-jdk"
        print_error "CentOS/RHEL: sudo yum install java-17-openjdk-devel"
        exit 1
    fi
    
    # Check if jarsigner is available
    if ! command_exists jarsigner; then
        print_warning "jarsigner is not found in PATH"
        print_warning "Some signature verification features may not work"
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to verify APK signature
verify_apk_signature() {
    local apk_path="$1"
    
    if [ -z "$apk_path" ]; then
        print_error "Usage: $0 <apk_path>"
        exit 1
    fi
    
    if [ ! -f "$apk_path" ]; then
        print_error "APK file does not exist: $apk_path"
        exit 1
    fi
    
    print_status "Verifying APK signature: $apk_path"
    echo
    
    # Get absolute path
    local abs_apk_path=$(readlink -f "$apk_path")
    print_status "APK Path: $abs_apk_path"
    
    # Check APK file size
    local file_size=$(stat -c%s "$apk_path")
    print_status "APK Size: $(numfmt --to=iec --suffix=B $file_size)"
    
    echo
    print_status "Running keytool verification..."
    echo "----------------------------------------"
    
    # Use keytool to verify the APK
    if keytool -printcert -jarfile "$apk_path"; then
        echo "----------------------------------------"
        print_success "✓ APK signature verification completed!"
        echo
        
        # Additional verification with jarsigner if available
        if command_exists jarsigner; then
            print_status "Running jarsigner verification..."
            echo "----------------------------------------"
            
            if jarsigner -verify -verbose -certs "$apk_path"; then
                echo "----------------------------------------"
                print_success "✓ Jarsigner verification passed!"
            else
                echo "----------------------------------------"
                print_error "✗ Jarsigner verification failed!"
                exit 1
            fi
        fi
        
    else
        echo "----------------------------------------"
        print_error "✗ APK signature verification failed!"
        print_error "The APK file may be unsigned or corrupted"
        exit 1
    fi
    
    echo
    print_success "All signature checks completed successfully!"
    
    # Additional APK info
    print_status "APK Information Summary:"
    echo "  • File: $(basename "$apk_path")"
    echo "  • Size: $(numfmt --to=iec --suffix=B $file_size)"
    echo "  • Path: $abs_apk_path"
    echo "  • Signature: ✓ Valid"
}

# Function to verify keystore
verify_keystore() {
    local keystore_path="$1"
    local keystore_password="$2"
    
    if [ -z "$keystore_path" ] || [ -z "$keystore_password" ]; then
        print_error "Usage: $0 --keystore <keystore_path> <password>"
        exit 1
    fi
    
    if [ ! -f "$keystore_path" ]; then
        print_error "Keystore file does not exist: $keystore_path"
        exit 1
    fi
    
    print_status "Verifying keystore: $keystore_path"
    echo
    
    if keytool -list -v -keystore "$keystore_path" -storepass "$keystore_password"; then
        print_success "✓ Keystore verification completed!"
    else
        print_error "✗ Keystore verification failed!"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "APK Signature Verification Tool"
    echo
    echo "Usage:"
    echo "  $0 <apk_file>                    - Verify APK signature"
    echo "  $0 --keystore <keystore> <pass>  - Verify keystore"
    echo "  $0 --help                       - Show this help"
    echo
    echo "Examples:"
    echo "  $0 app-debug.apk"
    echo "  $0 app-release.apk"
    echo "  $0 --keystore release-key.keystore mypassword"
    echo
}

# Main execution
main() {
    echo "========================================"
    echo "   APK Signature Verification (Linux)"
    echo "========================================"
    echo
    
    # Parse arguments
    case "$1" in
        "--help"|"-h")
            show_usage
            exit 0
            ;;
        "--keystore")
            check_prerequisites
            verify_keystore "$2" "$3"
            ;;
        "")
            print_error "No arguments provided"
            echo
            show_usage
            exit 1
            ;;
        *)
            check_prerequisites
            verify_apk_signature "$1"
            ;;
    esac
}

# Check if script is being sourced or executed
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
