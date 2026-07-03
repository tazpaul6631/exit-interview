import interviewView from '@/api/interviewView';
import format from '@/mixins/format';
import logoAssetUrl from '@/assets/logocompany.png';
import type {
  InterviewAnswer,
  InterviewDetail,
  InterviewSection,
} from '@/utils/interviewDetailExtract';
import {
  findSectionBySectionId,
  getSectionsByParentId,
  normalizeInterviewDetail,
} from '@/utils/interviewDetailExtract';

const DOCUMENT_CSS = `
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
    color: #000;
    margin: 0;
    padding: 28px 36px;
    line-height: 1.55;
    background: #fff;
  }
  .doc-page {
    width: 100%;
    box-sizing: border-box;
  }
  .doc-page + .doc-page {
    page-break-before: always;
    break-before: page;
    margin-top: 0;
  }
  table.layout-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
  }
  table.layout-table td {
    border: none;
    padding: 0;
    vertical-align: top;
  }
  .doc-header__logo {
    height: 46px;
    width: auto;
  }
  .doc-header__date {
    font-size: 13pt;
    text-align: right;
    padding-top: 8px;
  }
  .doc-title {
    text-align: center;
    margin: 18px 0 22px;
  }
  .doc-title h1 {
    font-size: 16pt;
    font-weight: bold;
    margin: 0 0 4px;
    text-transform: uppercase;
  }
  .doc-title h2 {
    font-size: 14pt;
    font-weight: bold;
    margin: 0;
  }
  table.info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
  }
  table.info-table td.info-col-left {
    border: none;
    width: 45%;
    padding: 0 12px 0 0;
    vertical-align: top;
  }
  table.info-table td.info-col-right {
    border: none;
    width: 55%;
    padding: 0 0 0 12px;
    vertical-align: top;
  }
  table.info-table td.info-col-right:last-child {
    padding: 0 0 0 12px;
  }
  .info-line {
    display: flex;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .info-line:last-child {
    margin-bottom: 0;
  }
  .field-label {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .field-value {
    flex: 1;
    border-bottom: 1px dotted #000;
    min-width: 0;
    margin-left: 4px;
    padding: 0 4px 2px;
  }
  .section-title {
    font-weight: bold;
    margin: 16px 0 8px;
    font-size: 13pt;
  }
  .section-note { margin: 0 0 10px; font-weight: bold; }
  .form-item { margin: 0 0 10px; text-align: justify; }
  .check-box {
    display: inline-block;
    width: 16px;
    margin-right: 4px;
  }
  table.rating-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
  }
  table.rating-table td {
    border: none;
    padding: 4px 0;
    vertical-align: bottom;
  }
  .rating-label { padding-right: 12px; }
  .rating-score { text-align: right; white-space: nowrap; width: 140px; }
  .dots {
    border-bottom: 1px dotted #000;
    display: inline-block;
    min-width: 48px;
    text-align: center;
    padding: 0 4px;
  }
  .question-block { margin-bottom: 14px; }
  .question-title { font-weight: bold; margin-bottom: 4px; }
  .question-text { margin: 0 0 6px; }
  .answer-label { margin-right: 6px; }
  .text-answer {
    border-bottom: 1px dotted #000;
    min-height: 22px;
    padding: 2px 0 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .choice-line { margin: 4px 0; }
  .choice-reason {
    margin: 2px 0 8px 1.75em;
    line-height: 1.45;
  }
`;

let cachedLogoDataUrl: string | null = null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFilename(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'phong-van';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function getFilename(detail: InterviewDetail, ext: string) {
  const code = detail.employeeCode?.trim() || String(detail.id);
  const name = detail.employeeName?.trim() || 'phong-van';
  return `${sanitizeFilename(code)}-${sanitizeFilename(name)}.${ext}`;
}

async function fetchInterviewDetail(id: number): Promise<InterviewDetail> {
  const response = await interviewView.getInterviewView(id);
  const data = response?.data?.data as InterviewDetail | undefined;
  if (!data) throw new Error('Không tìm thấy dữ liệu phỏng vấn.');
  return normalizeInterviewDetail(data);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function resolveAssetUrl(path: string): string {
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return new URL(path, window.location.origin).href;
}

async function ensureLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl?.startsWith('data:')) return cachedLogoDataUrl;

  const candidates = [
    `${import.meta.env.BASE_URL}assets/logocompany.png`.replace(/\/{2,}/g, '/'),
    logoAssetUrl,
  ];

  for (const candidate of candidates) {
    if (candidate.startsWith('data:')) {
      cachedLogoDataUrl = candidate;
      return candidate;
    }

    try {
      const response = await fetch(resolveAssetUrl(candidate));
      if (!response.ok) continue;
      cachedLogoDataUrl = await blobToDataUrl(await response.blob());
      return cachedLogoDataUrl;
    } catch {
      // thử nguồn tiếp theo
    }
  }

  throw new Error('Không tải được logo công ty.');
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

function formatHeaderDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Ngày ..... tháng ..... năm .....';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Ngày ..... tháng ..... năm .....';
  return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}

