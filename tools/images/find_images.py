"""Searches Shopify shop sites for each product and prints candidate image URLs (read-only)."""
import json, sys, urllib.parse, urllib.request, concurrent.futures as cf

SITES = ['topperskit.com', 'www.starquik.com', 'scooboo.in']
QUERIES = dict(line.split('=', 1) for line in sys.stdin.read().strip().splitlines())


def search(site, q):
    url = f'https://{site}/search/suggest.json?q={urllib.parse.quote(q)}&resources%5Btype%5D=product&resources%5Blimit%5D=4'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = json.load(urllib.request.urlopen(req, timeout=20))
        return [(site, p['title'], p.get('image') or '') for p in data['resources']['results']['products']]
    except Exception as e:
        return [(site, f'ERR {type(e).__name__}', '')]


with cf.ThreadPoolExecutor(12) as pool:
    jobs = {(pid, s): pool.submit(search, s, q) for pid, q in QUERIES.items() for s in SITES}
    for pid, q in QUERIES.items():
        print(f'\n## {pid}  ({q})')
        for s in SITES:
            for site, title, img in jobs[(pid, s)].result():
                if img or title.startswith('ERR'):
                    print(f'  [{site}] {title} | {img}')
