#!/usr/bin/env bash
#
# Build the site and publish it to the nginx web root.
#
#   ./deploy/deploy.sh
#
# Builds into dist/, copies to a timestamped release directory, then atomically
# flips the `current` symlink. Keeps the last 5 releases so a bad deploy can be
# rolled back by repointing the symlink.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_ROOT="/var/www/afterglow"
RELEASES="$WEB_ROOT/releases"
KEEP=5

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$REPO_DIR"

echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Building"
npm run build

stamp="$(date +%Y%m%d%H%M%S)"
target="$RELEASES/$stamp"

echo "==> Publishing release $stamp"
sudo mkdir -p "$target"
sudo cp -r dist/. "$target/"

# Pages load their code in chunks, and a visitor can still have a page from the
# previous release open when this one goes live — its chunks must still be
# there when it asks. So carry recent assets forward. Hashed names never clash,
# and -p keeps each file's original date, so anything older than a week drops
# away instead of piling up release after release.
if [ -d "$WEB_ROOT/current/assets" ]; then
    sudo find "$WEB_ROOT/current/assets/" -maxdepth 1 -type f -mtime -7 \
        -exec cp -p --update=none {} "$target/assets/" \;
fi
sudo chown -R www-data:www-data "$target"

echo "==> Installing nginx config"
# Shipped with every deploy because the config and the build depend on each
# other: nginx serves the pre-rendered pages as files and 404s anything else.
# Nothing takes effect until the reload below, and a config that fails its test
# is put back before the release goes live.
NGINX_SITE=/etc/nginx/sites-available/afterglow
NGINX_HEADERS=/etc/nginx/snippets/afterglow-headers.conf
sudo cp "$NGINX_SITE" "$NGINX_SITE.previous"
sudo cp "$NGINX_HEADERS" "$NGINX_HEADERS.previous"
sudo cp deploy/nginx-com.conf "$NGINX_SITE"
sudo cp deploy/security-headers.conf "$NGINX_HEADERS"
if ! sudo nginx -t; then
    sudo cp "$NGINX_SITE.previous" "$NGINX_SITE"
    sudo cp "$NGINX_HEADERS.previous" "$NGINX_HEADERS"
    echo "nginx config failed its test; restored the previous one. Nothing was published." >&2
    exit 1
fi

# Atomic swap: write the new symlink beside the old one, then rename over it.
sudo ln -sfn "$target" "$WEB_ROOT/current.new"
sudo mv -Tf "$WEB_ROOT/current.new" "$WEB_ROOT/current"

echo "==> Reloading nginx"
sudo systemctl reload nginx

echo "==> Pruning old releases (keeping $KEEP)"
# shellcheck disable=SC2012
ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
    echo "    removing $old"
    sudo rm -rf "$old"
done

echo "==> Done — live at https://afterglowcredit.com"