function renderInfoFieldLine(label: string, value: string): string {
  return `
    <div class="info-line">
      <span class="field-label">${escapeHtml(label)}</span>
      <span class="field-value">${escapeHtml(value || '')}</span>
    </div>
  `;
}

function renderInfoBlock(detail: InterviewDetail): string {
  return `
    <table class="info-table">
      <tr>
        <td class="info-col-left">
          ${renderInfoFieldLine('Tôi tên/ 姓名: ', detail.employeeName || '')}
          ${renderInfoFieldLine('Mã Số/ 工號: ', detail.employeeCode || '')}
          ${renderInfoFieldLine('Chức vụ/ 任職: ', detail.jobPositionName || '')}
        </td>
        <td class="info-col-right">
          ${renderInfoFieldLine('Bộ phận/ 部門: ', detail.organizationName || '')}
          ${renderInfoFieldLine('Ngày thôi việc/ 離職日期: ', format.formatDate(detail.exitedAt) || '')}
        </td>
      </tr>
    </table>
  `;
}

function renderCheckbox(checked: boolean): string {
  return `<span class="check-box">${checked ? '☑' : '☐'}</span>`;
}

function renderRatingScore(score: string): string {
  const value = score ? escapeHtml(score) : '......';
  return `<span class="rating-score"><span class="dots">${value}</span> Điểm/分</span>`;
}

function renderLogoHtml(logoSrc: string): string {
  return `
    <img
      src="${logoSrc}"
      alt="JIA HSIN"
      class="doc-header__logo"
      width="160"
      height="46"
    />
  `;
}

function renderDocumentHeader(logoSrc: string, headerDate: string): string {
  return `
    <table class="layout-table doc-header">
      <tr>
        <td style="width:55%">${renderLogoHtml(logoSrc)}</td>
        <td style="width:45%">
          <div class="doc-header__date">${escapeHtml(headerDate)}</div>
        </td>
      </tr>
    </table>

    <div class="doc-title">
      <h1>BIÊN BẢN PHỎNG VẤN NGHỈ VIỆC</h1>
      <h2>員工離職面談記錄表</h2>
    </div>
  `;
}

function getFirstChildSection(
  sections: InterviewSection[],
  parentSectionId: number,
): InterviewSection | null {
  return getSectionsByParentId(sections, parentSectionId)[0] ?? null;
}

function sortAnswersByPriority(answers: InterviewAnswer[] = []): InterviewAnswer[] {
  return [...answers].sort((a, b) =>
    (a.answerPriority ?? a.answerId ?? 0) - (b.answerPriority ?? b.answerId ?? 0),
  );
}

function isDisagreeExportChoice(label: string): boolean {
  const text = label.toLowerCase();
  return /không\s*đồng\s*ý/.test(text) || /不同意/.test(label);
}

function isAgreeExportChoice(label: string): boolean {
  if (isDisagreeExportChoice(label)) return false;
  const text = label.toLowerCase();
  return /đồng\s*ý/.test(text) || /同意/.test(label);
}

/** Export: Đồng ý trên, Không đồng ý dưới. */
function sortExportChoices<T extends { label: string }>(choices: T[]): T[] {
  const order = (label: string) => {
    if (isAgreeExportChoice(label)) return 0;
    if (isDisagreeExportChoice(label)) return 1;
    return 2;
  };

  return [...choices].sort((a, b) => order(a.label) - order(b.label));
}

