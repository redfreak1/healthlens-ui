#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import util from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const execAsync = util.promisify(exec);

// Simple coloring fallback - supports both chalk.color(text) and chalk.color.bold(text)
const createColor = (code, boldCode) => {
  const colorFunc = (text) => `\x1b[${code}m${text}\x1b[0m`;
  colorFunc.bold = (text) => `\x1b[${boldCode}m${text}\x1b[0m`;
  return colorFunc;
};

const chalk = {
  red: createColor('31', '1;31'),
  green: createColor('32', '1;32'),
  yellow: createColor('33', '1;33'),
  blue: createColor('34', '1;34'),
  magenta: createColor('35', '1;35'),
  cyan: createColor('36', '1;36'),
  white: createColor('37', '1;37'),
  gray: createColor('90', '1;90'),
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

// ============================
// Accessibility Rules Database
// ============================

const RULES = {
  // HTML Structure & Semantic Rules
  HTML_MISSING_LANG: {
    id: 'html-missing-lang',
    description: 'HTML element missing lang attribute',
    pattern: /<html[^>]*>/gi,
    check: (match) => !match.includes('lang='),
    fix: 'Add lang="en" or appropriate language code to <html> element',
    severity: 'critical',
    category: 'html',
    frameworks: ['react', 'angular', 'html']
  },

  HTML_MISSING_TITLE: {
    id: 'html-missing-title',
    description: 'Missing <title> in <head>',
    pattern: /<head>[\s\S]*?<\/head>/gi,
    check: (content) => !/<title>[\s\S]*?<\/title>/gi.test(content),
    fix: 'Add descriptive page title within <head>',
    severity: 'critical',
    category: 'html',
    frameworks: ['react', 'angular', 'html']
  },

  HTML_MISSING_VIEWPORT: {
    id: 'html-missing-viewport',
    description: 'Missing viewport meta tag',
    pattern: /<head>[\s\S]*?<\/head>/gi,
    check: (content) => !/<meta[^>]*name=["']viewport["'][^>]*>/gi.test(content),
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
    severity: 'medium',
    category: 'html',
    frameworks: ['react', 'angular', 'html']
  },

  HEADING_SKIP: {
    id: 'heading-skip',
    description: 'Skipped heading level (e.g., h1 to h3 without h2)',
    pattern: /<h([1-6])[^>]*>[\s\S]*?<\/h\1>/gi,
    check: (match, content, matches) => {
      if (!matches || matches.length < 2) return false;
      const headingLevels = matches.map(m => parseInt(m.match(/<h([1-6])/)[1]));
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i-1] + 1) {
          return true;
        }
      }
      return false;
    },
    fix: 'Maintain proper heading hierarchy (h1, h2, h3, etc.)',
    severity: 'high',
    category: 'semantic',
    frameworks: ['react', 'angular', 'html']
  },

  // Interactive Elements
  CLICKABLE_DIV: {
    id: 'clickable-div',
    description: 'Div with click handler - should be <button> or have role',
    pattern: /<div[^>]*(onclick|onClick|@click|\(click\))[^>]*>/gi,
    fix: 'Replace with <button> or add role="button" and tabindex="0"',
    severity: 'critical',
    category: 'interactive',
    frameworks: ['react', 'angular', 'html']
  },

  NON_SEMANTIC_LIST: {
    id: 'non-semantic-list',
    description: 'List implemented with divs instead of <ul>/<ol>',
    pattern: /<div[^>]*class=["'][^"']*(list|menu|nav|items)["'][^>]*>[\s\S]*?<\/div>/gi,
    fix: 'Use <ul> or <ol> with <li> elements',
    severity: 'high',
    category: 'semantic',
    frameworks: ['react', 'angular', 'html']
  },

  TABLE_MISSING_HEADERS: {
    id: 'table-missing-headers',
    description: 'Table missing <th> headers',
    pattern: /<table[^>]*>[\s\S]*?<\/table>/gi,
    check: (table) => !/<th[^>]*>[\s\S]*?<\/th>/gi.test(table),
    fix: 'Add <th> elements in <thead> or add scope attributes',
    severity: 'high',
    category: 'semantic',
    frameworks: ['react', 'angular', 'html']
  },

  // ARIA Rules
  MISSING_ARIA_LABEL: {
    id: 'missing-aria-label',
    description: 'Interactive element missing accessible name',
    patterns: [
      /<button[^>]*>[\s\S]*?<\/button>/gi,
      /<a[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi,
      /<input[^>]*type=["'](?!hidden)(button|submit|checkbox|radio|text|email|password|search|tel|url)["'][^>]*>/gi,
      /<textarea[^>]*>/gi,
      /<select[^>]*>/gi
    ],
    check: (element) => {
      const hasVisibleText = />[^<>]+</.test(element);
      const hasAriaLabel = /(aria-(label|labelledby)|title|alt)=["'][^"']+["']/gi.test(element);
      const hasValue = /value=["'][^"']+["']/gi.test(element);
      const isImageButton = /<input[^>]*type=["']image["'][^>]*>/gi.test(element);
      const hasPlaceholder = /placeholder=["'][^"']+["']/gi.test(element);
      
      return !hasVisibleText && !hasAriaLabel && !hasValue && !isImageButton && !hasPlaceholder;
    },
    fix: 'Add aria-label, aria-labelledby, title, or visible text content',
    severity: 'critical',
    category: 'aria',
    frameworks: ['react', 'angular', 'html']
  },

  INVALID_ARIA: {
    id: 'invalid-aria',
    description: 'Invalid or unsupported ARIA attribute',
    pattern: /\s(aria-[a-z-]+)=["'][^"']*["']/gi,
    check: (ariaAttr) => {
      const validAriaAttributes = [
        'aria-label', 'aria-labelledby', 'aria-describedby',
        'aria-hidden', 'aria-live', 'aria-busy', 'aria-expanded',
        'aria-pressed', 'aria-checked', 'aria-selected',
        'aria-haspopup', 'aria-controls', 'aria-current',
        'aria-role', 'aria-atomic', 'aria-relevant', 'aria-modal',
        'aria-disabled', 'aria-readonly', 'aria-required',
        'aria-invalid', 'aria-multiline', 'aria-multiselectable',
        'aria-orientation', 'aria-placeholder', 'aria-valuemax',
        'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
        'aria-sort', 'aria-posinset', 'aria-setsize',
        'aria-colcount', 'aria-colindex', 'aria-colspan',
        'aria-rowcount', 'aria-rowindex', 'aria-rowspan',
        'aria-level', 'aria-details', 'aria-errormessage',
        'aria-flowto', 'aria-keyshortcuts', 'aria-roledescription'
      ];
      
      const attrName = ariaAttr.match(/(aria-[a-z-]+)=/i)?.[1].toLowerCase();
      return attrName && !validAriaAttributes.includes(attrName);
    },
    fix: 'Use valid ARIA attributes from WAI-ARIA specification',
    severity: 'medium',
    category: 'aria',
    frameworks: ['react', 'angular', 'html']
  },

  BUTTON_MISSING_TABINDEX: {
    id: 'button-missing-tabindex',
    description: 'Element with role="button" missing tabindex="0"',
    pattern: /role=["']button["'][^>]*>/gi,
    check: (element) => !/tabindex=["']0["']/gi.test(element),
    fix: 'Add tabindex="0" for keyboard accessibility',
    severity: 'critical',
    category: 'keyboard',
    frameworks: ['react', 'angular', 'html']
  },

  // Image Rules
  IMAGE_MISSING_ALT: {
    id: 'image-missing-alt',
    description: 'Image missing alt text',
    pattern: /<img[^>]*>/gi,
    check: (imgTag) => {
      const hasAlt = /alt=["'][^"']*["']/gi.test(imgTag);
      const isDecorative = /alt=["']["']/gi.test(imgTag) || 
                         /role=["']presentation["']/gi.test(imgTag) ||
                         /aria-hidden=["']true["']/gi.test(imgTag);
      
      // Check if image is likely meaningful
      const isLikelyMeaningful = !/(width|height)=["']1["']/gi.test(imgTag) &&
                                !/src=["'][^"']*(spacer|blank|pixel|1x1)[^"']*["']/gi.test(imgTag) &&
                                !/class=["'][^"']*(icon|decoration|bg|background)[^"']*["']/gi.test(imgTag);
      
      return !hasAlt && isLikelyMeaningful;
    },
    fix: 'Add descriptive alt text, or alt="" if decorative',
    severity: 'critical',
    category: 'media',
    frameworks: ['react', 'angular', 'html']
  },

  ALT_TEXT_REDUNDANT: {
    id: 'alt-text-redundant',
    description: 'Alt text contains redundant words (image, picture, etc.)',
    pattern: /alt=["'](image|picture|photo|graphic|icon|img|Image|Picture|Photo)[^"']*["']/gi,
    fix: 'Describe the content, not the type (e.g., "Close button" instead of "Close icon")',
    severity: 'low',
    category: 'media',
    frameworks: ['react', 'angular', 'html']
  },

  // Form Rules
  FORM_MISSING_LABEL: {
    id: 'form-missing-label',
    description: 'Form control missing associated label',
    pattern: /<(input|textarea|select)[^>]*>/gi,
    check: (element, content) => {
      // Skip hidden inputs
      if (/type=["']hidden["']/gi.test(element)) return false;
      
      const idMatch = element.match(/id=["']([^"']+)["']/);
      if (idMatch) {
        const id = idMatch[1];
        const labelExists = new RegExp(
          `<label[^>]*for=["']${id}["'][^>]*>`,
          'gi'
        ).test(content);
        return !labelExists;
      }
      
      const hasAriaLabel = /(aria-(label|labelledby)|title)=["'][^"']+["']/gi.test(element);
      const hasPlaceholder = /placeholder=["'][^"']+["']/gi.test(element);
      
      return !hasAriaLabel && !hasPlaceholder;
    },
    fix: 'Add <label> with for attribute matching input id, or use aria-label/aria-labelledby',
    severity: 'critical',
    category: 'forms',
    frameworks: ['react', 'angular', 'html']
  },

  REQUIRED_WITHOUT_INDICATION: {
    id: 'required-without-indication',
    description: 'Required field missing ARIA or visual indication',
    pattern: /<(input|textarea|select)[^>]*required[^>]*>/gi,
    check: (element) => {
      const hasAriaRequired = /aria-required=["']true["']/gi.test(element);
      const hasRequiredText = /(aria-label|title)=["'][^"']*\brequired\b[^"']*["']/gi.test(element);
      
      return !hasAriaRequired && !hasRequiredText;
    },
    fix: 'Add aria-required="true" or include "required" in label/placeholder',
    severity: 'high',
    category: 'forms',
    frameworks: ['react', 'angular', 'html']
  },

  // Color & Contrast (detectable patterns)
  COLOR_ALONE: {
    id: 'color-alone',
    description: 'Information conveyed by color alone',
    pattern: /color:\s*#[0-9a-fA-F]{3,6}[^;]*(required|error|invalid|\*)[^;]*;/gi,
    fix: 'Add text, icon, or pattern along with color',
    severity: 'medium',
    category: 'color',
    frameworks: ['react', 'angular', 'html']
  },

  // React Specific
  REACT_FRAGMENT_MISUSE: {
    id: 'react-fragment-misuse',
    description: 'Interactive element inside fragment without wrapper',
    pattern: /<>\s*<(div|span|a)[^>]*(onClick|onKeyDown|tabIndex)=[^>]*>\s*<\/>/gi,
    fix: 'Wrap in semantic container or add role',
    severity: 'medium',
    category: 'react',
    frameworks: ['react']
  },

  REACT_MISSING_KEYS: {
    id: 'react-missing-keys',
    description: 'List items missing key prop',
    pattern: /\.map\s*\([^)]*=>\s*<(div|span|li|tr|td)[^>]*>/gi,
    check: (code) => !/key=["'][^"']+["']/gi.test(code),
    fix: 'Add unique key prop to list items',
    severity: 'high',
    category: 'react',
    frameworks: ['react']
  },

  // Angular Specific
  ANGULAR_CLICK_NO_ARIA: {
    id: 'angular-click-no-aria',
    description: 'Angular element with (click) missing aria-label',
    pattern: /<(button|div|span)[^>]*\(click\)[^>]*>/gi,
    check: (element) => !/(attr\.aria-label|i18n-aria-label|aria-label)=["'][^"']+["']/gi.test(element),
    fix: 'Add [attr.aria-label], i18n-aria-label, or aria-label',
    severity: 'critical',
    category: 'angular',
    frameworks: ['angular']
  },

  ANGULAR_NGFOR_NO_TRACKBY: {
    id: 'angular-ngfor-no-trackby',
    description: '*ngFor without trackBy',
    pattern: /\*ngFor\s*=\s*["'][^"']+["']/gi,
    check: (context) => !/trackBy/gi.test(context),
    fix: 'Add trackBy function for performance',
    severity: 'medium',
    category: 'angular',
    frameworks: ['angular']
  },

  // Focus Management
  MISSING_FOCUS_STYLE: {
    id: 'missing-focus-style',
    description: 'CSS removes focus outline without providing alternative',
    pattern: /outline\s*:\s*(none|0|hidden)[^;]*;/gi,
    check: (css, content) => {
      const hasFocusStyles = /:focus\s*{[^}]*}/gi.test(content) || 
                           /:focus-visible\s*{[^}]*}/gi.test(content);
      return !hasFocusStyles;
    },
    fix: 'Add visible focus styles (border, background change, shadow, etc.)',
    severity: 'high',
    category: 'keyboard',
    frameworks: ['react', 'angular', 'html']
  },

  TABINDEX_MISUSE: {
    id: 'tabindex-misuse',
    description: 'Tabindex value greater than 0',
    pattern: /tabindex=["']([2-9]|\d{2,})["']/gi,
    fix: 'Avoid positive tabindex values (use 0 or -1 only)',
    severity: 'high',
    category: 'keyboard',
    frameworks: ['react', 'angular', 'html']
  },

  // Custom rule for your team's specific patterns
  CUSTOM_MISSING_DATA_TESTID: {
    id: 'custom-missing-data-testid',
    description: 'Interactive element missing data-testid for testing',
    pattern: /<(button|a|input)[^>]*(onClick|onclick|\(click\)|href)=[^>]*>/gi,
    check: (element) => !/data-testid=["'][^"']+["']/gi.test(element),
    fix: 'Add data-testid attribute for reliable testing',
    severity: 'low',
    category: 'custom',
    frameworks: ['react', 'angular', 'html']
  }
};

// ============================
// Scanner Class
// ============================

class AccessibilityScanner {
  constructor(options = {}) {
    this.options = {
      quick: false,
      full: false,
      file: null,
      directory: './src',
      type: 'all',
      severity: 'medium',
      report: false,
      output: './a11y-report.json',
      format: 'json', // json, html, console, vscode
      failOnCritical: false,
      failOnHigh: false,
      fix: false,
      ignore: [],
      ...options
    };

    // Filter rules based on options
    this.activeRules = this.filterRules();
    
    this.results = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      passed: 0
    };
    
    this.stats = {
      filesScanned: 0,
      linesScanned: 0,
      issuesFound: 0,
      startTime: Date.now()
    };
  }

  filterRules() {
    const { severity, type, frameworks } = this.options;
    
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const minSeverity = severityOrder[severity] || 2;
    
    return Object.values(RULES).filter(rule => {
      // Check severity
      if (severityOrder[rule.severity] > minSeverity) return false;
      
      // Check type filter
      if (type !== 'all' && rule.category !== type) return false;
      
      // Check framework compatibility
      if (frameworks && Array.isArray(frameworks)) {
        const hasFramework = frameworks.some(fw => 
          rule.frameworks.includes(fw.toLowerCase())
        );
        if (!hasFramework) return false;
      }
      
      // Check ignore list
      if (this.options.ignore.includes(rule.id)) return false;
      
      return true;
    });
  }

  async scan() {
    console.log(chalk.blue.bold('\n🔍 Starting Accessibility Scan'));
    console.log(chalk.gray(`Rules active: ${this.activeRules.length}`));
    console.log(chalk.gray(`Minimum severity: ${this.options.severity}`));
    console.log(chalk.gray('─'.repeat(60)));

    if (this.options.file) {
      await this.scanFile(this.options.file);
    } else {
      await this.scanDirectory(this.options.directory);
    }

    this.stats.endTime = Date.now();
    this.stats.duration = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2);
    this.stats.issuesFound = Object.values(this.results).reduce((sum, arr) => sum + arr.length, 0);

    await this.generateOutput();
    
    return {
      stats: this.stats,
      results: this.results
    };
  }

  async scanDirectory(dirPath) {
    try {
      const files = await readdir(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const fileStat = await stat(fullPath);
        
        if (fileStat.isDirectory()) {
          // Skip node_modules, build directories, and UI component libraries
          if (!['node_modules', 'dist', 'build', '.git', 'ui'].includes(file)) {
            await this.scanDirectory(fullPath);
          }
        } else if (this.shouldScanFile(fullPath)) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning directory ${dirPath}:`), error.message);
    }
  }

  shouldScanFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.svelte'];
    
    // Check extension
    if (!allowedExtensions.includes(ext)) return false;
    
    // Skip UI component libraries and reusable components
    if (filePath.includes('\\components\\ui\\') || filePath.includes('/components/ui/')) {
      return false;
    }
    
    // Check if file is in ignore list
    const relativePath = path.relative(process.cwd(), filePath);
    if (this.options.ignore.some(pattern => relativePath.includes(pattern))) {
      return false;
    }
    
    return true;
  }

  async scanFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      this.stats.filesScanned++;
      this.stats.linesScanned += content.split('\n').length;

      const issues = [];
      
      for (const rule of this.activeRules) {
        // Check if rule applies to this file type
        const ext = path.extname(filePath).toLowerCase();
        const isReact = ext === '.jsx' || ext === '.tsx' || content.includes('react');
        const isAngular = ext === '.ts' && content.includes('@Component') || content.includes('ng-');
        
        if (rule.frameworks) {
          if (rule.frameworks.includes('react') && !isReact) continue;
          if (rule.frameworks.includes('angular') && !isAngular) continue;
        }

        const ruleIssues = await this.applyRule(content, rule, filePath);
        issues.push(...ruleIssues);
      }

      // Store issues by severity
      issues.forEach(issue => {
        this.results[issue.severity].push(issue);
      });

      if (issues.length === 0) {
        this.results.passed++;
      }

      return issues;
    } catch (error) {
      console.error(chalk.red(`Error scanning file ${filePath}:`), error.message);
      return [];
    }
  }

  async applyRule(content, rule, filePath) {
    const issues = [];
    
    if (rule.patterns) {
      for (const pattern of rule.patterns) {
        const matches = content.match(pattern) || [];
        await this.processMatches(matches, pattern, rule, content, filePath, issues);
      }
    } else if (rule.pattern) {
      const matches = content.match(rule.pattern) || [];
      await this.processMatches(matches, rule.pattern, rule, content, filePath, issues);
    }
    
    return issues;
  }

  async processMatches(matches, pattern, rule, content, filePath, issues) {
    for (const match of matches) {
      let hasIssue = true;
      
      if (rule.check) {
        if (typeof rule.check === 'function') {
          hasIssue = await rule.check(match, content, matches);
        } else {
          hasIssue = rule.check;
        }
      }
      
      if (hasIssue) {
        const issue = {
          id: rule.id,
          rule: rule.description,
          file: filePath,
          line: this.getLineNumber(content, match),
          column: this.getColumnNumber(content, match),
          severity: rule.severity,
          category: rule.category,
          fix: rule.fix,
          snippet: this.truncateSnippet(match),
          code: this.extractCodeContext(content, match, 2), // 2 lines before/after
          framework: rule.frameworks?.[0] || 'general'
        };
        
        issues.push(issue);
      }
    }
  }

  getLineNumber(content, match) {
    const lines = content.split('\n');
    const position = content.indexOf(match);
    let currentPos = 0;
    
    for (let i = 0; i < lines.length; i++) {
      currentPos += lines[i].length + 1; // +1 for newline
      if (currentPos > position) {
        return i + 1;
      }
    }
    
    return 1;
  }

  getColumnNumber(content, match) {
    const position = content.indexOf(match);
    const lineStart = content.lastIndexOf('\n', position) + 1;
    return position - lineStart + 1;
  }

  extractCodeContext(content, match, contextLines = 2) {
    const lines = content.split('\n');
    const lineNum = this.getLineNumber(content, match);
    const startLine = Math.max(1, lineNum - contextLines);
    const endLine = Math.min(lines.length, lineNum + contextLines);
    
    const context = [];
    for (let i = startLine; i <= endLine; i++) {
      context.push(`${i}: ${lines[i-1]}`);
    }
    
    return context.join('\n');
  }

  truncateSnippet(snippet, maxLength = 100) {
    if (snippet.length <= maxLength) return snippet;
    return snippet.substring(0, maxLength) + '...';
  }

  async generateOutput() {
    switch (this.options.format) {
      case 'html':
        await this.generateHtmlReport();
        break;
      case 'json':
        await this.generateJsonReport();
        break;
      case 'vscode':
        await this.generateVSCodeOutput();
        break;
      case 'console':
      default:
        await this.generateConsoleOutput();
    }
  }

  async generateConsoleOutput() {
    const { critical, high, medium, low } = this.results;
    const totalIssues = critical.length + high.length + medium.length + low.length;
    
    console.log(chalk.bold('\n📊 Accessibility Scan Results'));
    console.log(chalk.gray('═'.repeat(60)));
    
    // Print summary
    console.log(chalk.bold('\nSummary:'));
    console.log(`  Files scanned: ${chalk.cyan(this.stats.filesScanned)}`);
    console.log(`  Duration: ${chalk.cyan(this.stats.duration)}s`);
    console.log(`  Files passed: ${chalk.green(this.results.passed)}`);
    console.log(`  Total issues: ${totalIssues > 0 ? chalk.red(totalIssues) : chalk.green(totalIssues)}`);
    console.log(`    Critical: ${critical.length > 0 ? chalk.red.bold(critical.length) : chalk.green('0')}`);
    console.log(`    High: ${high.length > 0 ? chalk.yellow.bold(high.length) : chalk.green('0')}`);
    console.log(`    Medium: ${medium.length > 0 ? chalk.blue.bold(medium.length) : chalk.green('0')}`);
    console.log(`    Low: ${low.length > 0 ? chalk.gray.bold(low.length) : chalk.green('0')}`);
    
    // Print issues by severity
    const printIssues = (issues, severity, color) => {
      if (issues.length > 0) {
        console.log(chalk[color].bold(`\n${severity.toUpperCase()} ISSUES (${issues.length}):`));
        console.log(chalk.gray('─'.repeat(50)));
        
        issues.forEach((issue, index) => {
          const relativePath = path.relative(process.cwd(), issue.file);
          console.log(chalk.bold(`${index + 1}. ${relativePath}:${issue.line}:${issue.column}`));
          console.log(`   ${chalk.white(issue.rule)}`);
          console.log(chalk.gray(`   ${issue.snippet}`));
          if (this.options.full) {
            console.log(chalk.green(`   Fix: ${issue.fix}`));
          }
          console.log();
        });
      }
    };
    
    printIssues(critical, 'critical', 'red');
    printIssues(high, 'high', 'yellow');
    printIssues(medium, 'medium', 'blue');
    printIssues(low, 'low', 'gray');
    
    // Recommendations
    if (totalIssues > 0) {
      console.log(chalk.bold('\n🎯 Quick Wins:'));
      if (critical.length > 0) {
        console.log(chalk.white('  1. Fix critical issues first (missing labels, alt text, etc.)'));
      }
      if (high.length > 0) {
        console.log(chalk.white('  2. Add ARIA labels to interactive elements'));
      }
      if (medium.filter(i => i.category === 'keyboard').length > 0) {
        console.log(chalk.white('  3. Ensure keyboard navigation works properly'));
      }
    } else {
      console.log(chalk.green.bold('\n✅ No accessibility issues found!'));
    }
    
    console.log(chalk.gray('═'.repeat(60)));
    
    // Exit with appropriate code
    if (this.options.failOnCritical && critical.length > 0) {
      console.log(chalk.red.bold('\n❌ Build failed: Critical accessibility issues found'));
      process.exit(1);
    }
    if (this.options.failOnHigh && high.length > 0) {
      console.log(chalk.red.bold('\n❌ Build failed: High priority accessibility issues found'));
      process.exit(1);
    }
  }

  async generateJsonReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.results,
      options: this.options
    };
    
    const outputPath = path.resolve(process.cwd(), this.options.output);
    await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n📄 JSON report saved to: ${outputPath}`));
  }

  async generateHtmlReport() {
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Scan Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
               line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }
        header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
        h1 { color: #2c3e50; margin-bottom: 10px; }
        .timestamp { color: #7f8c8d; font-size: 14px; }
        
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; border-radius: 6px; padding: 20px; text-align: center; }
        .summary-card h3 { font-size: 12px; text-transform: uppercase; color: #6c757d; margin-bottom: 10px; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .summary-card.critical .value { color: #dc3545; }
        .summary-card.high .value { color: #fd7e14; }
        .summary-card.medium .value { color: #007bff; }
        .summary-card.low .value { color: #6c757d; }
        .summary-card.passed .value { color: #28a745; }
        
        .issues-section { margin-bottom: 30px; }
        .severity-header { padding: 10px 15px; border-radius: 4px; margin-bottom: 15px; font-weight: bold; }
        .severity-header.critical { background: #dc3545; color: white; }
        .severity-header.high { background: #fd7e14; color: white; }
        .severity-header.medium { background: #007bff; color: white; }
        .severity-header.low { background: #6c757d; color: white; }
        
        .issue-card { border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 15px; overflow: hidden; }
        .issue-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
        .issue-file { font-family: 'Courier New', monospace; font-size: 14px; color: #495057; }
        .issue-file .line { color: #6c757d; }
        .issue-description { margin: 10px 0; font-weight: 500; }
        .issue-body { padding: 15px; }
        .issue-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; margin: 10px 0; overflow-x: auto; }
        .issue-fix { background: #d4edda; border-left: 4px solid #28a745; padding: 10px 15px; margin: 10px 0; border-radius: 0 4px 4px 0; }
        .issue-fix strong { color: #155724; }
        .issue-meta { display: flex; gap: 15px; font-size: 12px; color: #6c757d; margin-top: 10px; }
        
        .no-issues { text-align: center; padding: 40px; color: #28a745; font-size: 18px; }
        
        footer { margin-top: 40px; text-align: center; color: #6c757d; font-size: 14px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        
        @media (max-width: 768px) {
            .container { padding: 15px; }
            .summary { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 Accessibility Scan Report</h1>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
        </header>
        
        <div class="summary">
            <div class="summary-card critical">
                <h3>Critical Issues</h3>
                <div class="value">${this.results.critical.length}</div>
            </div>
            <div class="summary-card high">
                <h3>High Issues</h3>
                <div class="value">${this.results.high.length}</div>
            </div>
            <div class="summary-card medium">
                <h3>Medium Issues</h3>
                <div class="value">${this.results.medium.length}</div>
            </div>
            <div class="summary-card low">
                <h3>Low Issues</h3>
                <div class="value">${this.results.low.length}</div>
            </div>
            <div class="summary-card passed">
                <h3>Files Passed</h3>
                <div class="value">${this.results.passed}</div>
            </div>
        </div>
        
        ${this.generateHtmlIssuesSection()}
        
        <footer>
            <p>Scanned ${this.stats.filesScanned} files in ${this.stats.duration} seconds</p>
            <p>Generated by Accessibility Scanner</p>
        </footer>
    </div>
    
    <script>
        // Add interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Collapse/expand issue details
            document.querySelectorAll('.issue-header').forEach(header => {
                header.addEventListener('click', function() {
                    const body = this.nextElementSibling;
                    body.style.display = body.style.display === 'none' ? 'block' : 'none';
                });
            });
            
            // Filter by severity
            const filterButtons = document.createElement('div');
            filterButtons.innerHTML = \`
                <div style="margin: 20px 0; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button data-filter="all" class="filter-btn active">All</button>
                    <button data-filter="critical" class="filter-btn">Critical</button>
                    <button data-filter="high" class="filter-btn">High</button>
                    <button data-filter="medium" class="filter-btn">Medium</button>
                    <button data-filter="low" class="filter-btn">Low</button>
                </div>
            \`;
            
            document.querySelector('.container').insertBefore(filterButtons, document.querySelector('.issues-section'));
            
            // Add filter functionality
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.dataset.filter;
                    document.querySelectorAll('.issues-section').forEach(section => {
                        if (filter === 'all' || section.id === filter + '-issues') {
                            section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    });
                });
            });
            
            // Add CSS for filter buttons
            const style = document.createElement('style');
            style.textContent = \`
                .filter-btn { padding: 8px 16px; border: none; border-radius: 4px; background: #e9ecef; color: #495057; cursor: pointer; font-size: 14px; }
                .filter-btn:hover { background: #dee2e6; }
                .filter-btn.active { background: #007bff; color: white; }
            \`;
            document.head.appendChild(style);
        });
    </script>
</body>
</html>`;

    const outputPath = path.resolve(process.cwd(), this.options.output);
    await fs.promises.writeFile(outputPath, template);
    console.log(chalk.green(`\n📄 HTML report saved to: ${outputPath}`));
    
    // Open in browser if requested
    if (this.options.open) {
      const open = (await import('open')).default;
      await open(outputPath);
    }
  }

  generateHtmlIssuesSection() {
    let html = '';
    
    const sections = [
      { severity: 'critical', issues: this.results.critical },
      { severity: 'high', issues: this.results.high },
      { severity: 'medium', issues: this.results.medium },
      { severity: 'low', issues: this.results.low }
    ];
    
    sections.forEach(section => {
      if (section.issues.length > 0) {
        html += `
        <div class="issues-section" id="${section.severity}-issues">
            <div class="severity-header ${section.severity}">
                ${section.severity.toUpperCase()} ISSUES (${section.issues.length})
            </div>`;
        
        section.issues.forEach((issue, index) => {
          const relativePath = path.relative(process.cwd(), issue.file);
          html += `
            <div class="issue-card">
                <div class="issue-header">
                    <div class="issue-file">
                        ${relativePath} <span class="line">(Line ${issue.line}:${issue.column})</span>
                    </div>
                    <div class="issue-description">${issue.rule}</div>
                </div>
                <div class="issue-body">
                    <div class="issue-snippet">${this.escapeHtml(issue.snippet)}</div>
                    <div class="issue-fix">
                        <strong>Fix:</strong> ${issue.fix}
                    </div>
                    <div class="issue-meta">
                        <span>ID: ${issue.id}</span>
                        <span>Category: ${issue.category}</span>
                        <span>Framework: ${issue.framework}</span>
                    </div>
                </div>
            </div>`;
        });
        
        html += `</div>`;
      }
    });
    
    if (html === '') {
      html = `<div class="no-issues">✅ No accessibility issues found!</div>`;
    }
    
    return html;
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async generateVSCodeOutput() {
    // Output in format that VS Code Problems panel can parse
    Object.values(this.results).flat().forEach(issue => {
      const relativePath = path.relative(process.cwd(), issue.file);
      const severityChar = issue.severity === 'critical' ? 'ERROR' : 
                          issue.severity === 'high' ? 'WARNING' : 'INFO';
      
      console.log(`${relativePath}:${issue.line}:${issue.column}: ${severityChar}: ${issue.rule} [${issue.id}]`);
    });
  }

  async autoFixIssues() {
    if (!this.options.fix) return;
    
    console.log(chalk.yellow.bold('\n🔧 Attempting auto-fix...'));
    
    const fixableRules = {
      'html-missing-lang': (content) => content.replace(/<html([^>]*)>/gi, '<html$1 lang="en">'),
      'html-missing-viewport': (content) => {
        if (/<head>[\s\S]*?<\/head>/gi.test(content)) {
          return content.replace(/<head>/gi, '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">');
        }
        return content;
      },
      'button-missing-tabindex': (content) => 
        content.replace(/role=["']button["']([^>]*)>/gi, 'role="button"$1 tabindex="0">'),
      'alt-text-redundant': (content) => 
        content.replace(/alt=["'](image|picture|photo|graphic|icon|img)[^"']*["']/gi, 'alt=""'),
    };
    
    let fixedCount = 0;
    
    for (const severity of ['critical', 'high', 'medium', 'low']) {
      for (const issue of this.results[severity]) {
        if (fixableRules[issue.id]) {
          try {
            const content = await readFile(issue.file, 'utf8');
            const fixedContent = fixableRules[issue.id](content);
            
            if (fixedContent !== content) {
              await fs.promises.writeFile(issue.file, fixedContent, 'utf8');
              console.log(chalk.green(`  Fixed: ${path.relative(process.cwd(), issue.file)} - ${issue.rule}`));
              fixedCount++;
            }
          } catch (error) {
            console.error(chalk.red(`  Error fixing ${issue.file}:`, error.message));
          }
        }
      }
    }
    
    if (fixedCount > 0) {
      console.log(chalk.green(`\n✅ Auto-fixed ${fixedCount} issues`));
    } else {
      console.log(chalk.gray('  No auto-fixable issues found'));
    }
  }
}

// ============================
// Command Line Interface
// ============================

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      case '--version':
      case '-v':
        console.log('Accessibility Scanner v1.0.0');
        process.exit(0);
        break;
      case '--quick':
        options.quick = true;
        options.severity = 'critical';
        break;
      case '--full':
        options.full = true;
        options.severity = 'low';
        break;
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--dir':
      case '-d':
        options.directory = args[++i];
        break;
      case '--type':
      case '-t':
        options.type = args[++i];
        break;
      case '--severity':
      case '-s':
        options.severity = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--report':
        options.report = true;
        options.format = 'html';
        if (!options.output) {
          options.output = './a11y-report.html';
        }
        break;
      case '--json':
        options.format = 'json';
        break;
      case '--vscode':
        options.format = 'vscode';
        break;
      case '--fail-on-critical':
        options.failOnCritical = true;
        break;
      case '--fail-on-high':
        options.failOnHigh = true;
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--ignore':
        options.ignore = args[++i].split(',');
        break;
      case '--open':
        options.open = true;
        break;
      case '--frameworks':
        options.frameworks = args[++i].split(',');
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(chalk.red(`Unknown option: ${arg}`));
          showHelp();
          process.exit(1);
        }
    }
  }
  
  return options;
}

function showHelp() {
  console.log(chalk.bold('\n🔍 Accessibility Scanner'));
  console.log(chalk.gray('Scan your code for accessibility issues\n'));
  
  console.log(chalk.bold('Usage:'));
  console.log('  node a11y-scanner.js [options]\n');
  
  console.log(chalk.bold('Options:'));
  console.log('  -h, --help                   Show this help message');
  console.log('  -v, --version                Show version');
  console.log('      --quick                  Quick scan (critical issues only)');
  console.log('      --full                   Full scan (all issues)');
  console.log('  -f, --file <path>           Scan specific file');
  console.log('  -d, --dir <path>            Scan directory (default: ./src)');
  console.log('  -t, --type <type>           Filter by issue type (html, forms, aria, etc.)');
  console.log('  -s, --severity <level>      Minimum severity (critical, high, medium, low)');
  console.log('      --format <format>       Output format (console, json, html, vscode)');
  console.log('  -o, --output <path>         Output file path');
  console.log('      --report                Generate HTML report');
  console.log('      --json                  Output as JSON');
  console.log('      --vscode                Output for VS Code Problems panel');
  console.log('      --fail-on-critical      Exit with error if critical issues found');
  console.log('      --fail-on-high          Exit with error if high issues found');
  console.log('      --fix                   Attempt to auto-fix issues');
  console.log('      --ignore <patterns>     Comma-separated patterns to ignore');
  console.log('      --open                  Open HTML report in browser');
  console.log('      --frameworks <list>     Comma-separated frameworks (react, angular)');
  console.log('\nExamples:');
  console.log('  node a11y-scanner.js --quick');
  console.log('  node a11y-scanner.js --file ./src/App.js --severity high');
  console.log('  node a11y-scanner.js --dir ./src --report --open');
  console.log('  node a11y-scanner.js --full --fail-on-critical --fail-on-high');
  console.log('  node a11y-scanner.js --frameworks react,angular --format json');
}

// ============================
// Main Execution
// ============================

async function main() {
  try {
    const options = parseArguments();
    const scanner = new AccessibilityScanner(options);
    
    const results = await scanner.scan();
    
    if (options.fix) {
      await scanner.autoFixIssues();
    }
    
    return results;
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Error:'), error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
main();

export { AccessibilityScanner, main };