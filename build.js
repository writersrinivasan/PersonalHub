/**
 * Build script for Vercel deployment.
 * Reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from env and injects it into the HTML.
 * Output goes to dist/ which Vercel serves as the static site.
 */
const fs   = require('fs');
const path = require('path');

const SRC  = __dirname;
const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

const PLACEHOLDER = '__CLERK_PUBLISHABLE_KEY__';

const srcFiles = ['index.html', 'app.js', 'style.css'];
const copyFiles = ['README.md', 'SETUP_GOOGLE_CALENDAR.md'];

for (const file of srcFiles) {
  let content = fs.readFileSync(path.join(SRC, file), 'utf-8');
  content = content.replace(new RegExp(PLACEHOLDER, 'g'), clerkPk);
  fs.writeFileSync(path.join(DIST, file), content);
  console.log(`  copied  ${file}`);
}

for (const file of copyFiles) {
  const src = path.join(SRC, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, file));
    console.log(`  copied  ${file}`);
  }
}

console.log('\nBuild → dist/');
if (clerkPk) {
  console.log(`Clerk key injected: ${clerkPk.slice(0, 12)}…`);
} else {
  console.log('Clerk key not set — auth will be disabled (app still works without it)');
}