function collectPart1Items(sections: InterviewSection[]) {
  const child = getFirstChildSection(sections, 1);
  return sortAnswersByPriority(child?.answers ?? []).map((answer) => ({
    label: answer.answerName,
    checked: !!answer.checkValue,
  }));
}

function collectPart2Items(sections: InterviewSection[]) {
  const child = getFirstChildSection(sections, 2);
  return sortAnswersByPriority(child?.answers ?? [])
    .filter((answer) => answer.allowRating)
    .map((answer) => ({
      label: answer.answerName,
      score: answer.ratingValue != null ? String(answer.ratingValue) : '',
    }));
}

function findReasonText(answers: InterviewAnswer[]): string {
  const reason = answers.find(
    (answer) => answer.allowText && answer.textValue?.trim() && answer.answerParentId,
  );
  return reason?.textValue?.trim() ?? '';
}

function collectPart3Items(sections: InterviewSection[]) {
  return getSectionsByParentId(sections, 3).map((child) => {
    const question = child.questions?.[0];
    const answers = sortAnswersByPriority(question?.answers ?? []);
    const textAnswer = answers.find(
      (answer) => answer.allowText && !answer.answerParentId,
    );
    const choices = answers.filter(
      (answer) => (answer.allowSelect || answer.allowCheck) && !answer.allowText,
    );

    return {
      sectionName: child.sectionName,
      question: question?.questionName ?? '',
      textAnswer: textAnswer?.textValue?.trim() ?? '',
      choices: sortExportChoices(
        choices.map((answer) => ({
          label: answer.answerName,
          checked: !!(answer.checkValue || answer.selectValue),
        })),
      ),
      reasonText: findReasonText(answers),
    };
  });
}

function renderPart1(sections: InterviewSection[]): string {
  const items = collectPart1Items(sections);
  const part1 = findSectionBySectionId(sections, 1);
  const part1Child = getFirstChildSection(sections, 1);

  const rows = items.length
    ? items
      .map(
        (item) =>
          `<p class="form-item">${renderCheckbox(item.checked)} ${escapeHtml(item.label)}</p>`,
      )
      .join('')
    : `
      <p class="form-item">${renderCheckbox(false)} (1) Lương thưởng &amp; Phúc lợi/薪資福利: Lương thấp, ít tăng ca, thưởng không minh bạch.</p>
      <p class="form-item">${renderCheckbox(false)} (2) Vấn đề quản lý/管理問題: Tổ trưởng thái độ gắt gỏng, quản lý không công bằng, sắp xếp công việc không hợp lý.</p>
      <p class="form-item">${renderCheckbox(false)} (3) Môi trường làm việc/工作環境: Xưởng quá nóng/ồn, công việc quá nặng nhọc, vấn đề về bạo lực giới, quấy rối tình dục.</p>
      <p class="form-item">${renderCheckbox(false)} (4) Chế độ đãi ngộ/福利伙食: Cơm ca không ngon, ký túc xá kém, khó xin nghỉ phép.</p>
      <p class="form-item">${renderCheckbox(false)} (5) Lý do cá nhân/個人因素: Việc gia đình, sức khỏe, nhà xa, về quê, đi học nâng cao trình độ, tự do kinh doanh.</p>
    `;

  return `
    <div class="section-title">${escapeHtml(part1?.sectionName ?? 'PHẦN 1: LÝ DO CHÍNH NGHỈ VIỆC/第一部分：離職主因')}</div>
    <p class="section-note">${escapeHtml(part1Child?.sectionName?.trim() || 'Vui lòng chọn 1 lý do chính/請選勾最主要的 一項:')}</p>
    ${rows}
  `;
}

