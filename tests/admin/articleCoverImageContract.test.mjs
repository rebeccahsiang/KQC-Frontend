import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = read('src/api/adminArticleImages.ts')
const view = read('src/views/admin/content/AdminArticlesView.vue')
const library = read('src/views/admin/content/AdminArticleImagesView.vue')

// D2F-B — Article Image Library / Cover Image Authority contract migration.
test('library API uses exact endpoints and bounded multipart authority', () => {
  assert.match(api, /api\.get<Envelope<\{ images: ArticleImageItem\[\] \}>>\('\/v1\/admin\/article-images'\)/)
  for (const field of ['image', 'name', 'altText']) assert.match(api, new RegExp(`body\\.append\\('${field}',`))
  assert.match(api, /api\.delete[^\n]+\/v1\/admin\/article-images\/\$\{encodeURIComponent\(id\)\}/)
  assert.doesNotMatch(api, /body\.append\(['"](?:path|filename|usageCount|createdBy)/)
})

test('library provides loading empty upload usage and safe delete states', () => {
  assert.match(library, /正在載入文章圖片/); assert.match(library, /目前尚無文章圖片/)
  for (const value of ['image.name', 'image.altText', 'image.createdAt', 'image.usageCount']) assert.ok(library.includes(value))
  assert.match(library, /count === 0 \? '尚未使用' : `已使用於 \$\{count\} 篇文章`/)
  assert.match(library, /image\.usageCount === 0[^>]*label="刪除"/)
  assert.match(library, /window\.confirm/); assert.match(library, /ARTICLE_IMAGE_IN_USE/)
  assert.match(library, /image\/jpeg[^\n]+image\/png[^\n]+image\/webp/); assert.match(library, /ARTICLE_IMAGE_MAX_BYTES/)
  const failure = library.slice(library.indexOf('const uploadImage'), library.indexOf('const usageLabel'))
  assert.doesNotMatch(failure, /catch[\s\S]*(?:form\.name\s*=|form\.altText\s*=|resetUpload\(\))/)
})

test('Article editor selects one library identity and preserves legacy cover', () => {
  assert.match(view, /adminArticleImagesApi\.list\(\)/)
  assert.match(view, /form\.coverImageId = image\.id/)
  assert.match(view, /coverImage: form\.coverImage\.trim\(\) \|\| null, coverImageId: form\.coverImageId/)
  assert.match(view, /v-if="form\.coverImage \|\| form\.coverImageId"/)
  assert.match(view, /目前文章既有封面/)
  assert.match(view, /button v-for="image in coverImages"[^>]+type="button"[^>]+:aria-pressed=/)
  assert.doesNotMatch(view, /type="file"|uploadCoverImage\(|selectedCoverFile/)
})

test('new slug is omitted and existing persisted URL is read-only', () => {
  assert.match(view, /\.\.\.\(editingId\.value && form\.slug \? \{ slug: form\.slug \} : \{\}\)/)
  assert.match(view, /儲存後由系統自動產生/)
  assert.match(view, /`\/insights\/\$\{form\.slug\}`/)
  assert.doesNotMatch(view, /v-model="form\.slug"|generateSlug|randomUUID|Math\.random/)
})
