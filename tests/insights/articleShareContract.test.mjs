import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const view = read('src/views/InsightsDetailView.vue')
const share = read('src/components/insights/ArticleShare.vue')

// D2E-A — Article Share Contract
test('Article Detail owns one shared footer action after either content path', () => {
  const boundary = view.slice(view.indexOf('D2D-B2 — Legacy Article Fallback'), view.indexOf('article-detail__return'))
  assert.match(boundary, /StructuredArticleContent v-if="article\.structuredContent"/)
  assert.match(boundary, /<div v-else class="article-detail__body">\{\{ article\.content \}\}<\/div>/)
  assert.match(boundary, /<ArticleShare :title="article\.title" :summary="article\.summary" \/>/)
  assert.ok(boundary.indexOf('<ArticleShare') > boundary.indexOf('<div v-else'))
})

test('native share uses Article metadata and the current browser URL with a concurrency guard', () => {
  assert.match(share, /const url = window\.location\.href/)
  assert.match(share, /navigator\.share\(\{ title: props\.title, text: props\.summary, url \}\)/)
  assert.match(share, /if \(sharing\.value\) return/)
  assert.match(share, /:disabled="sharing"/)
  assert.match(share, /finally \{[\s\S]*sharing\.value = false/)
  assert.doesNotMatch(share, /localhost|\/insights\/\$\{|https?:\/\/[^'"`\s]+\/insights/)
})

test('missing native share and non-cancel failures use the Clipboard fallback', () => {
  assert.match(share, /if \(!navigator\.share\) \{ await copyArticleUrl\(url\); return \}/)
  assert.match(share, /navigator\.clipboard\?\.writeText/)
  assert.match(share, /await navigator\.clipboard\.writeText\(url\)/)
  assert.match(share, /文章連結已複製/)
  assert.match(share, /無法複製連結，請從瀏覽器網址列複製。/)
})

test('AbortError is a quiet cancellation and does not invoke the Clipboard fallback', () => {
  const nativeCatch = share.slice(share.indexOf('await navigator.share'), share.indexOf('} finally'))
  assert.match(nativeCatch, /name === 'AbortError'\) return/)
  assert.ok(nativeCatch.indexOf("name === 'AbortError') return") < nativeCatch.indexOf('await copyArticleUrl(url)'))
})

test('share control and lightweight feedback are accessible and responsive', () => {
  assert.match(share, /<button type="button" :disabled="sharing" aria-label="分享這篇文章" @click="shareArticle">/)
  assert.match(share, /sharing \? '分享中…' : '分享這篇文章'/)
  assert.match(share, /icon="lucide:share-2" aria-hidden="true"/)
  assert.match(share, /role="status" aria-live="polite"/)
  assert.match(share, /@media \(max-width: \$breakpoint-sm\)/)
  assert.match(share, /\.article-share button \{ width: 100%; \}/)
})

test('Article Share remains frontend-only and adds no deferred engagement surfaces', () => {
  assert.doesNotMatch(share, /v-html|innerHTML|document\.write|fetch\(|axios|api\.|router|useRoute|localStorage|sessionStorage/i)
  assert.doesNotMatch(`${view}\n${share}`, /facebook|threads|linkedin|email subscription|訂閱|按讚|like button/i)
})
