#!/usr/bin/env bash
#
# Move the live site from afterglowcredit.online to afterglowcredit.com.
#
#   sudo -v && ./deploy/cutover-to-com.sh
#
# Run this ONLY after the GoDaddy A records for afterglowcredit.com and
# www.afterglowcredit.com point at this server. The preflight refuses to run
# otherwise, because doing this early would expand the certificate against
# hostnames that still resolve to the old site and burn a Let's Encrypt failure.
#
# It does not touch DNS, and it does not touch mail records. Everything here is
# server-side and reversible from the backup it takes.

set -euo pipefail

VPS_IP="72.61.207.7"
CERT_NAME="afterglowcredit.online"   # the existing lineage; expanded, not replaced
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_AVAILABLE="/etc/nginx/sites-available/afterglow"
BACKUP="/etc/nginx/sites-available/afterglow.pre-com.$(date +%Y%m%d%H%M%S)"

ALL_NAMES=(afterglowcredit.com www.afterglowcredit.com
           afterglowcredit.online www.afterglowcredit.online)

say() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[31mAborted: %s\033[0m\n' "$1" >&2; exit 1; }

# --------------------------------------------------------------- preflight
say "Preflight: do all four hostnames resolve to this server?"
for name in "${ALL_NAMES[@]}"; do
    got="$(dig +short A "$name" | tail -1)"
    if [ "$got" = "$VPS_IP" ]; then
        printf '    %-34s -> %s  ok\n' "$name" "$got"
    else
        printf '    %-34s -> %s  EXPECTED %s\n' "$name" "${got:-(nothing)}" "$VPS_IP"
        die "$name does not point here yet. Update the GoDaddy A record and wait for the TTL to expire."
    fi
done

say "Preflight: confirming the mail records are untouched"
mx="$(dig +short MX afterglowcredit.com | wc -l)"
[ "$mx" -ge 1 ] || die "afterglowcredit.com has no MX records. Mail would be broken — stopping."
printf '    %s MX records present, mail DNS intact\n' "$mx"

# --------------------------------------------- let ACME reach us on the new host
say "Adding the .com hostnames to the current config so the ACME challenge can pass"
sudo cp "$SITE_AVAILABLE" "$BACKUP"
printf '    backup: %s\n' "$BACKUP"

sudo sed -i \
  's/^\(\s*server_name\s\+\)afterglowcredit\.online www\.afterglowcredit\.online;/\1afterglowcredit.online www.afterglowcredit.online afterglowcredit.com www.afterglowcredit.com;/' \
  "$SITE_AVAILABLE"
sudo nginx -t
sudo systemctl reload nginx

# ------------------------------------------------------------ expand the cert
say "Expanding the certificate to cover all four hostnames"
sudo certbot certonly --nginx --cert-name "$CERT_NAME" --expand --non-interactive --agree-tos \
    $(printf -- '-d %s ' "${ALL_NAMES[@]}")

sudo certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry"

# -------------------------------------------------------- install final config
say "Installing the canonical-host config"
sudo cp "$REPO_DIR/deploy/nginx-com.conf" "$SITE_AVAILABLE"
sudo nginx -t
sudo systemctl reload nginx

# ------------------------------------------------------------------- verify
say "Verifying"
for name in "${ALL_NAMES[@]}"; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "https://$name/" || echo ERR)"
    loc="$(curl -sS -o /dev/null -w '%{redirect_url}' "https://$name/" || true)"
    printf '    https://%-34s -> %s %s\n' "$name" "$code" "$loc"
done
printf '\n    deep link preserved through the redirect:\n'
curl -sS -o /dev/null -w '      https://afterglowcredit.online/waitlist -> %{http_code} %{redirect_url}\n' \
    https://afterglowcredit.online/waitlist

say "Done. Canonical host is now https://afterglowcredit.com"
echo "    Roll back with: sudo cp $BACKUP $SITE_AVAILABLE && sudo nginx -t && sudo systemctl reload nginx"
