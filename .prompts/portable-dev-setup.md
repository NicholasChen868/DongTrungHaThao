# 🔧 Portable Dev Environment — Setup Máy Mới

> **Mục tiêu**: Cầm máy bất kỳ → chạy vài lệnh → làm việc ngay, không đứt gãy.
> **Thời gian setup**: ~15 phút

---

## BƯỚC 1: Cài Tools Cơ Bản

```bash
# 1a. Homebrew (nếu Mac chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 1b. Node.js 20 LTS
brew install node@20

# 1c. Git (thường Mac đã có sẵn)
brew install git
```

---

## BƯỚC 2: Tạo GitHub Personal Access Token (PAT)

### Anh làm (1 lần trên github.com):

1. Vào **https://github.com/settings/tokens?type=beta**
2. Chọn **"Generate new token (Fine-grained)"**
3. Cấu hình:
   - **Token name**: `MalDalla-Dev`
   - **Expiration**: 90 days (hoặc No expiration)
   - **Repository access**: chọn `NicholasChen868/DongTrungHaThao`
   - **Permissions**:
     - Contents: Read and write
     - Pull requests: Read and write
     - Issues: Read and write
     - Metadata: Read-only
4. Nhấn **Generate token** → **Copy ngay** (chỉ hiện 1 lần!)
5. Lưu an toàn: ví dụ trong Notes app hoặc 1Password

### Token format:
```
github_pat_xxxxxxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## BƯỚC 3: Clone Repo + Config Git

```bash
# Clone repo (dùng PAT thay password)
git clone https://NicholasChen868:<GITHUB_PAT>@github.com/NicholasChen868/DongTrungHaThao.git

# Hoặc nếu đã clone rồi, chỉ cần config credential:
cd DongTrungHaThao
git remote set-url origin https://NicholasChen868:<GITHUB_PAT>@github.com/NicholasChen868/DongTrungHaThao.git

# Config user info
git config user.name "NicholasChen868"
git config user.email "your-email@example.com"
```

### Lưu credential vĩnh viễn (khỏi nhập lại):
```bash
git config --global credential.helper store
```

---

## BƯỚC 4: Cài Dependencies + Chạy Dev Server

```bash
cd DongTrungHaThao
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## BƯỚC 5: Setup Supabase CLI (Optional — cho migration)

```bash
npm install -g supabase

# Login Supabase CLI
supabase login
# → Nó mở trình duyệt để đăng nhập tài khoản Supabase
# → Chọn đúng org/project
```

### Supabase Project Info (lưu sẵn):
```
Project ID:   lfwihaamswskmospcqfo
Project URL:  https://lfwihaamswskmospcqfo.supabase.co
Anon Key:     (đã hardcode trong src/supabase.js — public, OK)
Region:       Southeast Asia (Singapore)
```

---

## BƯỚC 6: Setup Vercel CLI (Optional — cho deploy)

```bash
npm install -g vercel

# Login
vercel login
# → Nhập email → check email xác nhận → done

# Link project
cd DongTrungHaThao
vercel link
# → Chọn project "DongTrungHaThao" trong list
```

---

## BƯỚC 7: Setup Claude Code (nếu dùng)

```bash
# Cài Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Login
claude login
# → Sẽ mở trình duyệt đăng nhập Anthropic account
```

---

## BƯỚC 8: Setup Antigravity (VS Code Extension)

1. Mở VS Code → Extensions → tìm **"Antigravity"**
2. Cài đặt → Đăng nhập tài khoản Google (Deepmind)
3. Mở folder DongTrungHaThao → Extension auto-detect

---

## DANH SÁCH TOKENS/SECRETS CẦN LƯU

> ⚠️ **Lưu trong Notes app hoặc 1Password — KHÔNG lưu trong repo!**

| # | Tên | Dùng cho | Nơi tạo | Hết hạn |
|---|-----|----------|---------|---------|
| 1 | **GitHub PAT** | Push/pull code | github.com/settings/tokens | 90 ngày / vĩnh viễn |
| 2 | **Supabase Anon Key** | Frontend API calls | Supabase Dashboard → Settings → API | Không hết hạn |
| 3 | **Supabase Service Role Key** | Admin/backend | Supabase Dashboard → Settings → API | Không hết hạn |
| 4 | **Vercel Token** | Deploy | vercel.com/account/tokens | Tùy chọn |
| 5 | **Zalo App ID** | ZNS (tương lai) | developers.zalo.me | Không hết hạn |
| 6 | **Zalo Secret Key** | ZNS (tương lai) | developers.zalo.me | Không hết hạn |
| 7 | **Zalo Refresh Token** | ZNS (tương lai) | Zalo OAuth | 90 ngày (auto-renew) |
| 8 | **Anthropic API Key** | Claude Code | console.anthropic.com | Tùy chọn |

### Cách kiểm tra nhanh trên máy mới:
```bash
# Check git
git remote -v
# Phải thấy: origin https://...@github.com/NicholasChen868/DongTrungHaThao.git

# Check node
node -v  # >= 20.x

# Check build
npm run build  # phải pass không lỗi

# Check test
npm test  # 223 tests passing
```

---

## SCRIPT 1-CLICK SETUP (chạy trên máy mới)

Tạo file `setup.sh` để tự động hóa (nhưng **không commit vào repo**):

```bash
#!/bin/bash
# === MalDalla Quick Setup ===
# Dùng: ./setup.sh <GITHUB_PAT>

PAT=$1
if [ -z "$PAT" ]; then
    echo "❌ Usage: ./setup.sh <GITHUB_PAT>"
    exit 1
fi

echo "📦 Cloning repo..."
git clone "https://NicholasChen868:${PAT}@github.com/NicholasChen868/DongTrungHaThao.git"
cd DongTrungHaThao

echo "🔧 Installing dependencies..."
npm install

echo "🏗️ Building..."
npm run build

echo "✅ Setup complete! Run: cd DongTrungHaThao && npm run dev"
```

---

## LƯU Ý

1. **Supabase Anon Key** đã hardcode trong `src/supabase.js` — đây là **public key**, OK để commit
2. **Service Role Key** KHÔNG BAO GIỜ commit — chỉ dùng trong Supabase Dashboard hoặc Edge Functions
3. **GitHub PAT** nên set expiration 90 ngày → tạo mới khi hết hạn
4. `.env` file hiện tại **không có** trong project — mọi config đều trong source code (Vite build)
5. Nếu cần `.env` cho Zalo ZNS (tương lai), sẽ dùng Supabase Vault hoặc Vercel env vars

---

*Tạo: 23/02/2026 — Antigravity*
