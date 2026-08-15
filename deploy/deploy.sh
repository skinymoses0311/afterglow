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
sudo chown -R www-data:www-data "$target"

# Atomic swap: write the new symlink beside the old one, then rename over it.
sudo ln -sfn "$target" "$WEB_ROOT/current.new"
sudo mv -Tf "$WEB_ROOT/current.new" "$WEB_ROOT/current"

echo "==> Reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Pruning old releases (keeping $KEEP)"
# shellcheck disable=SC2012
ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
    echo "    removing $old"
    sudo rm -rf "$old"
done

echo "==> Done — live at https://afterglowcredit.online"
