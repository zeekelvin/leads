#!/bin/bash
# Inject environment variables into a JS config file at build time
echo "window.__GOOGLE_API_KEY='${GOOGLE_API_KEY:-}';" > env-config.js
