import json
from pathlib import Path
import subprocess
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCES = sorted(ROOT.glob('*.json'))


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON key: ' + key)
        result[key] = value
    return result


class Sources(unittest.TestCase):
    def test_standalone_json_and_structure(self):
        self.assertEqual({p.name for p in SOURCES}, {
            'manhuagui.json', 'dm5.json', 'kisslove.json', '99csw.json', 'wenku8.json'})
        urls = set()
        for path in SOURCES:
            with self.subTest(source=path.name):
                source = json.loads(path.read_text('utf-8'), object_pairs_hook=unique_object)
                self.assertIsInstance(source, dict)
                for key in ('bookSourceName', 'bookSourceUrl', 'searchUrl'):
                    self.assertIsInstance(source[key], str)
                    self.assertTrue(source[key])
                url = urlsplit(source['bookSourceUrl'])
                self.assertIn(url.scheme, ('https', 'http'))
                self.assertTrue(url.hostname)
                self.assertNotIn(source['bookSourceUrl'], urls)
                urls.add(source['bookSourceUrl'])
                self.assertIn(source['bookSourceType'], (0, 1, 2))
                self.assertIsInstance(source['lastUpdateTime'], int)
                for key in ('ruleBookInfo', 'ruleContent', 'ruleExplore', 'ruleSearch', 'ruleToc'):
                    self.assertIsInstance(source[key], dict)
                for group, key in (('ruleSearch', 'bookList'), ('ruleToc', 'chapterList'), ('ruleContent', 'content')):
                    self.assertTrue(source[group][key])
                header = source.get('header', '')
                if header and not header.lstrip().startswith('<js>'):
                    self.assertIsInstance(json.loads(header, object_pairs_hook=unique_object), dict)

    def test_manhuagui_fixed_metadata(self):
        source = json.loads((ROOT / 'manhuagui.json').read_text('utf-8'))
        self.assertEqual([source[k] for k in ('bookSourceName', 'bookSourceComment', 'bookSourceGroup')],
                         ['漫画柜', '', '漫画'])

    def test_javascript_syntax(self):
        subprocess.run(['node', 'tests/check_js.cjs', *[p.name for p in SOURCES]], cwd=ROOT, check=True)

    def test_offline_regressions(self):
        subprocess.run(['node', 'tests/regressions.cjs'], cwd=ROOT, check=True)


if __name__ == '__main__':
    unittest.main()
