import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 构建期扫 public/audio/，把真实存在的 BGM 文件列进包里。规格 5.5。
 *
 * 不放在运行时探测：文件不在时那两个 HEAD 会在每位访客的控制台里各留一条 404，
 * 而规格 5.5 要的是「不报错、不留死按钮」。构建期扫一次两样都满足，还省两个请求。
 * 代价是 dev 下新放进文件要重启 server 才认——public/ 的增删本来就不触发重启。
 */
const BGM_SOURCES = ['audio/bgm.ogg', 'audio/bgm.mp3'].filter((path) =>
  existsSync(fileURLToPath(new URL(`./public/${path}`, import.meta.url))),
)

// 组织站点 yfy-club.github.io 部署在根路径，base 保持 '/'
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  define: {
    __BGM_SOURCES__: JSON.stringify(BGM_SOURCES),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    assetsInlineLimit: 2048,
  },
})
