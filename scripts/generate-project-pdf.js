import fs from 'fs';
import path from 'path';

const sourcePath = path.resolve('docs/Military-Asset-Management-System-Overview.md');
const outputPath = path.resolve('docs/Military-Asset-Management-System-Overview.pdf');

const markdown = fs.readFileSync(sourcePath, 'utf8');
const rawLines = markdown
  .replace(/```text[\s\S]*?```/g, (block) => block.replace(/```text\n?/, '').replace(/\n?```/, ''))
  .replace(/^### /gm, '')
  .replace(/^#### /gm, '')
  .replace(/^## /gm, '')
  .replace(/^# /gm, '')
  .replace(/^- /gm, '* ')
  .split('\n');

const escapePdfText = (value) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapLine = (text, maxLength = 94) => {
  if (!text.trim()) {
    return [''];
  }

  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > maxLength) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const textLines = rawLines.flatMap((line) => wrapLine(line));
const pageHeight = 792;
const pageWidth = 612;
const topMargin = 740;
const lineHeight = 16;
const bottomMargin = 60;
const maxLinesPerPage = Math.floor((topMargin - bottomMargin) / lineHeight);
const pages = [];

for (let index = 0; index < textLines.length; index += maxLinesPerPage) {
  pages.push(textLines.slice(index, index + maxLinesPerPage));
}

const objects = [];

const addObject = (content) => {
  objects.push(content);
  return objects.length;
};

const fontObjectId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const pageObjectIds = [];

pages.forEach((pageLines) => {
  const commands = ['BT', '/F1 11 Tf', `1 0 0 1 50 ${topMargin} Tm`, '16 TL'];

  pageLines.forEach((line, lineIndex) => {
    if (lineIndex === 0) {
      commands.push(`(${escapePdfText(line)}) Tj`);
    } else {
      commands.push('T*');
      commands.push(`(${escapePdfText(line)}) Tj`);
    }
  });

  commands.push('ET');
  const stream = commands.join('\n');
  const contentObjectId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
  const pageObjectId = addObject(
    `<< /Type /Page /Parent PAGES_PLACEHOLDER 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectId} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`
  );
  pageObjectIds.push(pageObjectId);
});

const kidsReference = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
const pagesObjectId = addObject(`<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${kidsReference}] >>`);
const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

pageObjectIds.forEach((pageObjectId) => {
  objects[pageObjectId - 1] = objects[pageObjectId - 1].replace('PAGES_PLACEHOLDER', String(pagesObjectId));
});

let pdf = '%PDF-1.4\n';
const offsets = [0];

objects.forEach((objectContent, index) => {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${index + 1} 0 obj\n${objectContent}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';

for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

fs.writeFileSync(outputPath, pdf, 'binary');
console.log(`PDF generated at ${outputPath}`);
