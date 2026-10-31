"""Regenerate synthetic expected outputs from the reviewed, pinned upstream decoder.

Usage: python3 tests/generate_upstream_99csw.py /path/to/99csw_dl
Requires beautifulsoup4 and lxml only for regeneration, not normal tests.
"""
import argparse
import base64
import importlib.util
import json
from pathlib import Path
import random
import subprocess

PIN = 'f0a71d5b7803c6a982927a1bd7f89051572aee47'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('checkout', type=Path)
    checkout = parser.parse_args().checkout.resolve()
    head = subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'HEAD'], text=True).strip()
    if head != PIN:
        raise SystemExit('Upstream HEAD must match reviewed commit ' + PIN)
    relative = 'ninetynine_dl/core/decoder.py'
    expected_source = subprocess.check_output(['git', '-C', str(checkout), 'show', f'{PIN}:{relative}'])
    if (checkout / relative).read_bytes() != expected_source:
        raise SystemExit('Upstream decoder has local changes; refusing to execute it')
    spec = importlib.util.spec_from_file_location('upstream_decoder', checkout / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    fixtures = []
    rng = random.Random(99)
    for count in (3, 4, 8, 16):
        for _ in range(3):
            targets = list(range(count))
            rng.shuffle(targets)
            offset = 0
            indices = []
            for target in targets:
                index = target if target < 3 else target + offset
                indices.append(index)
                offset += 1 if index < 3 else 2
            key = base64.b64encode('A%'.join(map(str, indices)).encode()).decode()
            paragraphs = ''.join(f'<p>Paragraph {i}</p>' for i in range(count))
            html = f'<html><head><meta name="client" content="{key}"></head><body><div id="content">{paragraphs}</div></body></html>'
            fixtures.append({'html': html, 'expected': module.NinetyNineDecoder.decode_content(html, key)})
    destination = Path(__file__).parent / 'fixtures/99csw/upstream-decoder.json'
    destination.write_text(json.dumps(fixtures, indent=2) + '\n', encoding='utf-8')
    print(f'Generated {len(fixtures)} cases with upstream {PIN}')


if __name__ == '__main__':
    main()
