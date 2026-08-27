import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

// ============================================================
// Article Cover Image — Admin UI Contract
// WEB-1F-D2A-1
// ============================================================
test('cover upload uses the authenticated Article Admin client and canonical multipart field', () => {
  const api = read('src/api/adminArticles.ts')
  const vite = read('vite.config.ts')
  const upload = api.slice(api.indexOf('uploadCoverImage:'), api.length)
  assert.match(api, /import api from '\.\/axios'/)
  assert.match(upload, /const body = new FormData\(\)/)
  assert.match(upload, /body\.append\('image', file\)/)
  assert.match(upload, /api\.post<Envelope<\{ path: string \}>>\('\/v1\/admin\/articles\/cover-images', body, \{/)
  assert.match(upload, /headers: \{ 'Content-Type': undefined \}/)
  assert.doesNotMatch(upload, /JSON\.stringify|readAsDataURL|arrayBuffer\(|new Blob|boundary=|Authorization|localStorage|sessionStorage|publicHumanConsultations|public\/articles/)
  assert.match(vite, /'\/uploads':\s*\{[^}]*target:\s*'http:\/\/localhost:3000'/s)
})

test('Article editor provides bounded select, upload, preview, replace, and remove behavior', () => {
  const view = read('src/views/admin/content/AdminArticlesView.vue')
  assert.match(view, /<label class="article-cover-select" for="article-cover-file">/)
  assert.match(view, /id="article-cover-file"[^>]*type="file" accept="image\/jpeg,image\/png,image\/webp"/)
  assert.match(view, /aria-describedby="article-cover-filename"/)
  assert.match(view, /@change="selectCoverImage"/)
  assert.match(view, /selectedCoverFile \? '重新選擇' : '選擇圖片'/)
  assert.match(view, /selectedCoverFile \? `已選擇：\$\{selectedCoverFile\.name\}` : '尚未選擇檔案'/)
  assert.match(view, /label="上傳圖片"[^>]*:loading="uploadingCover"[^>]*:disabled="uploadingCover \|\| !selectedCoverFile"/)
  assert.match(view, /if \(uploadingCover\.value\) return/)
  assert.match(view, /await adminArticlesApi\.uploadCoverImage\(selectedCoverFile\.value\)/)
  assert.match(view, /form\.coverImage = response\.data\.path/)
  assert.match(view, /v-if="form\.coverImage" class="article-cover-preview"/)
  assert.match(view, /:src="coverPreviewUrl" alt="文章封面預覽" @error="coverPreviewFailed = true"/)
  assert.match(view, /封面圖片暫時無法預覽。/)
  assert.match(view, /label="移除封面"[^>]*@click="removeCoverImage"/)
  assert.match(view, /const removeCoverImage = \(\) => \{ form\.coverImage = ''; resetCoverUpload\(\) \}/)
  assert.match(view, /saving\.value \|\| uploadingCover\.value/)
  assert.match(view, /class="article-cover-upload__button"/)
  assert.match(view, /article-cover-upload__button:not\(:disabled\):hover/)
  assert.match(view, /article-cover-upload__button:not\(:disabled\):focus-visible/)
  assert.match(view, /article-cover-upload__button:disabled[^}]*cursor: not-allowed/s)
  assert.match(view, /\.article-cover-select:hover/)
  assert.match(view, /\.article-cover-select:focus-within/)
  assert.match(view, /\.article-cover-select__input[^}]*clip-path: inset\(50%\)/s)
  assert.match(view, /\.article-cover-filename[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/s)
})

test('client validation and feedback preserve the five-megabyte JPEG PNG WebP boundary', () => {
  const api = read('src/api/adminArticles.ts'); const view = read('src/views/admin/content/AdminArticlesView.vue')
  assert.match(api, /ARTICLE_COVER_IMAGE_MAX_BYTES = 5 \* 1024 \* 1024/)
  assert.match(view, /\['image\/jpeg', 'image\/png', 'image\/webp'\]\.includes\(file\.type\)/)
  assert.match(view, /file\.size > ARTICLE_COVER_IMAGE_MAX_BYTES/)
  assert.match(view, /僅支援 JPG、PNG 或 WebP 圖片。/)
  assert.match(view, /圖片大小不可超過 5 MB。/)
  assert.match(view, /v-if="uploadError"[^>]*severity="error"/)
  assert.match(view, /ARTICLE_COVER_IMAGE_INVALID'\) return '圖片上傳失敗，請重新選擇圖片後再試一次。'/)
  assert.match(view, /status === 401[^\n]*登入狀態已失效/)
  assert.match(view, /status === 403[^\n]*目前帳號沒有上傳文章圖片的權限/)
  assert.match(view, /ARTICLE_COVER_IMAGE_TOO_LARGE[^\n]*圖片檔案不得超過 5 MB/)
  assert.match(view, /ARTICLE_COVER_IMAGE_TYPE_UNSUPPORTED[^\n]*僅支援 JPG、PNG、WebP 圖片格式/)
  assert.doesNotMatch(view.slice(view.indexOf('const coverUploadMessage'), view.indexOf('const loadArticles')), /error\?\.message|response\?\.data.*message/)
})

test('cover reference remains part of existing CRUD and is never persisted as base64 or filesystem path', () => {
  const api = read('src/api/adminArticles.ts'); const view = read('src/views/admin/content/AdminArticlesView.vue')
  assert.match(view, /coverImage: form\.coverImage\.trim\(\) \|\| null/)
  assert.match(view, /adminArticlesApi\.update\(editingId\.value, payload\(\)\)/)
  assert.match(view, /adminArticlesApi\.create\(payload\(\)\)/)
  assert.doesNotMatch(`${api}\n${view}`, /readAsDataURL|data:image|base64|[A-Za-z]:\\\\uploads|\/home\/[^'"\s]+\/uploads/)
  assert.doesNotMatch(`${api}\n${view}`, /\b(?:Customer|BusinessCase|Lead)\b|human(?:-|_)?consultation|\/v1\/crm\//i)
})

test('taxonomy, URL-name, and responsive modal contracts remain unchanged', () => {
  const api = read('src/api/adminArticles.ts'); const view = read('src/views/admin/content/AdminArticlesView.vue')
  const mapping = view.slice(view.indexOf('const CATEGORY_LABELS'), view.indexOf('const STATUS_LABELS'))
  assert.equal((mapping.match(/^\s{2}[A-Z_]+:/gm) ?? []).length, 6)
  assert.match(mapping, /KQC_NEWS: 'KQC 快訊'/)
  assert.match(api, /type ArticleCategory = 'BUSINESS_MANAGEMENT' \| 'TRANSPORT_KNOWLEDGE' \| 'MARKET_TREND' \| 'BUSINESS_TRANSFORMATION' \| 'POLICY_REGULATION' \| 'KQC_NEWS'/)
  assert.match(view, /<label for="article-slug">文章網址名稱<\/label>/)
  assert.match(view, /\.article-dialog\)[^{]*\{[^}]*max-height:\s*90dvh;[^}]*overflow:\s*hidden;/s)
  assert.match(view, /\.p-dialog-content\)[^{]*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s)
})
