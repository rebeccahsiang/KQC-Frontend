/// <reference types="vite/client" />

// 告訴 TypeScript：所有以 .css 結尾的檔案，一律視為合法的樣式模組，不需報錯
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}