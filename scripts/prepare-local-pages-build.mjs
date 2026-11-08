// next-on-pages' standard offline placeholder link. This is a local build only;
// it neither links a Vercel project nor pulls credentials or environment values.
import fs from 'node:fs'
if (!fs.existsSync('.vercel/project.json')) {
  fs.mkdirSync('.vercel', { recursive: true })
  fs.writeFileSync('.vercel/project.json', JSON.stringify({
    projectId: '_', orgId: '_',
    settings: { framework: 'nextjs', buildCommand: 'npm run build', outputDirectory: null },
  }, null, 2))
}
