# Baidu URL Submission

AI Toolbox uses Baidu Search Resource Platform's URL push API to submit updated pages after verification.

## Requirements

- Verified site parameter for Baidu API: `tools.talang.fun`
- Canonical site URL: `https://tools.talang.fun`

Baidu's API may require the `site` parameter to match the exact value shown in the platform. For this property, `tools.talang.fun` works while `https://tools.talang.fun` can return `site init fail`.
- Baidu push token from Search Resource Platform
- Do **not** commit the token to this repository.

## Submit the whole sitemap locally

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py
```

The script reads `sitemap.xml`, validates that every URL belongs to `https://tools.talang.fun`, then posts one URL per line to Baidu with `site=tools.talang.fun` by default.

## Submit selected URLs

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py \
  --url https://tools.talang.fun/ \
  --url https://tools.talang.fun/tools/json-formatter
```

## Submit a limited batch

Baidu accounts often have a small daily quota. Use `--limit` to submit the highest-priority URLs first:

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --limit 10
```

## Submit from a file

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --file urls.txt
```

`urls.txt` should contain one URL per line. Blank lines and lines beginning with `#` are ignored.

## CI / automation note

If this is later automated in GitHub Actions or another CI system, store the token as a secret named `BAIDU_PUSH_TOKEN`. Never place it in frontend JavaScript, Markdown, or committed config files.
