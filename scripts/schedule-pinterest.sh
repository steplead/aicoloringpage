#!/bin/bash

# Configuration
PROJECT_DIR="/Users/bruno2025/Documents/iProjects/aicoloringpage"
LOG_FILE="$PROJECT_DIR/pinterest-auto.log"

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Log Start
echo "----------------------------------------" >> "$LOG_FILE"
echo "Starting Pinterest Automation: $(date)" >> "$LOG_FILE"

# Run the script using npx (assuming node is in path, or use absolute path to node if needed)
# Ensure Homebrew binaries (npm, node) are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Execute and capture output
# Uses the 'pinterest' script defined in package.json
/opt/homebrew/bin/npm run pinterest >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Completed successfully: $(date)" >> "$LOG_FILE"
else
    echo "Failed with exit code $EXIT_CODE: $(date)" >> "$LOG_FILE"
fi
echo "----------------------------------------" >> "$LOG_FILE"
