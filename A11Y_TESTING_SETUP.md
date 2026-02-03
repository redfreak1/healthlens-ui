# Accessibility Testing Integration Guide

## Overview
This guide documents how to integrate comprehensive accessibility testing into your React/Angular projects using a **hybrid approach** combining:
- **Custom a11y-scanner** - Fast local scanning with 22 rules, optimized for development speed
- **axe-core** - Industry-standard comprehensive testing with 100+ rules for WCAG 2.1 compliance
- **ESLint plugin** - Static code analysis and real-time IDE feedback

Together, these tools provide a complete accessibility safety net from development through CI/CD.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Package.json Configuration](#packagejson-configuration)
4. [Scripts Overview](#scripts-overview)
5. [Axe-Core Integration](#axe-core-integration)
6. [Usage Examples](#usage-examples)
7. [Files Created](#files-created)
8. [Accessibility Rules](#accessibility-rules)
9. [Output Formats](#output-formats)
10. [CI/CD Integration](#cicd-integration)
11. [Comparison & Strategy](#comparison--strategy)

---

## Setup Instructions

### Step 1: Create Scripts Folder
Create a `scripts/` folder in your project root:
```bash
mkdir scripts
```

### Step 2: Add Scanner Files
Copy the following files to the `scripts/` folder:
- `a11y-scanner.js` - Main accessibility scanner
- `a11y-scanner.cjs` - CommonJS version (optional)
- `generate-html-report.js` - HTML report generator

### Step 3: Update package.json
Add the following to your `package.json`:

#### Scripts
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "a11y": "node scripts/a11y-scanner.js",
  "a11y:quick": "node scripts/a11y-scanner.js --quick",
  "a11y:full": "node scripts/a11y-scanner.js --full",
  "a11y:report": "node scripts/a11y-scanner.js --report --open",
  "a11y:ci": "node scripts/a11y-scanner.js --fail-on-critical --fail-on-high --format json",
  "a11y:fix": "node scripts/a11y-scanner.js --fix",
  "a11y:watch": "nodemon --ext js,jsx,ts,tsx,html --watch ./src --exec node scripts/a11y-scanner.js --quick",
  "axe": "axe http://localhost:8080 --chromedriver-path <path-to-chromedriver> --exit",
  "axe:report": "axe http://localhost:8080 --chromedriver-path <path-to-chromedriver> --exit > a11y-axe-report.json"
}
```
*Note: Replace `<path-to-chromedriver>` with your actual ChromeDriver path*

#### Dependencies
```json
"dependencies": {
  "chalk": "^4.1.0",
  "open": "^9.0.0"
}
```

#### DevDependencies
```json
"devDependencies": {
  "@axe-core/cli": "^4.11.0",
  "@axe-core/react": "^4.11.0",
  "eslint-plugin-jsx-a11y": "^6.8.0",
  "nodemon": "^3.0.0"
}
```

### Step 4: Create .npmrc (Optional)
If using a custom npm registry, create a `.npmrc` file in project root:
```
registry=https://registry.npmjs.org/
```

### Step 5: Setup axe-core Runtime Integration
Add axe-core to your React entry file (`src/main.tsx`):
```typescript
import { createRoot } from "react-dom/client";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import "./index.css";

// Axe accessibility testing in development
if (process.env.NODE_ENV !== "production") {
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000); // 1000ms delay for dynamic content
}

createRoot(document.getElementById("root")!).render(<App />);
```

### Step 6: Install ChromeDriver (For axe-core CLI)
```bash
npx browser-driver-manager install chrome
```
This installs the correct ChromeDriver version matching your Chrome browser.

### Step 7: Install Dependencies
```bash
npm install
```

---

## Architecture Overview

### Hybrid Testing Approach
```
┌─────────────────────────────────────────────────────────────┐
│     Accessibility Testing Stack              │
├─────────────────────────────────────────────────────────────┤
│ ESLint Plugin (Static)                       │
│ ├─ Real-time IDE feedback                   │
│ ├─ Prevents bad patterns during coding      │
├─────────────────────────────────────────────────────────────┤
│ Custom Scanner (Fast Local)                  │
│ ├─ 22 rules, milliseconds response          │
│ ├─ Watch mode during development            │
│ ├─ Team-specific metrics                    │
├─────────────────────────────────────────────────────────────┤
│ axe-core Runtime (Comprehensive)             │
│ ├─ 100+ rules, WCAG 2.1 certified           │
│ ├─ Browser integration (Chrome DevTools)    │
│ ├─ CLI for CI/CD pipelines                  │
└─────────────────────────────────────────────────────────────┘
```

## Package.json Configuration

### Complete Config Block
Add these sections to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "a11y": "node scripts/a11y-scanner.js",
    "a11y:quick": "node scripts/a11y-scanner.js --quick",
    "a11y:full": "node scripts/a11y-scanner.js --full",
    "a11y:report": "node scripts/a11y-scanner.js --report --open",
    "a11y:ci": "node scripts/a11y-scanner.js --fail-on-critical --fail-on-high --format json",
    "a11y:fix": "node scripts/a11y-scanner.js --fix",
    "a11y:watch": "nodemon --ext js,jsx,ts,tsx,html --watch ./src --exec node scripts/a11y-scanner.js --quick",
    "axe": "axe http://localhost:8080 --chromedriver-path <path-to-chromedriver> --exit",
    "axe:report": "axe http://localhost:8080 --chromedriver-path <path-to-chromedriver> --exit > a11y-axe-report.json"
  },
  "dependencies": {
    "chalk": "^4.1.0",
    "open": "^9.0.0"
  },
  "devDependencies": {
    "@axe-core/cli": "^4.11.0",
    "@axe-core/react": "^4.11.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "nodemon": "^3.0.0"
  }
}
```

---

## Package.json Configuration

---

## Scripts Overview

### 1. **npm run a11y**
Basic accessibility scan with default settings.
- **Severity Level:** Medium and above
- **Output:** Console
- **Use Case:** Quick check during development

### 2. **npm run a11y:quick**
Fast scan focusing only on critical issues.
- **Severity Level:** Critical only
- **Output:** Console
- **Use Case:** Pre-commit checks, quick validation
- **Performance:** Fastest execution

### 3. **npm run a11y:full**
Comprehensive scan detecting all accessibility issues.
- **Severity Level:** All (critical, high, medium, low)
- **Output:** Console
- **Use Case:** Thorough code reviews, release validation

### 4. **npm run a11y:report**
Generate interactive HTML report and open in browser.
- **Output:** HTML file + Browser
- **File Generated:** `./a11y-report.html`
- **Use Case:** Team reviews, documentation, stakeholder sharing
- **Features:** Filterable by severity, searchable, formatted issues

### 5. **npm run a11y:ci**
CI/CD optimized scan with JSON output.
- **Fails On:** Critical and High severity issues
- **Output:** JSON format
- **File Generated:** `./a11y-report.json`
- **Use Case:** GitHub Actions, Jenkins, GitLab CI/CD pipelines
- **Exit Code:** Non-zero if critical/high issues found

### 6. **npm run a11y:fix**
Attempts automatic fixes for accessibility issues.
- **Capabilities:** Auto-fixes common issues (tags, attributes)
- **Output:** Console
- **Use Case:** Quick remediation, mass fixes
- **Note:** Review auto-fixed code before committing

### 7. **npm run a11y:watch**
Continuous monitoring mode for development.
- **Watch Directory:** `./src`
- **Watch Extensions:** js, jsx, ts, tsx, html
- **Auto-runs:** On file changes
- **Use Case:** Real-time a11y validation during coding
- **Requires:** `nodemon` installed
- **Note:** Excludes `components/ui/` folder to avoid false positives on reusable component libraries

### 8. **npm run axe**
axe-core CLI comprehensive scanning.
- **Severity Level:** All (comprehensive WCAG 2.1 validation)
- **Output:** Console + Exit code
- **Use Case:** CI/CD pipelines, professional validation
- **Features:** Industry-standard, 100+ rules, browser integration
- **Requires:** Dev server running on port 8080
- **Exit Code:** Non-zero if violations found

### 9. **npm run axe:report**
axe-core CLI with JSON report output.
- **Output:** JSON file + Console
- **File Generated:** `./a11y-axe-report.json`
- **Use Case:** Compliance documentation, trend tracking
- **Features:** Machine-readable format for automation
- **Requires:** Dev server running on port 8080

---

## Axe-Core Integration

### Runtime Testing in Browser
axe-core automatically runs in development mode (non-production):

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open DevTools Console** (F12 or Right-click → Inspect → Console)

3. **Check for violations:**
   - axe-core automatically reports accessibility violations
   - View full details in the console messages
   - Violations are reported as warnings (yellow) or errors (red)

### Browser Extension Testing
1. Install **axe DevTools** extension:
   - [Chrome](https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility-tester/lhdoppojpmngadmnkpklempisson)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)

2. Run: `npm run dev`

3. Open DevTools → **axe DevTools** tab → Click **"Scan ALL of my page"**

### CLI Testing (For CI/CD)
1. **Start dev server in one terminal:**
   ```bash
   npm run dev
   ```

2. **Run tests in another terminal:**
   ```bash
   # Quick test
   npm run axe
   
   # Generate report
   npm run axe:report
   ```

---

## Usage Examples

### During Development
```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Start watch mode for fast feedback
npm run a11y:watch

# Check DevTools console for axe-core violations automatically
# Or use axe DevTools browser extension
```

### Before Commits
```bash
# Quick custom scanner validation
npm run a11y:quick

# If issues found, attempt fixes
npm run a11y:fix

# ESLint checks
npm run lint
```

### Code Review
```bash
# Generate custom scanner HTML report
npm run a11y:report

# Generate axe-core JSON report (requires running dev server)
npm run axe:report

# Share reports with team
```

### CI/CD Pipeline
```bash
# Custom scanner for basic checks
npm run a11y:ci

# ESLint for code quality + a11y linting
npm run lint

# axe-core for comprehensive WCAG compliance (if browser available)
npm run axe
```

### Scanning Specific File
```bash
node scripts/a11y-scanner.js --file ./src/components/Button.tsx
```

### Scanning Specific Directory
```bash
node scripts/a11y-scanner.js --dir ./src/components
```

### Filtering by Severity
```bash
node scripts/a11y-scanner.js --severity high
```

### Multiple Options
```bash
node scripts/a11y-scanner.js --dir ./src/components --severity high --format json --output ./custom-report.json
```

---

## Files Created

### Directory Structure
```
project-root/
├── scripts/
│   ├── a11y-scanner.js           # Main scanner (1163 lines)
│   ├── a11y-scanner.cjs          # CommonJS version
│   └── generate-html-report.js   # HTML report generator
├── .npmrc                         # NPM registry config
├── package.json                   # Updated with a11y scripts
├── package-lock.json              # Updated registry references
└── A11Y_TESTING_SETUP.md         # This guide
```

### File Descriptions

#### a11y-scanner.js
- **Purpose:** Main accessibility scanning engine
- **Size:** ~1166 lines
- **Features:**
  - 22 built-in accessibility rules
  - Multi-framework support (React, Angular, HTML)
  - Multiple output formats (console, JSON, HTML, VS Code)
  - Severity-based filtering
  - Auto-fix capabilities
  - Report generation
  - File/directory scanning
  - Customizable rules
  - **Optimized:** Excludes `components/ui/` folder to avoid false positives on reusable component libraries
- **Speed:** Milliseconds for typical projects
- **Best For:** Development feedback, team metrics

#### a11y-scanner.cjs
- **Purpose:** CommonJS wrapper for legacy compatibility
- **Use Case:** Projects not using ES modules

#### generate-html-report.js
- **Purpose:** Generates interactive HTML reports
- **Features:**
  - Color-coded severity levels
  - Filterable results
  - Issue context and line numbers
  - Searchable content
  - Browser-friendly layout

#### .npmrc
- **Purpose:** NPM registry configuration
- **Default Content:** `registry=https://registry.npmjs.org/`
- **Use Case:** Override custom/internal registries

---

## Accessibility Rules

### Categories Covered

#### HTML Structure & Semantic
- Missing `lang` attribute on `<html>`
- Missing `<title>` in `<head>`
- Missing viewport meta tag
- Heading hierarchy violations (skipped levels)
- Missing semantic markup

#### Interactive Elements
- Clickable divs without proper roles
- Missing button roles on interactive elements
- Links without href attribute
- Missing keyboard navigation

#### Forms & Inputs
- Missing form labels
- Form inputs without names
- Missing required attribute indicators
- Invalid input types

#### Images & Media
- Missing alt text on images
- Empty alt attributes
- Missing figure captions
- Unlabeled icon buttons

#### ARIA
- Invalid ARIA attributes
- Incorrect ARIA roles
- Missing ARIA labels
- Improper aria-hidden usage

#### Colors & Contrast
- Insufficient color contrast (when analyzable)
- Text color issues
- Background/foreground combinations

#### Focus & Navigation
- Missing focus indicators
- Improper tab order
- Keyboard navigation issues
- Focus trap prevention

#### Frameworks Specific
- **React:** JSX-specific a11y checks
- **Angular:** Angular directive accessibility
- **HTML:** Generic HTML5 checks

---

## Output Formats

### 1. Console Output (Default)
```
🔍 Accessibility Scan Results
════════════════════════════════════

CRITICAL (3 issues)
- Missing alt text on image
- Clickable div without role

HIGH (5 issues)
- Missing form labels
...
```

### 2. JSON Format
```json
{
  "stats": {
    "filesScanned": 15,
    "issuesFound": 28,
    "duration": "2.34s"
  },
  "results": {
    "critical": [...],
    "high": [...],
    "medium": [...],
    "low": [...]
  }
}
```

### 3. HTML Report
- Interactive, browser-viewable format
- Color-coded severity levels
- Filterable results
- Issue details and code context
- File automatically opens in default browser

### 4. VS Code Format
- Outputs problems in VS Code format
- Integrates with Problems panel
- Shows issues with file:line:column format
- Enables quick fixes via VS Code

---

## CI/CD Integration

### GitHub Actions Example (Complete)
```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      
      # ESLint checks
      - name: Lint
        run: npm run lint
      
      # Custom scanner
      - name: Custom a11y scan
        run: npm run a11y:ci
        continue-on-error: true
      
      # Build for axe testing
      - name: Build
        run: npm run build
      
      # Preview and test with axe-core (optional for browser testing)
      - name: Install ChromeDriver
        run: npx browser-driver-manager install chrome
      
      - name: Start preview server
        run: npm run preview &
        
      - name: axe-core scan
        run: npm run axe:report
        continue-on-error: true
      
      # Upload reports
      - name: Upload reports
        uses: actions/upload-artifact@v2
        with:
          name: a11y-reports
          path: |
            a11y-report.html
            a11y-axe-report.json
```

### GitLab CI Example
```yaml
accessibility:
  stage: test
  image: node:18-browsers
  script:
    - npm install
    - npm run lint
    - npm run a11y:ci
    - npm run build
    - npm run preview &
    - sleep 3
    - npx browser-driver-manager install chrome
    - npm run axe:report || true
  artifacts:
    paths:
      - a11y-report.html
      - a11y-axe-report.json
    expire_in: 30 days
  allow_failure: false
```

### Jenkins Example
```groovy
stage('Accessibility Tests') {
  steps {
    sh 'npm install'
    sh 'npm run lint'
    sh 'npm run a11y:ci'
    sh 'npm run build'
    sh 'npm run preview &'
    sh 'sleep 3'
    sh 'npx browser-driver-manager install chrome'
    sh 'npm run axe:report || true'
  }
  post {
    always {
      publishHTML([
        reportDir: '.',
        reportFiles: 'a11y-report.html',
        reportName: 'Custom a11y Report'
      ])
      archiveArtifacts artifacts: 'a11y-axe-report.json', allowEmptyArchive: true
    }
  }
}
```

### Pre-commit Hook (Husky)
```bash
#!/bin/sh
# Run linting and quick a11y scan
npm run lint
npm run a11y:quick
```

### Pre-push Hook (Husky)
```bash
#!/bin/sh
# Full a11y scan before push
npm run a11y:full
```

---

## Best Practices

### Development
- ✅ Use ESLint with jsx-a11y for real-time IDE feedback
- ✅ Run `npm run a11y:watch` in one terminal during development
- ✅ Check DevTools console for axe-core violations automatically
- ✅ Review violations frequently during development
- ✅ Check `npm run a11y:quick` before commits

### Code Review
- ✅ Generate custom report: `npm run a11y:report` for team discussions
- ✅ Generate axe-core report: `npm run axe:report` for WCAG compliance
- ✅ Share HTML reports with stakeholders
- ✅ Include a11y issues in PR checklists
- ✅ Reference specific WCAG guidelines in comments

### CI/CD
- ✅ Use `npm run lint` for static analysis
- ✅ Use `npm run a11y:ci` for custom scanner baseline
- ✅ Use `npm run axe` for comprehensive WCAG validation
- ✅ Fail builds on critical/high issues from axe-core
- ✅ Generate JSON reports for tracking trends
- ✅ Archive reports as artifacts for compliance

### Auto-fixing
- ✅ Use `npm run a11y:fix` for bulk fixes
- ✅ Review auto-fixed code manually
- ✅ Test functionality thoroughly after fixes
- ✅ Commit fixes separately with clear messages
- ✅ Run tests after fixes to ensure no regressions

### Maintenance
- ✅ Keep dependencies updated: `npm update`
- ✅ Review axe-core updates for new rules
- ✅ Customize custom scanner rules for team standards
- ✅ Document team a11y guidelines and exceptions
- ✅ Track accessibility metrics over time
- ✅ Schedule regular a11y training for team

### UI Component Libraries
- ✅ Custom scanner automatically excludes `components/ui/` folder
- ✅ Test UI components in context (parent components)
- ✅ Use axe-core for comprehensive UI validation
- ✅ Document accessibility expectations in component docs

---

## Troubleshooting

### Custom Scanner

#### "Cannot find package 'open'"
**Solution:** Run `npm install open`

#### "Cannot find package 'chalk'"
**Solution:** Run `npm install chalk`

#### "nodemon not found"
**Solution:** Run `npm install --save-dev nodemon`

#### No issues detected but you know there are issues
**Solution:** Check severity level, may need to run `npm run a11y:full` instead of `npm run a11y`

#### HTML report not opening automatically
**Solution:** Manually open `./a11y-report.html` in your browser, or check file permissions

#### Watch mode not triggering
**Solution:** Ensure nodemon is installed and files are in the `./src` directory

### axe-core

#### ChromeDriver version mismatch
**Error:** "This version of ChromeDriver only supports Chrome version X"
**Solution:** Run `npx browser-driver-manager install chrome` to install matching version

#### "Cannot find package '@axe-core/cli'"
**Solution:** Run `npm install --save-dev @axe-core/cli`

#### axe command not found
**Solution:** Ensure @axe-core/cli is installed and use full path or npx:
```bash
npx axe http://localhost:8080 --exit
```

#### "Connection refused" when running axe tests
**Solution:** Make sure dev server is running on port 8080:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run axe
```

#### No violations reported but expect issues
**Solution:** Your code is very accessible! axe-core only reports actual WCAG violations, not style/pattern suggestions

### ESLint

#### jsx-a11y rules not working
**Solution:** Ensure `eslint-plugin-jsx-a11y` is installed and included in eslint config

#### Too many warnings
**Solution:** Configure rule severity in `.eslintrc`:
```json
{
  "extends": ["plugin:jsx-a11y/strict"]
}
```

---

## Performance Considerations

### Custom Scanner
- **Quick Scan:** ~0.5-1 second for medium projects
- **Full Scan:** ~2-5 seconds for medium projects
- **Report Generation:** ~1-2 seconds additional
- **Watch Mode:** Runs on file changes with 1-2 second delay
- **Pros:** Very fast, instant feedback during development
- **Cons:** Less comprehensive than axe-core

### axe-core
- **Runtime Check:** ~500-2000ms for typical page
- **CLI Scan:** ~5-15 seconds including browser startup
- **Browser Startup:** ~3-5 seconds
- **Report Generation:** ~1 second
- **Pros:** Comprehensive, industry-standard, accurate
- **Cons:** Slower, requires browser launch

### ESLint
- **Lint Check:** <500ms for typical project
- **Watch Mode:** Incremental updates
- **Pros:** Real-time, zero runtime overhead
- **Cons:** Static analysis only

### Recommended Strategy
1. **During Development:** ESLint (real-time) + Custom Scanner watch mode (1-2 second feedback)
2. **Before Commit:** Custom scanner quick check (<1 second)
3. **CI/CD:** All three tools in parallel

---

## Comparison & Strategy

For a detailed comparison between custom scanner and axe-core, see [A11Y_SCANNER_VS_AXE_COMPARISON.md](A11Y_SCANNER_VS_AXE_COMPARISON.md)

**TL;DR:** Use BOTH tools together:
- Custom scanner for fast development feedback
- axe-core for professional WCAG compliance validation
- ESLint for preventing issues during coding

---

## Resources

### Official Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [axe DevTools Documentation](https://www.deque.com/axe/devtools/)

### Learning Resources
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)
- [React Accessibility Guide](https://react.dev/learn/accessibility)

### Tools & Extensions
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated:** February 3, 2026

**Version:** 2.0.0

**Author:** Your Team

---

## Changelog

### v2.0.0 (Hybrid Approach with axe-core)
- ✅ Added axe-core integration (100+ rules, WCAG 2.1 certified)
- ✅ Added axe-core CLI scripts for CI/CD
- ✅ Added ESLint plugin jsx-a11y for static analysis
- ✅ Custom scanner now excludes UI component libraries (false positive reduction)
- ✅ Comprehensive comparison documentation
- ✅ Runtime accessibility testing in development
- ✅ Hybrid approach documentation (custom + axe-core + ESLint)
- ✅ Updated CI/CD examples with all tools
- ✅ ChromeDriver setup instructions
- ✅ Performance benchmarks added

### v1.0.0 (Initial Release)
- ✅ 22 accessibility rules
- ✅ Multi-framework support (React, Angular, HTML)
- ✅ Multiple output formats (console, JSON, HTML, VS Code)
- ✅ HTML report generation with filtering
- ✅ Auto-fix capabilities
- ✅ CI/CD integration ready
- ✅ Watch mode for development
- ✅ ESLint integration support
