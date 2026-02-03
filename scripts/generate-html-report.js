#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateHTMLReport() {
  const reportPath = path.join(process.cwd(), 'a11y-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('Error: a11y-report.json not found. Run scan first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const severityColors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#eab308',
    low: '#3b82f6'
  };

  const severityIcons = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  };

  let issueRows = '';
  
  for (const [severity, issues] of Object.entries(report.results)) {
    if (!Array.isArray(issues) || issues.length === 0) continue;
    
    for (const issue of issues) {
      issueRows += `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: center; font-weight: bold; color: ${severityColors[severity]};">
        ${severityIcons[severity]} ${severity.toUpperCase()}
      </td>
      <td style="padding: 12px;">
        <strong>${issue.rule}</strong><br/>
        <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${issue.id}</code>
      </td>
      <td style="padding: 12px;">
        ${issue.file}<br/>
        <span style="color: #666; font-size: 12px;">Line ${issue.line}, Col ${issue.column}</span>
      </td>
      <td style="padding: 12px; font-size: 12px;">
        <pre style="background: #f9fafb; padding: 8px; border-radius: 4px; overflow-x: auto; max-width: 400px;">${issue.code || issue.snippet}</pre>
      </td>
      <td style="padding: 12px;">
        <span style="background: #f0f9ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${issue.fix}</span>
      </td>
    </tr>`;
    }
  }

  const stats = report.stats;
  const totalIssues = Object.values(report.results).reduce((sum, issues) => sum + (Array.isArray(issues) ? issues.length : 0), 0);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #667eea;
    }
    
    .stat-card.critical {
      border-left-color: #dc2626;
    }
    
    .stat-card.high {
      border-left-color: #ea580c;
    }
    
    .stat-card.medium {
      border-left-color: #eab308;
    }
    
    .stat-card.low {
      border-left-color: #3b82f6;
    }
    
    .stat-number {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
    }
    
    .stat-card.critical .stat-number { color: #dc2626; }
    .stat-card.high .stat-number { color: #ea580c; }
    .stat-card.medium .stat-number { color: #eab308; }
    .stat-card.low .stat-number { color: #3b82f6; }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .content {
      padding: 40px;
    }
    
    .issues-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .issues-table th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .issues-table tr:hover {
      background: #f9fafb;
    }
    
    .footer {
      background: #f3f4f6;
      padding: 20px 40px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    .no-issues {
      text-align: center;
      padding: 60px 20px;
      color: #4b5563;
    }
    
    .no-issues-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>♿ Accessibility Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${stats.filesScanned}</div>
        <div class="stat-label">Files Scanned</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.linesScanned || '—'}</div>
        <div class="stat-label">Lines Analyzed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalIssues}</div>
        <div class="stat-label">Issues Found</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${parseFloat(stats.duration || 0).toFixed(2)}s</div>
        <div class="stat-label">Scan Duration</div>
      </div>
      ${report.results.critical?.length > 0 ? `
      <div class="stat-card critical">
        <div class="stat-number">${report.results.critical.length}</div>
        <div class="stat-label">Critical Issues</div>
      </div>` : ''}
      ${report.results.high?.length > 0 ? `
      <div class="stat-card high">
        <div class="stat-number">${report.results.high.length}</div>
        <div class="stat-label">High Issues</div>
      </div>` : ''}
      ${report.results.medium?.length > 0 ? `
      <div class="stat-card medium">
        <div class="stat-number">${report.results.medium.length}</div>
        <div class="stat-label">Medium Issues</div>
      </div>` : ''}
      ${report.results.low?.length > 0 ? `
      <div class="stat-card low">
        <div class="stat-number">${report.results.low.length}</div>
        <div class="stat-label">Low Issues</div>
      </div>` : ''}
    </div>
    
    <div class="content">
      ${totalIssues === 0 ? `
      <div class="no-issues">
        <div class="no-issues-icon">✅</div>
        <h2>Excellent!</h2>
        <p>No accessibility issues found in your code.</p>
      </div>` : `
      <h2 style="margin-bottom: 20px; color: #1f2937;">Issues Found (${totalIssues})</h2>
      <table class="issues-table">
        <thead>
          <tr>
            <th style="width: 100px;">Severity</th>
            <th style="width: 250px;">Issue</th>
            <th style="width: 300px;">Location</th>
            <th style="width: 350px;">Code</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody>
          ${issueRows}
        </tbody>
      </table>`}
    </div>
    
    <div class="footer">
      <p>🔍 Accessibility scan completed</p>
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(process.cwd(), 'a11y-report.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✅ HTML report generated: ${outputPath}`);
  
  // Open the report in the default browser
  if (process.argv.includes('--open')) {
    const { exec } = await import('child_process');
    const opener = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${opener} "${outputPath}"`, (err) => {
      if (err) console.log(`📂 Open manually: ${outputPath}`);
    });
  }
}

generateHTMLReport().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
