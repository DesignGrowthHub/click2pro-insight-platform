import "server-only";

import type { PdfRenderableReport } from "@/lib/pdf/report-pdf";

type FontKey = "F1" | "F2";

type LayoutLine = {
  text: string;
  font: FontKey;
  size: number;
  leading: number;
};

type PdfPage = {
  lines: LayoutLine[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT_MARGIN = 64;
const RIGHT_MARGIN = 64;
const TOP_MARGIN = 72;
const BOTTOM_MARGIN = 64;

function normalizePdfText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function escapePdfText(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, maxCharacters: number) {
  const normalized = normalizePdfText(text).trim();

  if (!normalized) {
    return [];
  }

  const paragraphs = normalized.split(/\n+/);
  const wrapped: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      wrapped.push("");
      continue;
    }

    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;

      if (candidate.length <= maxCharacters) {
        current = candidate;
        continue;
      }

      if (current) {
        wrapped.push(current);
      }

      if (word.length <= maxCharacters) {
        current = word;
        continue;
      }

      let remaining = word;

      while (remaining.length > maxCharacters) {
        wrapped.push(remaining.slice(0, maxCharacters - 1) + "-");
        remaining = remaining.slice(maxCharacters - 1);
      }

      current = remaining;
    }

    if (current) {
      wrapped.push(current);
    }
  }

  return wrapped;
}

function charactersPerLine(fontSize: number) {
  const usableWidth = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  return Math.max(28, Math.floor(usableWidth / (fontSize * 0.52)));
}

function buildLayout(renderable: PdfRenderableReport) {
  const lines: LayoutLine[] = [];

  const pushWrapped = (text: string, font: FontKey, size: number, leading: number) => {
    for (const line of wrapText(text, charactersPerLine(size))) {
      lines.push({
        text: line,
        font,
        size,
        leading
      });
    }
  };

  pushWrapped(renderable.title, "F2", 22, 30);

  if (renderable.subtitle) {
    pushWrapped(renderable.subtitle, "F1", 12, 18);
  }

  if (renderable.generatedAt) {
    pushWrapped(`Prepared ${renderable.generatedAt}`, "F1", 10, 14);
  }

  if (renderable.preparedFor) {
    pushWrapped(`Prepared for: ${renderable.preparedFor}`, "F1", 10, 14);
  }

  if (renderable.primaryConcern) {
    pushWrapped(`Primary concern: ${renderable.primaryConcern}`, "F1", 10, 14);
  }

  if (renderable.profileContext) {
    pushWrapped(renderable.profileContext, "F1", 10, 14);
  }

  lines.push({ text: "", font: "F1", size: 12, leading: 14 });
  pushWrapped("Section Map", "F2", 14, 22);

  for (const bookmark of renderable.bookmarkTitles) {
    pushWrapped(`- ${bookmark}`, "F1", 10, 14);
  }

  for (const section of renderable.sections) {
    lines.push({ text: "", font: "F1", size: 12, leading: 18 });
    pushWrapped(section.title, "F2", 16, 24);

    for (const paragraph of section.body) {
      pushWrapped(paragraph, "F1", 11, 16);
      lines.push({ text: "", font: "F1", size: 11, leading: 10 });
    }
  }

  lines.push({ text: "", font: "F1", size: 12, leading: 16 });
  pushWrapped(renderable.footerNote, "F1", 10, 14);

  return lines;
}

function paginate(lines: LayoutLine[]) {
  const pages: PdfPage[] = [];
  let currentPage: PdfPage = { lines: [] };
  let availableHeight = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

  for (const line of lines) {
    const lineHeight = line.text ? line.leading : Math.max(8, Math.floor(line.leading * 0.7));

    if (availableHeight - lineHeight < 0 && currentPage.lines.length > 0) {
      pages.push(currentPage);
      currentPage = { lines: [] };
      availableHeight = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;
    }

    currentPage.lines.push(line);
    availableHeight -= lineHeight;
  }

  if (currentPage.lines.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function buildContentStream(page: PdfPage) {
  const operations: string[] = [];
  let y = PAGE_HEIGHT - TOP_MARGIN;

  for (const line of page.lines) {
    const lineHeight = line.text ? line.leading : Math.max(8, Math.floor(line.leading * 0.7));

    if (line.text) {
      operations.push("BT");
      operations.push(`/${line.font} ${line.size} Tf`);
      operations.push(`${LEFT_MARGIN} ${y} Td`);
      operations.push(`(${escapePdfText(line.text)}) Tj`);
      operations.push("ET");
    }

    y -= lineHeight;
  }

  return operations.join("\n");
}

function buildPdfDocument(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  const pushObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = pushObject("");
  const pagesId = pushObject("");
  const fontRegularId = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  for (const stream of pageStreams) {
    const contentId = pushObject(
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`
    );
    const pageId = pushObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageObjectIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] >>`;

  let document = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((objectBody, index) => {
    offsets.push(Buffer.byteLength(document, "utf8"));
    document += `${index + 1} 0 obj\n${objectBody}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(document, "utf8");
  document += `xref\n0 ${objects.length + 1}\n`;
  document += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    document += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  document += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(document, "utf8");
}

export function generateReportPdfBuffer(renderable: PdfRenderableReport) {
  const layout = buildLayout(renderable);
  const pages = paginate(layout);
  const pageStreams = pages.map(buildContentStream);

  return buildPdfDocument(pageStreams);
}
