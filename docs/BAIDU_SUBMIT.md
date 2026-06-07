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

Baidu accounts often have a small daily quota. Use `--limit` to submit the highest-priority URLs first. By default, `--mode zh-first` prioritizes the homepage, Chinese tool pages, and Chinese blog posts before English pages:

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --limit 10
```

Submit in sitemap order instead:

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --limit 10 --mode all
```

## Rotate daily batches

Use `--rotate` with `--limit` to submit a different batch each day:

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --limit 10 --rotate
```

Use `--offset` for a manual batch:

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --limit 10 --offset 20
```

## Submit from a file

```bash
BAIDU_PUSH_TOKEN=your_token_here python3 scripts/baidu_submit.py --file urls.txt
```

`urls.txt` should contain one URL per line. Blank lines and lines beginning with `#` are ignored.

## GitHub Actions automation

This repository includes `.github/workflows/baidu-submit.yml`.

### 1. Add the token as a GitHub Secret

Go to:

```text
GitHub repository → Settings → Secrets and variables → Actions → New repository secret
```

Create:

```text
Name: BAIDU_PUSH_TOKEN
Value: your Baidu push token
```

Do not include the `token=` prefix; paste only the token value.

### 2. Run manually

Go to:

```text
Actions → Baidu URL Submit → Run workflow
```

Recommended inputs:

```text
limit: 10
mode: zh-first
```

### 3. Scheduled run

The workflow also runs daily at 09:15 China time (`01:15 UTC`) and submits up to 10 prioritized URLs. The scheduled run uses `--rotate`, so it submits a different daily batch instead of retrying the same first 10 URLs forever.

## Security note

Never place the token in frontend JavaScript, Markdown pages, committed config files, or public logs. Use `BAIDU_PUSH_TOKEN` as an environment variable or GitHub Actions secret only.
