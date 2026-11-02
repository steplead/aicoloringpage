/**
 * next-on-pages invokes the Worker for every path when middleware exists.
 * HTML must be excluded so Cloudflare Pages serves the prerendered files
 * and the free-plan 10ms CPU limit is never charged for a page view.
 *
 * Only /api/* stays on the Worker (image generator, story outline, cron, health).
 */
import fs from 'fs'
import path from 'path'

const outDir = path.join(process.cwd(), '.vercel', 'output', 'static')
const routesPath = path.join(outDir, '_routes.json')

if (!fs.existsSync(outDir)) {
    console.error(`Missing ${outDir}. Run @cloudflare/next-on-pages first.`)
    process.exit(1)
}

const routes = {
    version: 1,
    include: ['/api/*'],
    exclude: [
        '/',
        '/sitemap.xml',
        '/robots.txt',
        '/favicon.ico',
        '/_next/static/*',
        '/en',
        '/en/*',
        '/es',
        '/es/*',
        '/pt',
        '/pt/*',
        '/fr',
        '/fr/*',
    ],
}

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2) + '\n')

// RSC payloads are not deployed. Full page loads use the HTML files.
function removePayloads(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            if (entry.name.endsWith('.segments') || entry.name === '__next-on-pages-dist__') {
                if (entry.name.endsWith('.segments')) fs.rmSync(full, { recursive: true, force: true })
                else removePayloads(full)
            } else {
                removePayloads(full)
            }
        } else if (entry.name.endsWith('.rsc') || entry.name === 'nop-build-log.json') {
            fs.unlinkSync(full)
        }
    }
}
removePayloads(outDir)

function walk(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full, acc)
        else acc.push(full)
    }
    return acc
}

const files = walk(outDir)
const html = files.filter((file) => file.endsWith('.html'))
const printable = html.filter((file) => file.includes(`${path.sep}printable${path.sep}`))
const sitemaps = files.filter((file) => path.basename(file).startsWith('sitemap'))

function workerBytes() {
    let total = 0
    const workerJs = path.join(outDir, '_worker.js')
    if (fs.existsSync(workerJs) && fs.statSync(workerJs).isFile()) {
        total += fs.statSync(workerJs).size
    }
    const workerDir = path.join(outDir, '_worker.js')
    if (fs.existsSync(workerDir) && fs.statSync(workerDir).isDirectory()) {
        for (const file of walk(workerDir)) total += fs.statSync(file).size
    }
    return total
}

const worker = workerBytes()
const catalogHit = files.some((file) => file.includes('seo-pages'))

console.log('--- pages output ---')
console.log(`files: ${files.length}`)
console.log(`html: ${html.length}`)
console.log(`printable html: ${printable.length}`)
console.log(`sitemap files: ${sitemaps.length} (${sitemaps.map((file) => path.basename(file)).join(', ') || 'none'})`)
console.log(`worker bytes: ${worker} (${(worker / 1024).toFixed(1)} KiB)`)
console.log(`seo json copied into output: ${catalogHit}`)
console.log(`free-plan file cap 20000: ${files.length <= 20000 ? 'ok' : 'OVER LIMIT'}`)

if (files.length > 20000) {
    console.error(`Static output has ${files.length} files, over the Pages Free cap of 20000.`)
    process.exit(1)
}
if (printable.length === 0) {
    console.error('No prerendered printable HTML was found.')
    process.exit(1)
}
if (!sitemaps.length && !files.some((file) => file.endsWith(`${path.sep}sitemap.xml`))) {
    console.error('sitemap.xml was not emitted.')
    process.exit(1)
}