function renderPart2(sections: InterviewSection[]): string {
  const items = collectPart2Items(sections);
  const part2 = findSectionBySectionId(sections, 2);
  const part2Child = getFirstChildSection(sections, 2);

  const rows = items.length
    ? items
      .map(
        (item) => `
            <tr>
              <td class="rating-label">${escapeHtml(item.label)}</td>
              <td>${renderRatingScore(item.score)}</td>
            </tr>
          `,
      )
      .join('')
    : `
      <tr><td class="rating-label">(1) Cách quản lý của cấp trên trực tiếp / 現場主管的管理方式:</td><td>${renderRatingScore('')}</td></tr>
      <tr><td class="rating-label">(2) Sự công bằng trong phân công công việc / 工作分配的公平性:</td><td>${renderRatingScore('')}</td></tr>
      <tr><td class="rating-label">(3) Tình trạng an toàn và thiết bị tại xưởng / 現場安全與設備狀況:</td><td>${renderRatingScore('')}</td></tr>
      <tr><td class="rating-label">(4) Mức độ hài lòng chung đối với công ty / 對公司的整體滿意度:</td><td>${renderRatingScore('')}</td></tr>
    `;

  return `
    <div class="section-title">${escapeHtml(part2?.sectionName ?? 'PHẦN 2: ĐÁNH GIÁ THỰC TẾ (1-5 ĐIỂM)/第二部分：現場評價 (1-5分)')}</div>
    <p class="section-note">${escapeHtml(part2Child?.sectionName?.trim() || '5 điểm là rất hài lòng / 5分為最滿意:')}</p>
    <table class="rating-table">${rows}</table>
  `;
}

function renderPart3ItemsHtml(
  items: ReturnType<typeof collectPart3Items>,
  includeTitle: boolean,
  sections: InterviewSection[],
): string {
  if (!items.length) {
    return includeTitle
      ? `
      <div class="section-title">PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/第三部分：核心問答</div>
      <div class="question-block">
        <div class="question-title">(1) So sánh với công việc mới/競爭力對比:</div>
        <p class="question-text">Điểm nào của công việc mới tốt hơn công ty mình?/新工作的哪一點比我們公司好？</p>
        <div><span class="answer-label">Trả lời/答:</span></div>
        <div class="text-answer">&nbsp;</div>
      </div>
    `
      : '';
  }

  const titleHtml = includeTitle
    ? `<div class="section-title">${escapeHtml(findSectionBySectionId(sections, 3)?.sectionName ?? 'PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/第三部分：核心問答')}</div>`
    : '';

  const questionsHtml = items
    .map((item) => {
      const hasChoices = item.choices.length > 0;

      const choicesHtml = hasChoices
        ? item.choices
          .map((choice) => {
            const reasonBlock =
              choice.checked && isDisagreeExportChoice(choice.label)
                ? `<div class="choice-reason"><span class="answer-label">Lý do/原因:</span> <span class="dots">${escapeHtml(item.reasonText || '................................')}</span></div>`
                : '';
            return `<div class="choice-line">${renderCheckbox(choice.checked)} ${escapeHtml(choice.label)}</div>${reasonBlock}`;
          })
          .join('')
        : '';

      const textBlock = hasChoices
        ? choicesHtml
        : `
            <div><span class="answer-label">Trả lời/答:</span></div>
            <div class="text-answer">${escapeHtml(item.textAnswer || ' ')}</div>
          `;

      return `
        <div class="question-block">
          <div class="question-title">${escapeHtml(item.sectionName)}</div>
          ${item.question ? `<p class="question-text">${escapeHtml(item.question)}</p>` : ''}
          ${textBlock}
        </div>
      `;
    })
    .join('');

  return `${titleHtml}${questionsHtml}`;
}

/** Trang 1: header + phần 1–2 + câu 1–2 phần 3. Trang 2: câu 3 phần 3. */
function buildDocumentBody(detail: InterviewDetail, logoSrc: string): string {
  const sections = detail.sections ?? [];
  const headerDate = formatHeaderDate(detail.createdAt ?? detail.exitedAt);
  const header = renderDocumentHeader(logoSrc, headerDate);
  const part3Items = collectPart3Items(sections);
  const part3Page1 = renderPart3ItemsHtml(part3Items.slice(0, 2), true, sections);
  const part3Page2 = renderPart3ItemsHtml(part3Items.slice(2), false, sections);

  const page1 = `
    <div class="doc-page doc-page--1">
      ${header}
      ${renderInfoBlock(detail)}
      ${renderPart1(sections)}
      ${renderPart2(sections)}
      ${part3Page1}
    </div>
  `;

  if (!part3Page2.trim()) {
    return page1;
  }

  return `
    ${page1}
    <div class="doc-page doc-page--2">
      ${part3Page2}
    </div>
  `;
}

