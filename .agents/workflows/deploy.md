---
description: How to deploy changes to the DongTrungHaThao website
---

## Deploy Workflow

// turbo-all

1. Pull latest changes from remote:
```bash
cd /Volumes/Personal/DongTrungHaThao && git pull origin main
```

2. Build the project to verify no errors:
```bash
cd /Volumes/Personal/DongTrungHaThao && npx vite build
```

3. Stage all changes:
```bash
cd /Volumes/Personal/DongTrungHaThao && git add -A
```

4. Commit with emoji prefix and Vietnamese description:
```bash
cd /Volumes/Personal/DongTrungHaThao && git commit -m "emoji Mô tả chi tiết"
```

5. Push to main (auto-deploys via Vercel):
```bash
cd /Volumes/Personal/DongTrungHaThao && git push origin main
```

6. Verify deployment at https://dong-trung-ha-thao.vercel.app/ using browser_subagent
