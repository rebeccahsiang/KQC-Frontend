import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

// ============================================================
// Industry Insights — Admin Article Contract
// WEB-1F-D2A
// ============================================================
test('Admin Article route and sidebar share the platform content capability boundary', () => {
  const router = read('src/router/index.ts'); const sidebar = read('src/config/sidebarMenu.ts')
  assert.match(router, /path: 'content\/articles', name: 'AdminArticles'[^\n]*AdminArticlesView\.vue[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(sidebar, /id: 'content-management'[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(sidebar, /id: 'articles'[^\n]*title: '產業文章管理'[^\n]*path: '\/admin\/content\/articles'[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(router, /path: '\/insights', name: 'Insights'[^\n]*InsightsView\.vue/)
})

test('Admin Article API uses authenticated Admin client and exact CRUD paths', () => {
  const api = read('src/api/adminArticles.ts')
  assert.match(api, /import api from '\.\/axios'/)
  assert.match(api, /api\.get<Envelope<ArticleListResponse>>\('\/v1\/admin\/articles'/)
  assert.match(api, /api\.post<Envelope<\{ article: ArticleAdminItem \}>>\('\/v1\/admin\/articles'/)
  assert.match(api, /api\.patch<Envelope<\{ article: ArticleAdminItem \}>>\(`\/v1\/admin\/articles\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /api\.delete<Envelope<\{ deleted: true \}>>\(`\/v1\/admin\/articles\/\$\{encodeURIComponent\(id\)\}`/)
  assert.doesNotMatch(api, /public\/articles|crm|human-consultation|fetch\(/i)
})

test('Article Admin view exposes six canonical labels and bounded management fields', () => {
  const view = read('src/views/admin/content/AdminArticlesView.vue')
  const categoryMapping = view.slice(view.indexOf('const CATEGORY_LABELS'), view.indexOf('const STATUS_LABELS'))
  assert.equal((categoryMapping.match(/^\s{2}[A-Z_]+:/gm) ?? []).length, 6)
  for (const label of ['經營管理', '運輸小知識', '市場趨勢', '事業轉型', '政策法規', 'KQC 快訊']) assert.ok(categoryMapping.includes(label))
  assert.doesNotMatch(categoryMapping, /數位轉型|實務指南|案例洞察|KQC 動態|全部文章/)
  assert.match(categoryMapping, /KQC_NEWS: 'KQC 快訊'/)
  for (const label of ['標題', '文章網址名稱', '分類', '摘要', '文章內容', '文章封面圖片', '標籤（以逗號分隔）', '狀態', '精選文章']) assert.ok(view.includes(label))
  assert.match(view, /id="article-slug" v-model="form\.slug"[^>]*aria-describedby="article-slug-help"/)
  assert.match(view, /id="article-slug-help">用於文章網址，請使用英文小寫、數字或連字號。/)
  for (const action of ['新增文章', '編輯文章', '刪除', '儲存']) assert.ok(view.includes(action))
  assert.match(view, /DRAFT: '草稿', PUBLISHED: '已發布'/)
  assert.match(view, /adminArticlesApi\.(?:create|update|remove)/)
  assert.match(view, /<MultiSelect v-model="form\.categories"[^>]*display="chip"/)
  assert.match(view, /form\.categories\.length < 1 \|\| form\.categories\.length > 6/)
  assert.match(view, /header="撰寫人"/)
  assert.match(view, /v-for="category in data\.categories"/)
  assert.doesNotMatch(view, /v-model="form\.(?:author|createdBy)"/)
  assert.match(view, /aria-label="編輯" title="編輯"[^>]*@click="openEdit\(data\)"/)
  assert.match(view, /Icon icon="lucide:pencil"/)
  assert.match(view, /aria-label="刪除" title="刪除"[^>]*@click="deleteArticle\(data\)"/)
  assert.match(view, /Icon icon="lucide:trash-2"/)
  assert.match(view, /class="article-status"/)
  assert.match(view, /\.article-category-tags \{[^}]*width: max-content;[^}]*flex-wrap: wrap;[^}]*gap: \$kqc-spacing-2xs;/s)
  assert.match(view, /\.article-category-tags :deep\(\.article-category-tag\)[^}]*font-size: \$kqc-type-caption;/s)

  // ============================================================
  // Article Management — Contract Boundary
  // WEB-1F-D2A
  // ============================================================
  const api = read('src/api/adminArticles.ts')
  const articleManagement = `${view}\n${api}`
  assert.doesNotMatch(view, /\bv-html\b/i)
  assert.doesNotMatch(articleManagement, /\b(?:wysiwyg|quill|ckeditor|tinymce)\b/i)
  assert.doesNotMatch(articleManagement, /\b(?:Customer|BusinessCase|Lead)\b|human(?:-|_)?consultation/i)
})

test('Article category types align exactly with the final six-value Backend taxonomy', () => {
  const api = read('src/api/adminArticles.ts')
  const categoryType = api.match(/export type ArticleCategory = ([^\n]+)/)?.[1] ?? ''
  for (const value of ['BUSINESS_MANAGEMENT', 'TRANSPORT_KNOWLEDGE', 'MARKET_TREND', 'BUSINESS_TRANSFORMATION', 'POLICY_REGULATION', 'KQC_NEWS']) assert.ok(categoryType.includes(`'${value}'`))
  assert.equal((categoryType.match(/'[A-Z_]+'/g) ?? []).length, 6)
  assert.doesNotMatch(categoryType, /DIGITAL_TRANSFORMATION|PRACTICAL_GUIDE|CASE_INSIGHT|ALL_ARTICLES|'ALL'/)
})

test('Admin Article modal owns responsive vertical scrolling without horizontal overflow', () => {
  const view = read('src/views/admin/content/AdminArticlesView.vue')
  const styles = view.slice(view.indexOf('<style scoped lang="scss">'))
  assert.match(view, /<Dialog[^>]*class="article-dialog"/)
  assert.match(styles, /\.article-dialog\)[^{]*\{[^}]*width:\s*min\(94vw, 60rem\);[^}]*max-height:\s*90dvh;[^}]*overflow:\s*hidden;/s)
  assert.match(styles, /\.p-dialog-content\)[^{]*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s)
  assert.match(styles, /\.article-form\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;[^}]*overflow-x:\s*hidden;/s)
  assert.match(styles, /\.article-form footer\s*\{[^}]*position:\s*sticky;[^}]*bottom:\s*0;/s)
  assert.match(styles, /@media \(max-width:\s*768px\)[\s\S]*\.article-dialog\)[^{]*\{[^}]*width:\s*95vw;[^}]*max-height:\s*92dvh;/)
})

test('D2A preserves deferred public and Quick Service boundaries with maintenance comments', () => {
  const view = read('src/views/admin/content/AdminArticlesView.vue')
  const dock = read('src/components/home/HomeServiceDock.vue')
  const insights = read('src/views/InsightsView.vue')
  const combined = `${view}\n${read('src/api/adminArticles.ts')}\n${read('src/router/index.ts')}\n${read('src/config/sidebarMenu.ts')}`
  assert.match(combined, /Industry Insights[\s\S]*WEB-1F-D2A/)
  assert.doesNotMatch(dock, /KQC_NEWS|\/api\/public\/articles|category.*KQC_NEWS/)
  assert.doesNotMatch(insights, /adminArticlesApi|public\/articles/)
})
