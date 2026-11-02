/**
 * Next.js 16 emits a Node.js ISR shell for every dynamic route
 * (`functions/[locale]/about.func`) plus the real prerendered files
 * (`functions/en/about.func` + prerender-config.json).
 *
 * @cloudflare/next-on-pages 1.13 only ignores the shell when the dynamic
 * segment is the last path part. Shells such as `/[locale]/about` are
 * otherwise treated as non-edge routes and the adapter aborts.
 *
 * Delete those shells. The prerendered HTML/RSC files stay, and the adapter
 * copies them into the static asset directory.
 */
import fs from 'fs'
import path from 'path'

const functionsDir = path.join(process.cwd(), '.vercel', 'output', 'functions')

function walk(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory() || entry.isSymbolicLink()) {
            if (entry.name.endsWith('.func')) acc.push(full)
            else if (entry.isDirectory()) walk(full, acc)
        }
    }
    return acc
}

let removed = 0
for (const funcDir of walk(functionsDir)) {
    if (!fs.existsSync(funcDir) && !fs.lstatSync(funcDir).isSymbolicLink()) continue
    const relative = path.relative(functionsDir, funcDir)
    if (!relative.includes('[')) continue
    const configPath = funcDir
        .replace(/\.rsc\.func$/, '.rsc.prerender-config.json')
        .replace(/\.func$/, '.prerender-config.json')
    if (fs.existsSync(configPath)) continue
    fs.rmSync(funcDir, { recursive: true, force: true })
    removed++
}

for (const funcDir of walk(functionsDir)) {
    if (!fs.lstatSync(funcDir).isSymbolicLink()) continue
    if (fs.existsSync(funcDir)) continue
    fs.rmSync(funcDir, { force: true })
    removed++
}

console.log(`Removed ${removed} Node.js ISR shells and dangling function symlinks.`)
