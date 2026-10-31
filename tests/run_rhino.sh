#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Fixed official Maven artifacts; keep TLS and artifact checksum verification enabled.
tool_dir="${LEGADO_TEST_TOOLS:-/workspace/legado-test-tools}"
mkdir -p "$tool_dir"
fetch() {
  local filename="$1" digest="$2" url="$3"
  if [[ ! -f "$tool_dir/$filename" ]]; then
    curl --fail --show-error --silent --location "$url" -o "$tool_dir/$filename.tmp"
    printf '%s  %s\n' "$digest" "$tool_dir/$filename.tmp" | sha256sum --check --status
    mv "$tool_dir/$filename.tmp" "$tool_dir/$filename"
  fi
  printf '%s  %s\n' "$digest" "$tool_dir/$filename" | sha256sum --check --status
}
fetch rhino-1.7.15.jar 2427fdcbc149ca0a25ccfbb7c71b01f39ad42708773a47816cd2342861766b63 https://repo.maven.apache.org/maven2/org/mozilla/rhino/1.7.15/rhino-1.7.15.jar
fetch jsoup-1.18.3.jar 5be1ccd3228ae5fd6eed1bd6d827bac2bc65b91c20e9957d16ea65f739f15302 https://repo.maven.apache.org/maven2/org/jsoup/jsoup/1.18.3/jsoup-1.18.3.jar
exec java -cp "$tool_dir/rhino-1.7.15.jar:$tool_dir/jsoup-1.18.3.jar" org.mozilla.javascript.tools.shell.Main -version 200 -f tests/rhino_99csw.js
