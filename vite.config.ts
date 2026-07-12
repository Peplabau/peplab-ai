import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

/** Preload + hoist built CSS so mobile paints styled content before the JS module runs. */
function cssFirstPlugin(): Plugin {
  return {
    name: "css-first",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const match = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
        if (!match) return html
        const tag = match[0]
        const href = match[1]
        const without = html.replace(tag, "")
        const block = `    <link rel="preload" href="${href}" as="style" />\n    ${tag}`
        return without.replace(
          '<meta name="color-scheme" content="dark" />',
          `<meta name="color-scheme" content="dark" />\n\n${block}`,
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  const devResendProxy =
    mode === "development" && env.VITE_RESEND_API_KEY
      ? {
          "/api/resend/emails": {
            target: "https://api.resend.com",
            changeOrigin: true,
            rewrite: () => "/emails",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configure(proxy: any) {
              proxy.on("proxyReq", (proxyReq: { setHeader: (k: string, v: string) => void }) => {
                proxyReq.setHeader("Authorization", `Bearer ${env.VITE_RESEND_API_KEY}`)
              })
            },
          },
        }
      : undefined

  return {
    base: "/",
    plugins: [
      react(),
      cssFirstPlugin(),
      // Vercel waits for the Node process to exit after `vite build`. A timer,
      // open handle, or plugin can keep the event loop alive and stall deploy
      // until the 45m build cap. See: vercel.com/kb/guide/fixing-deployments-that-hang-after-the-build-step-succeeds
      {
        name: "force-exit-after-build",
        apply: "build",
        closeBundle() {
          setTimeout(() => process.exit(0), 0)
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: devResendProxy ? { proxy: devResendProxy } : {},
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return

            const normalized = id.replace(/\\/g, "/")

            // Only split libraries that do NOT depend on React — splitting react into
            // a separate chunk caused circular vendor↔react imports and a black screen
            // in production (React.useLayoutEffect undefined).
            if (normalized.includes("/gsap")) return "gsap"
            if (normalized.includes("/@supabase/supabase-js")) return "supabase"
            if (normalized.includes("/recharts/")) return "charts"
          },
        },
      },
    },
  }
})