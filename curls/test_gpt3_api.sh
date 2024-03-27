#!/bin/bash

# The URL of the backend endpoint
URL="http://127.0.0.1:8080/api/test_gpt3"

# Making a GET request to the backend endpoint
curl -X GET $URL
