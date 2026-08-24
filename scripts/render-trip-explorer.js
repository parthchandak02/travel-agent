#!/usr/bin/env node
/**
 * Render trip-explorer.json → self-contained index.html
 * Usage: node render-trip-explorer.js <input.json> [output.html]
 */
const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = process.argv[3] || 'index.html';

if (!input) {
  console.error('Usage: node render-trip-explorer.js <trip-explorer.json> [output.html]');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const templatePath = path.join(__dirname, '..', 'assets', 'trip-explorer-template.html');
let html = fs.readFileSync(templatePath, 'utf8');
html = html.replace('__TRIP_DATA__', JSON.stringify(data).replace(/</g, '\\u003c'));
fs.writeFileSync(output, html);
console.log(`Wrote ${output} (${(html.length / 1024).toFixed(0)} KB)`);
