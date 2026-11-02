/**
 * Copy Next.js prerendered HTML into the Pages static directory.
 * Does not copy RSC flight data (that blows the free-plan file cap).
 * The .func directories are only symlinks to a shared Node launcher;
 * the HTML itself lives next to the prerender config.
 */
import fs from 'fs'
import path from 'path'

const functionsDir = path.join(process.cwd(), '.vercel', 'output', 'functions')
const staticDir = path.join(process.cwd(), '.vercel', 'output', 'static')

function walk(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory() && !entry.isSymbolicLink()) walk(full, acc)
        else if (entry.isFile() && entry.name.endsWith('.prerender-config.json') && !entry.name.includes('.rsc.')) {
            acc.push(full)
        }
    }
    return acc
}

let copied = 0
for (const configPath of walk(functionsDir)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const fsPath = config?.fallback?.fsPath
    if (!fsPath || !fsPath.endsWith('.html')) continue
    const source = path.join(path.dirname(configPath), fsPath)
    if (!fs.existsSync(source)) continue
    const relativeConfig = path.relative(functionsDir, configPath)
    const destName = fsPath.replace(/\.prerender-fallback\.html$/i, '.html')
    const dest = path.join(staticDir, path.dirname(relativeConfig), destName)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(source, dest)
    copied++
}

console.log(`Copied ${copied} prerendered HTML files into .vercel/output/static`)
if (copied < 1000) {
    console.error('Expected thousands of prerendered HTML files.')
    process.exit(1)
}
