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
# Source .zshrc to ensure nvm/node are loaded if run from cron
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
fi

# Execute and capture output
# 'npx tsx' is used to run the TypeScript file directly
/usr/local/bin/npx tsx scripts/pinterest-poster.ts >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Completed successfully: $(date)" >> "$LOG_FILE"
else
    echo "Failed with exit code $EXIT_CODE: $(date)" >> "$LOG_FILE"
fi
echo "----------------------------------------" >> "$LOG_FILE"
