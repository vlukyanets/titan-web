#!/bin/sh
# Packs the production build (dist/) into titan-web-<version>.tar.gz with a
# .sha256 file next to it. The archive holds the contents of dist/ at its
# root. Names are sorted and times, owners and gzip headers are fixed, so the
# same build always gives the same hash, which titan's image build pins
# (ADR 0002). Needs GNU tar.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f dist/index.html ]; then
  echo "dist/ has no build; run pnpm build first" >&2
  exit 1
fi

version=$(node -p "require('./package.json').version")
archive="titan-web-${version}.tar.gz"

tar --sort=name --format=gnu --mtime='@0' --owner=0 --group=0 --numeric-owner \
  --mode='u=rwX,go=rX' -C dist -cf - . | gzip -9 -n > "$archive"
sha256sum "$archive" > "$archive.sha256"

cat "$archive.sha256"
