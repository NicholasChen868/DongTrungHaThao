---
description: How to add new images to the website, with rules for real vs sample images
---

## Add Image Workflow

### Step 1: Determine image type
- **Real image** (uploaded by user/owner): Use directly, NO label needed
- **AI-generated / sample image**: MUST add "Ảnh mẫu" badge

### Step 2: Place image in correct location
All images go to `/public/images/`. Use `.png` or `.webp` format.

### Step 3: Add to HTML
For real images:
```html
<img src="/images/your-image.png" alt="Mô tả chi tiết" class="gallery-img" loading="lazy" />
```

For sample/AI images:
```html
<div class="gallery-item">
  <img src="/images/your-image.png" alt="Mô tả chi tiết" class="gallery-img" loading="lazy" />
  <span class="sample-badge">Ảnh mẫu</span>
  <div class="gallery-caption">
    <h4>Tiêu đề</h4>
    <p>Mô tả</p>
  </div>
</div>
```

### Step 4: NEVER replace real product images
The file `product-cordyceps.png` is the REAL product image. Never replace it with AI-generated content.

### Step 5: Deploy
Follow the /deploy workflow to push changes.
