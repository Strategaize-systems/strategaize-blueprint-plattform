#!/bin/sh
set -e

# Substitute environment variables in kong.yml template using sed
# (works on any base image without envsubst)
sed \
  -e "s|\${NEXT_PUBLIC_SUPABASE_ANON_KEY}|${NEXT_PUBLIC_SUPABASE_ANON_KEY}|g" \
  -e "s|\${SUPABASE_SERVICE_ROLE_KEY}|${SUPABASE_SERVICE_ROLE_KEY}|g" \
  /var/lib/kong/kong.yml.template > /var/lib/kong/kong.yml

exec /docker-entrypoint.sh kong docker-start
