import { execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

try {
  console.log("Running db:seed...")
  const result = execSync("npx tsx prisma/seed.ts", {
    cwd: root,
    encoding: "utf-8",
    timeout: 300000, // 5 minutes
    env: { ...process.env },
  })
  console.log(result)
} catch (err) {
  console.error("Seed failed:", err.stdout || err.message)
  process.exit(1)
}
