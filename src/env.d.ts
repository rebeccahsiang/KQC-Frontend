/// <reference types="vite/client" />

// 讓 TypeScript 能夠正確識別並解析所有 .vue 單檔案組件 (SFC)
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-scope-line @typescript-eslint/no-explicit-generic-type-arguments-and-explicit-return-type
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 保持 CSS Modules 型別宣告支援
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}