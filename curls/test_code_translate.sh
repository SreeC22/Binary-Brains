#!/bin/bash

# The URL of the backend endpoint
URL="http://127.0.0.1:8080/api/translate_code"

# # JSON payload
# PAYLOAD='{
#   "source_code":"print('"'"'Hello, world!'"'"')",
#   "source_language":"Python",
#   "target_language":"Java"
# }'

# Making a POST request to the backend endpoint
curl -X POST $URL \
-H "Content-Type:application/json" \
-d "$PAYLOAD"