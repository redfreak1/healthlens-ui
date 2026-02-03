const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    directory: './src',
    format: 'console',
    quick: false
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) opts.directory = args[++i];
    if (args[i] === '--quick') opts.quick = true;
    if (args[i] === '--format' && args[i + 1]) opts.format = args[++i];
  }
  return opts;
}

const RULES = [
  {
    id: 'html-missing-lang',
    description: 'HTML element missing lang attribute',
    test: (content) => /<html[^>]*>/.test(content) && !/<html[^>]*lang=/.test(content),
    severity: 'critical'
  },
  {
    id: 'image-missing-alt',
    description: 'Image element missing alt attribute',
    test: (content) => /<img(?![^>]*alt=)[^>]*>/g.test(content),
    severity: 'high'
  },
  {
    id: 'missing-aria-label',
    description: 'Interactive element missing ARIA label',
    test: (content) => /role="button"[^>]*>(?![^<]*aria-label)/g.test(content),
    severity: 'high'
  },
  {
    id: 'form-missing-label',
    description: 'Form input missing associated label',
    test: (content) => /<input[^>]*>(?![^<]*<label)/g.test(content),
    severity: 'high'
  },
  {
    id: 'heading-skip',
    description: 'Heading hierarchy skipped',
    test: (content) => /(<h1[^>]*>.*?<\/h1>[\s\S]*?<h3[^>]*>|<h2[^>]*>.*?<\/h2>[\s\S]*?<h4[^>]*>)/i.test(content),
    severity: 'medium'
  },
  {
    id: 'color-alone',
    description: 'Color used alone to convey information',
    test: (content) => /style="[^"]*color:[^"]*"[^>]*>[A-Za-z]+<\/[a-z]+>/i.test(content),
    severity: 'medium'
  }
];

async function scanDirectory(dir, opts) {
  const results = [];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next'];

  async function walk(currentPath) {
    try {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue;

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.html', '.js', '.jsx', '.ts', '.tsx', '.vue', '.astro'].includes(ext)) {
            try {
              const content = await fs.promises.readFile(fullPath, 'utf8');
              const filePath = path.relative(process.cwd(), fullPath);

              for (const rule of RULES) {
                if (rule.test(content)) {
                  results.push({
                    file: filePath,
                    rule: rule.id,
                    severity: rule.severity,
                    description: rule.description
                  });
                }
              }
            } catch (readErr) {
              // Skip files that can't be read
            }
          }
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
  }

  await walk(dir);
  return results;
}

async function main() {
  const opts = parseArgs();

  if (!fs.existsSync(opts.directory)) {
    console.error(`Error: Directory not found: ${opts.directory}`);
    process.exit(1);
  }

  console.log(`Scanning ${opts.directory} for accessibility issues...`);

  const results = await scanDirectory(opts.directory, opts);

  if (results.length === 0) {
    console.log('✓ No accessibility issues found!');
    process.exit(0);
  }

  const bySeverity = {
    critical: results.filter(r => r.severity === 'critical'),
    high: results.filter(r => r.severity === 'high'),
    medium: results.filter(r => r.severity === 'medium'),
    low: results.filter(r => r.severity === 'low')
  };

  if (bySeverity.critical.length > 0) {
    console.log('\n🔴 CRITICAL:');
    bySeverity.critical.forEach(r => console.log(`  ${r.file} - ${r.rule}`));
  }

  if (bySeverity.high.length > 0) {
    console.log('\n🟠 HIGH:');
    bySeverity.high.forEach(r => console.log(`  ${r.file} - ${r.rule}`));
  }

  if (bySeverity.medium.length > 0 && !opts.quick) {
    console.log('\n🟡 MEDIUM:');
    bySeverity.medium.forEach(r => console.log(`  ${r.file} - ${r.rule}`));
  }

  const total = results.length;
  console.log(`\nTotal: ${total} issue(s) found`);

  process.exit(bySeverity.critical.length > 0 || bySeverity.high.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
