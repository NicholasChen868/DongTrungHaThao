# 🔄 Sprint B Resume — Tiếp tục sau khi bị ngắt

## Tình trạng hiện tại (2026-02-23 10:46)

MacBook hết pin nên session trước bị ngắt. Nhưng **tất cả code đã được commit + push**.

### ✅ Đã hoàn thành (KHÔNG cần làm lại)

| Task | Status | Commit |
|------|--------|--------|
| B1 | ✅ DONE | `8610458` — vitest.config.js, setup.js, mocks, npm scripts |
| B2 | ✅ DONE | `c4b8b80` — 7 unit test files, 130 tests |
| B3 | ✅ DONE | `a572d93` — 2 integration test files, 30 tests |
| B5 | ✅ DONE | `68d14c7` — .github/workflows/test.yml |

### 📊 Test results hiện tại
```
9 test files | 160 tests | ALL PASSED ✅
Duration: 2.49s
```

### Test structure đã có:
```
tests/
├── setup.js
├── mocks/
│   └── supabase.js
├── unit/
│   ├── sanitize.test.js      — 15 tests
│   ├── ratelimit.test.js      — 9 tests
│   ├── order-validation.test.js — 12 tests
│   ├── auth.test.js           — 27 tests
│   ├── ngu-hanh.test.js       — 28 tests
│   ├── ctv.test.js            — 22 tests
│   └── tracker.test.js        — 14 tests
└── integration/
    ├── order-flow.test.js     — 14 tests
    └── ctv-flow.test.js       — 16 tests
```

---

## 📋 Việc còn lại

Sprint B gần xong. Còn lại một số việc nhỏ:

### 1. Review & tăng chất lượng tests (tùy chọn)
- Chạy `npx vitest run` để xác nhận tất cả 160 tests vẫn pass
- Chạy `npm run test:coverage` (cần `@vitest/coverage-v8`) để xem coverage %
- Nếu coverage < 70%, thêm tests cho các functions chưa cover

### 2. Bắt đầu Sprint C: Hardening

Xem `TASKS.md` phần Sprint C. Bắt đầu với:

#### C1. Admin auth nâng cao
- Migrate admin login từ SHA-256 client-side → Supabase Auth (hoặc server-side RPC)
- Session token thay vì chỉ check hash
- Không lộ password hash trong source code

#### C2. Error handling chung
- `src/utils/api.js` — wrapper cho Supabase calls
- Retry logic (3 attempts, exponential backoff)
- Fallback UI khi Supabase/network down
- Global error handler + toast notification

### Quy tắc
- Chạy `npm test` sau mỗi thay đổi
- Chạy `npx vite build` để verify build
- Commit thường xuyên với format: `🔒 [Security] Sprint C — C1 ...` hoặc `🛡️ [Hardening] Sprint C — C2 ...`