async function createPrintContainer(detail: InterviewDetail): Promise<HTMLElement> {
  const logoDataUrl = await ensureLogoDataUrl();
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;background:#fff;font-family:"Times New Roman",Times,serif;';
  container.innerHTML = `<style>${DOCUMENT_CSS}</style>${buildDocumentBody(detail, logoDataUrl)}`;
  document.body.appendChild(container);
  await waitForImages(container);
  return container;
}

/** Cùng pipeline render với PDF — chụp từng .doc-page thành PNG base64 */
async function capturePages(
  container: HTMLElement,
): Promise<Array<{ dataUrl: string; width: number; height: number }>> {
  const { default: html2canvas } = await import('html2canvas');
  const pages = Array.from(container.querySelectorAll<HTMLElement>('.doc-page'));
  const results: Array<{ dataUrl: string; width: number; height: number }> = [];

  for (const pageEl of pages) {
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    results.push({
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    });
  }

  return results;
}

/** Khớp file mẫu BB p.vấn thôi việc 離職面談記錄 2026.04.16.docx */
const DOC_FONT = 'Times New Roman';
const DOC_FONT_EAST_ASIA = 'Microsoft JhengHei';
const DOC_SIZE_BODY = 24; // 12pt
const DOC_SIZE_TITLE = 36; // 18pt
const DOC_SIZE_SUBTITLE = 32; // 16pt
const DOC_SIZE_SMALL = 20; // 10pt — dòng phụ tiếng Trung
/** line = 276 → ~1.15 line spacing trong mẫu */
const DOC_LINE_HEIGHT = 276;

const DOC_PAGE = {
  width: 12240, // Letter 8.5"
  height: 15840, // Letter 11"
  marginTop: 900,
  marginRight: 1080,
  marginBottom: 810,
  marginLeft: 1080,
} as const;

const DOC_LOGO = { width: 137, height: 30 } as const;

