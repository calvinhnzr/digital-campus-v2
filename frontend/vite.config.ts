import path from "path"
import { defineConfig, loadEnv, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import mdx from "@mdx-js/rollup"

// Personal data (names from the door signs) stays in db.json for the dev server and the local
// data tool, but is removed from every production build so it is never published.
const stripPeople = (): Plugin => ({
  name: "strip-people",
  enforce: "pre",
  apply: "build",
  transform(code, id) {
    if (!id.split("?")[0].endsWith("/src/db/db.json")) return null
    const db = JSON.parse(code)
    db.people = []
    db.rooms = db.rooms.map((room: { people?: string[] }) => ({ ...room, people: [] }))
    return { code: JSON.stringify(db), map: null }
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [stripPeople(), react(), mdx({ providerImportSource: "@mdx-js/react" })],
    base: env.VITE_PATH, // Use the VITE_PATH environment variable for the base path
    cacheDir: "node_modules/.vite",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        assets: path.resolve(__dirname, "./src/assets"),
        components: path.resolve(__dirname, "./src/components"),
        data: path.resolve(__dirname, "./src/data"),
        db: path.resolve(__dirname, "./src/db"),
        hooks: path.resolve(__dirname, "./src/hooks"),
        shaders: path.resolve(__dirname, "./src/shaders"),
        store: path.resolve(__dirname, "./src/store"),
        styles: path.resolve(__dirname, "./src/styles"),
        types: path.resolve(__dirname, "./src/types"),
        ui: path.resolve(__dirname, "./src/ui"),
        utils: path.resolve(__dirname, "./src/utils"),
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true, // needed for the Docker Container port mapping to work
      strictPort: true,
      port: 5174, // you can replace this port with any port
    },
    assetsInclude: ["**/*.glb"], // <-- Add this line
  }
})
