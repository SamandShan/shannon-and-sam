import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir   = join(__dirname, 'temporary screenshots');

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

// Auto-increment
const existing = readdirSync(dir).filter(f => /^screenshot-\d+/.test(f));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n));
const n = nums.length ? Math.max(...nums) + 1 : 1;
const file = join(dir, label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForTimeout(1500); // let fonts/images settle
await page.screenshot({ path: file, fullPage: false });
await browser.close();
console.log(`Screenshot saved: ${file}`);
