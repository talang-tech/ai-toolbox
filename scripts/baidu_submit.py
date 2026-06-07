#!/usr/bin/env python3
"""Submit AI Toolbox URLs to Baidu Search Resource Platform.

Security:
- Do not hard-code the Baidu token in this repository.
- Set BAIDU_PUSH_TOKEN in your local shell or CI secret.

Usage:
  BAIDU_PUSH_TOKEN=xxx python3 scripts/baidu_submit.py
  BAIDU_PUSH_TOKEN=xxx python3 scripts/baidu_submit.py --url https://tools.talang.fun/tools/json-formatter
  BAIDU_PUSH_TOKEN=xxx python3 scripts/baidu_submit.py --file urls.txt
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SITE = "tools.talang.fun"
SITEMAP = ROOT / "sitemap.xml"


def load_sitemap_urls(path: Path = SITEMAP) -> list[str]:
    if not path.exists():
        raise FileNotFoundError(f"sitemap not found: {path}")
    root = ET.fromstring(path.read_text(encoding="utf-8"))
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [el.text.strip() for el in root.findall("sm:url/sm:loc", ns) if el.text and el.text.strip()]
    return urls


def load_file_urls(path: Path) -> list[str]:
    urls: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        urls.append(line)
    return urls


def chunked(items: list[str], size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def prioritize_urls(urls: list[str], mode: str) -> list[str]:
    """Order URLs for small daily quotas.

    zh-first favors Chinese canonical pages and blog posts before English pages,
    because Baidu usually has more value for the Chinese site first.
    """
    if mode == "all":
        return urls
    if mode != "zh-first":
        raise ValueError(f"unsupported mode: {mode}")

    def score(url: str) -> tuple[int, int, str]:
        path = urllib.parse.urlparse(url).path or "/"
        is_en = path.startswith("/en/") or path == "/en"
        if path == "/":
            group = 0
        elif is_en:
            group = 5
        elif path.startswith("/tools/"):
            group = 1
        elif path.startswith("/blog/"):
            group = 2
        elif path in {"/about", "/sponsor"}:
            group = 3
        else:
            group = 4
        return (group, len(path), path)

    return sorted(urls, key=score)


def submit_urls(site: str, token: str, urls: list[str], batch_size: int = 2000) -> int:
    endpoint = "http://data.zz.baidu.com/urls?" + urllib.parse.urlencode({"site": site, "token": token})
    total_success = 0
    for batch in chunked(urls, batch_size):
        body = "\n".join(batch).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=body,
            headers={"Content-Type": "text/plain", "User-Agent": "ai-toolbox-baidu-submit/1.0"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                text = resp.read().decode("utf-8", "replace")
                print(text)
        except urllib.error.HTTPError as exc:
            err = exc.read().decode("utf-8", "replace")
            print(f"Baidu submit failed: HTTP {exc.code}: {err}", file=sys.stderr)
            return 1
        except urllib.error.URLError as exc:
            print(f"Baidu submit failed: {exc}", file=sys.stderr)
            return 1
        total_success += len(batch)
    print(f"Submitted {total_success} URL(s) to Baidu endpoint.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Submit URLs to Baidu URL push API.")
    parser.add_argument("--site", default=os.environ.get("BAIDU_PUSH_SITE", DEFAULT_SITE), help="Verified Baidu site URL")
    parser.add_argument("--token", default=os.environ.get("BAIDU_PUSH_TOKEN"), help="Baidu push token; prefer BAIDU_PUSH_TOKEN env")
    parser.add_argument("--url", action="append", default=[], help="Single URL to submit; can be repeated")
    parser.add_argument("--file", type=Path, help="Text file with one URL per line")
    parser.add_argument("--sitemap", type=Path, default=SITEMAP, help="Sitemap path used when --url/--file are omitted")
    parser.add_argument("--limit", type=int, help="Submit only N URLs after de-duplication and prioritization")
    parser.add_argument("--offset", type=int, help="Skip the first N prioritized URLs before applying --limit")
    parser.add_argument("--rotate", action="store_true", help="With --limit, rotate the submitted batch by UTC day-of-year")
    parser.add_argument("--mode", choices=["zh-first", "all"], default="zh-first", help="URL ordering mode for quota-limited submissions")
    args = parser.parse_args()

    if not args.token:
        print("Missing Baidu token. Set BAIDU_PUSH_TOKEN or pass --token.", file=sys.stderr)
        return 2

    urls: list[str] = []
    urls.extend(args.url)
    if args.file:
        urls.extend(load_file_urls(args.file))
    if not urls:
        urls = load_sitemap_urls(args.sitemap)

    urls = list(dict.fromkeys(u.strip() for u in urls if u and u.strip()))
    try:
        urls = prioritize_urls(urls, args.mode)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if args.rotate and args.limit is None:
        print("--rotate requires --limit", file=sys.stderr)
        return 2
    if args.offset is not None and args.offset < 0:
        print("--offset must be >= 0", file=sys.stderr)
        return 2
    if args.limit is not None:
        if args.limit < 1:
            print("--limit must be >= 1", file=sys.stderr)
            return 2
        offset = args.offset or 0
        if args.rotate and urls:
            day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
            batches = max(1, (len(urls) + args.limit - 1) // args.limit)
            offset = ((day_of_year - 1) % batches) * args.limit
            print(f"Rotating submission: day_of_year={day_of_year}, batches={batches}, offset={offset}")
        urls = urls[offset : offset + args.limit]
    if not urls:
        print("No URLs to submit.", file=sys.stderr)
        return 2

    site_for_validation = args.site.rstrip("/")
    if not site_for_validation.startswith(("http://", "https://")):
        allowed_prefixes = [f"https://{site_for_validation}/", f"http://{site_for_validation}/"]
        allowed_exact = {f"https://{site_for_validation}", f"http://{site_for_validation}"}
    else:
        allowed_prefixes = [site_for_validation + "/"]
        allowed_exact = {site_for_validation}

    invalid = [u for u in urls if not any(u.startswith(prefix) for prefix in allowed_prefixes) and u not in allowed_exact]
    if invalid:
        print("Refusing to submit URLs outside the verified site:", file=sys.stderr)
        for u in invalid[:10]:
            print(f"  {u}", file=sys.stderr)
        return 2

    print(f"Submitting {len(urls)} URL(s) for site {args.site} to Baidu...")
    return submit_urls(args.site, args.token, urls)


if __name__ == "__main__":
    raise SystemExit(main())