const DOC_SP = {
  none: 0,
} as const;

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function saveInterviewAsDocx(
  detail: InterviewDetail,
  logoDataUrl: string,
  filename: string,
) {
  const {
    AlignmentType,
    Document,
    ImageRun,
    LineRuleType,
    Packer,
    Paragraph,
    Table,
    TableBorders,
    TableCell,
    TableRow,
    TextRun,
    UnderlineType,
    WidthType,
  } = await import('docx');

  const sections = detail.sections ?? [];
  const headerDate = formatHeaderDate(detail.createdAt ?? detail.exitedAt);

  const defaultSpacing = {
    line: DOC_LINE_HEIGHT,
    lineRule: LineRuleType.AUTO,
    after: DOC_SP.none,
  };

  const fontProps = {
    ascii: DOC_FONT,
    eastAsia: DOC_FONT_EAST_ASIA,
    hAnsi: DOC_FONT,
    cs: DOC_FONT,
  };

  const run = (text: string, options: Record<string, unknown> = {}) =>
    new TextRun({
      text,
      font: fontProps,
      size: DOC_SIZE_BODY,
      ...options,
    });

  const boldRun = (text: string, size = DOC_SIZE_BODY) =>
    new TextRun({
      text,
      font: fontProps,
      size,
      bold: true,
      boldComplexScript: true,
    });

  const sectionNameParagraph = (sectionName: string) => paragraph([boldRun(sectionName)]);

  const smallRun = (text: string) => run(text, { size: DOC_SIZE_SMALL });

  const checkboxRun = (checked: boolean) => run(checked ? '☑ ' : '☐ ');

  const paragraph = (
    children: InstanceType<typeof TextRun>[],
    options: Record<string, unknown> = {},
  ) => {
    const { spacing: spacingOverride, ...rest } = options as {
      spacing?: Record<string, unknown>;
    };
    return new Paragraph({
      spacing: { ...defaultSpacing, ...spacingOverride },
      ...rest,
      children,
    });
  };

  const blankLine = () => paragraph([run('')]);

  const tableParagraph = (
    children: InstanceType<typeof TextRun>[],
    options: Record<string, unknown> = {},
  ) => {
    const { spacing: spacingOverride, ...rest } = options as {
      spacing?: Record<string, unknown>;
    };
    return new Paragraph({
      spacing: {
        line: DOC_LINE_HEIGHT,
        lineRule: LineRuleType.AUTO,
        after: DOC_SP.none,
        ...spacingOverride,
      },
      ...rest,
      children,
    });
  };

  const dottedValue = (value: string) =>
    new TextRun({
      text: value || ' ',
      font: fontProps,
      size: DOC_SIZE_BODY,
      underline: { type: UnderlineType.DOTTED },
    });

  const infoFieldLine = (label: string, value: string) =>
    tableParagraph([run(`${label}`), dottedValue(value)]);

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: TableBorders.NONE,
            margins: { top: 0, bottom: 0, left: 0, right: 160 },
            children: [
              infoFieldLine('Tôi tên/ 姓名: ', detail.employeeName || ''),
              infoFieldLine('Mã Số/ 工號: ', detail.employeeCode || ''),
              infoFieldLine('Chức vụ/ 任職: ', detail.jobPositionName || ''),
              infoFieldLine('', ''),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: TableBorders.NONE,
            margins: { top: 0, bottom: 0, left: 160, right: 0 },
            children: [
              infoFieldLine('Bộ phận/ 部門: ', detail.organizationName || ''),
              infoFieldLine('Ngày thôi việc/ 離職日期: ', format.formatDate(detail.exitedAt) || ''),
            ],
          }),
        ],
      }),
    ],
  });

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: DOC_SP.none },
                children: [
                  new ImageRun({
                    type: 'png',
                    data: dataUrlToUint8Array(logoDataUrl),
                    transformation: {
                      width: DOC_LOGO.width,
                      height: DOC_LOGO.height,
                    },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              tableParagraph([run(headerDate)], {
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const titleBlocks = [
    blankLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: defaultSpacing,
      children: [boldRun('BIÊN BẢN PHỎNG VẤN NGHỈ VIỆC', DOC_SIZE_TITLE)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: defaultSpacing,
      children: [boldRun('員工離職面談記錄表', DOC_SIZE_SUBTITLE)],
    }),
    blankLine(),
  ];

  const part1Items = collectPart1Items(sections);
  const part1 = findSectionBySectionId(sections, 1);
  const part1Defaults = [
    '(1) Lương thưởng & Phúc lợi/薪資福利: Lương thấp, ít tăng ca, thưởng không minh bạch.',
    '(2) Vấn đề quản lý/管理問題: Tổ trưởng thái độ gắt gỏng, quản lý không công bằng, sắp xếp công việc không hợp lý.',
    '(3) Môi trường làm việc/工作環境: Xưởng quá nóng/ồn, công việc quá nặng nhọc, vấn đề về bạo lực giới, quấy rối tình dục.',
    '(4) Chế độ đãi ngộ/福利伙食: Cơm ca không ngon, ký túc xá kém, khó xin nghỉ phép.',
    '(5) Lý do cá nhân/個人因素: Việc gia đình, sức khỏe, nhà xa, về quê, đi học nâng cao trình độ, tự do kinh doanh.',
  ];

  const part1Child = getFirstChildSection(sections, 1);
  const part1Blocks = [
    sectionNameParagraph(part1?.sectionName ?? 'PHẦN 1: LÝ DO CHÍNH NGHỈ VIỆC/第一部分：離職主因'),
    sectionNameParagraph(
      part1Child?.sectionName?.trim() || 'Vui lòng chọn 1 lý do chính/請選勾最主要的 一項',
    ),
    ...(part1Items.length
      ? part1Items.map((item) =>
        paragraph([checkboxRun(item.checked), run(item.label)], {
          alignment: AlignmentType.JUSTIFIED,
        }),
      )
      : part1Defaults.map((label) =>
        paragraph([checkboxRun(false), run(label)], {
          alignment: AlignmentType.JUSTIFIED,
        }),
      )),
  ];

  const part2Items = collectPart2Items(sections);
  const part2 = findSectionBySectionId(sections, 2);
  const part2Defaults = [
    { label: '(1) Cách quản lý của cấp trên trực tiếp / 現場主管的管理方式:', score: '' },
    { label: '(2) Sự công bằng trong phân công công việc / 工作分配的公平性:', score: '' },
    { label: '(3) Tình trạng an toàn và thiết bị tại xưởng / 現場安全與設備狀況:', score: '' },
    { label: '(4) Mức độ hài lòng chung đối với công ty / 對公司的整體滿意度:', score: '' },
  ];
  const ratingLines = (part2Items.length ? part2Items : part2Defaults).map((item) =>
    paragraph([
      run(`${item.label} : `),
      run(item.score || '________'),
      run(' Điểm/分'),
    ]),
  );

  const part2Child = getFirstChildSection(sections, 2);
  const part2Blocks = [
    blankLine(),
    sectionNameParagraph(part2?.sectionName ?? 'PHẦN 2: ĐÁNH GIÁ THỰC TẾ (1-5 ĐIỂM)/第二部分：現場評價 (1-5分)'),
    sectionNameParagraph(
      part2Child?.sectionName?.trim() || '5 điểm là rất hài lòng / 5分為最滿意:',
    ),
    ...ratingLines,
  ];

  const buildPart3Blocks = (items: ReturnType<typeof collectPart3Items>) => {
    if (!items.length) {
      const part3 = findSectionBySectionId(sections, 3);
      return [
        sectionNameParagraph(part3?.sectionName ?? 'PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/第三部分：核心問答'),
        sectionNameParagraph('So sánh với công việc mới/競爭力對比:'),
        paragraph([run('Điểm nào của công việc mới tốt hơn công ty mình?/新工作的哪一點比我們公司好？')]),
        paragraph([run('Trả lời/答:')]),
        paragraph([dottedValue(' ')]),
      ];
    }

    const blocks: InstanceType<typeof Paragraph>[] = [
      sectionNameParagraph(
        findSectionBySectionId(sections, 3)?.sectionName ??
        'PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/第三部分：核心問答',
      ),
    ];

    for (const item of items) {
      blocks.push(sectionNameParagraph(item.sectionName));

      if (item.question) {
        const parts = item.question.split(/\s*\/\s*/);
        if (parts.length >= 2 && /[\u4e00-\u9fff]/.test(parts[1])) {
          blocks.push(paragraph([run(parts[0])]));
          blocks.push(paragraph([smallRun(parts.slice(1).join('/'))]));
        } else {
          blocks.push(paragraph([run(item.question)]));
        }
      }

      if (item.choices.length > 0) {
        for (const choice of item.choices) {
          blocks.push(
            paragraph([checkboxRun(choice.checked), run(choice.label)]),
          );

          if (choice.checked && isDisagreeExportChoice(choice.label)) {
            const reason = item.reasonText || '................................';
            blocks.push(
              paragraph(
                [run('Lý do/原因: '), dottedValue(reason)],
                { indent: { left: 360 } },
              ),
            );
          }
        }
      } else {
        blocks.push(paragraph([run('Trả lời/答:')]));
        blocks.push(paragraph([dottedValue(item.textAnswer || ' ')]));
      }
    }

    return blocks;
  };

  const part3Blocks = buildPart3Blocks(collectPart3Items(sections));

  const sectionChildren = [
    headerTable,
    blankLine(),
    ...titleBlocks,
    infoTable,
    ...part1Blocks,
    ...part2Blocks,
    blankLine(),
    ...part3Blocks,
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: DOC_PAGE.width,
              height: DOC_PAGE.height,
            },
            margin: {
              top: DOC_PAGE.marginTop,
              right: DOC_PAGE.marginRight,
              bottom: DOC_PAGE.marginBottom,
              left: DOC_PAGE.marginLeft,
            },
          },
        },
        children: sectionChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

async function saveHtmlAsPdf(container: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  const pages = await capturePages(container);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage();

    let imgWidth = printableWidth;
    let imgHeight = (page.height * imgWidth) / page.width;

    if (imgHeight > printableHeight) {
      imgHeight = printableHeight;
      imgWidth = (page.width * imgHeight) / page.height;
    }

    pdf.addImage(page.dataUrl, 'PNG', margin, margin, imgWidth, imgHeight);
  });

  pdf.save(filename);
}

export async function exportInterviewWord(id: number): Promise<void> {
  const detail = await fetchInterviewDetail(id);
  const logoDataUrl = await ensureLogoDataUrl();
  await saveInterviewAsDocx(detail, logoDataUrl, getFilename(detail, 'docx'));
}

export async function exportInterviewPdf(id: number): Promise<void> {
  const detail = await fetchInterviewDetail(id);
  const container = await createPrintContainer(detail);

  try {
    await saveHtmlAsPdf(container, getFilename(detail, 'pdf'));
  } finally {
    document.body.removeChild(container);
  }
}
