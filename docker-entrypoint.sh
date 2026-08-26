#!/bin/sh
set -e

# Default backend URL if not provided
MOXELA_BACKEND_URL=${MOXELA_BACKEND_URL:-http://stark.oslo.nevion.com}

echo "MOXELA UI starting..."
echo "  Backend URL : $MOXELA_BACKEND_URL"
echo "  Proxying    : /api/ → $MOXELA_BACKEND_URL/api/"

# Substitute env vars into nginx template
envsubst '${MOXELA_BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "nginx config generated, starting nginx..."
exec nginx -g 'daemon off;'
