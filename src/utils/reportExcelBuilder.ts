import ExcelJS from 'exceljs';
import {
  DEFAULT_REPORT_LAYOUTS,
  type ReportSheetLayout,
} from '@/config/reportExcelLayout';
import type { LeaveReasonRow, RatingRow, ReportExcelResponse, TextRow } from '@/types/reportExcel';
import {
  buildClusteredChartDataForLayout,
  embedSheetClusteredChart,
  getChartPrintEndColumn,
} from '@/utils/reportExcelChart';

export {
  SHEET_LEAVE_REASONS,
  SHEET_RATINGS,
  SHEET_TEXTS,
  REPORT_MAIN_TITLE,
  REPORT_CHART_START_COLUMN,
  LEAVE_REASONS_LAYOUT,
  RATINGS_LAYOUT,
  TEXTS_LAYOUT,
  DEFAULT_REPORT_LAYOUTS,
} from '@/config/reportExcelLayout';

const TITLE_ROW_1 = 1;
const TITLE_ROW_2 = 2;
const SECTION_ROW = 3;
const HEADER_ROW = 4;
const BODY_START_ROW = 5;

const REASON_KEYS = ['reasonOne', 'reasonTwo', 'reasonThree', 'reasonFour', 'reasonFive'] as const;
const RATING_KEYS = ['ratingOne', 'ratingTwo', 'ratingThree', 'ratingFour', 'ratingFive'] as const;

const DEFAULT_EXPORT_FILENAME = 'Báo cáo phỏng vấn thôi việc/離職面談匯總表.xlsx';

const LINE_HEIGHT_PT = 15;
const ROW_PADDING_PT = 10;
const MIN_DATA_ROW_HEIGHT = 22;
const MAX_DATA_ROW_HEIGHT = 180;
const MIN_HEADER_ROW_HEIGHT = 60;
const MAX_HEADER_ROW_HEIGHT = 180;

const THEME = {
  titleFill: '',
  titleFont: '',
  headerFill: 'FFD9E2F3',
  headerFont: '',
  sectionFill: '',
  totalFill: 'FFB86A',
  totalFont: '',
  zebraFill: 'FFF8FAFC',
  border: '0C0A09',
};

function columnIndexToLetter(index: number): string {
  let n = index;
  let letter = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: THEME.border } };
  return { top: side, left: side, bottom: side, right: side };
}

function getColumnWidths(layout: ReportSheetLayout): number[] {
  return layout.columnWidths.length > 0
    ? layout.columnWidths
    : layout.columnHeaders.map(() => 14);
}

function applyColumnWidths(ws: ExcelJS.Worksheet, layout: ReportSheetLayout) {
  getColumnWidths(layout).forEach((width, i) => {
    ws.getColumn(i + 1).width = width;
  });
}

function estimateWrappedLines(text: string, columnWidth: number): number {
  const value = String(text ?? '').trim();
  if (!value) return 1;
  const charsPerLine = Math.max(6, Math.floor(columnWidth));
  return value.split(/\r?\n/).reduce((sum, part) => {
    return sum + Math.max(1, Math.ceil(part.length / charsPerLine));
  }, 0);
}

function calcRowHeight(cellValues: string[], colWidths: number[]): number {
  let maxLines = 1;
  cellValues.forEach((text, index) => {
    maxLines = Math.max(maxLines, estimateWrappedLines(text, colWidths[index] ?? 12));
  });
  return Math.min(
    MAX_DATA_ROW_HEIGHT,
    Math.max(MIN_DATA_ROW_HEIGHT, maxLines * LINE_HEIGHT_PT + ROW_PADDING_PT),
  );
}

function mergeRow(ws: ExcelJS.Worksheet, row: number, colStart: number, colEnd: number) {
  if (colEnd <= colStart) return;
  try {
    ws.mergeCells(row, colStart, row, colEnd);
  } catch {
    /* already merged */
  }
}

/** Ghi động dòng 1, 2, 4, 5 theo layout */
function writeSheetLayout(ws: ExcelJS.Worksheet, layout: ReportSheetLayout) {
  const colCount = layout.columnHeaders.length;
  const lastCol = colCount;

  applyColumnWidths(ws, layout);

  const titleRow1 = ws.getRow(TITLE_ROW_1);
  titleRow1.height = 36;
  titleRow1.getCell(1).value = layout.titleLine1;
  titleRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.titleFill } };
  titleRow1.getCell(1).font = { name: 'Times New Roman', size: 20, bold: true, color: { argb: THEME.titleFont } };
  titleRow1.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow1.getCell(1).border = thinBorder();
  mergeRow(ws, TITLE_ROW_1, 1, lastCol);

  // const titleRow2 = ws.getRow(TITLE_ROW_2);
  // if (layout.titleLine2?.trim()) {
  //   titleRow2.height = 24;
  //   titleRow2.getCell(1).value = layout.titleLine2;
  //   titleRow2.getCell(1).font = { name: 'Times New Roman', size: 12, color: { argb: THEME.titleFont } };
  //   titleRow2.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  //   mergeRow(ws, TITLE_ROW_2, 1, lastCol);
  // } else {
  //   titleRow2.height = 8;
  // }

  const sectionRow = ws.getRow(SECTION_ROW);
  sectionRow.height = 28;
  sectionRow.getCell(1).value = layout.sectionTitle;
  sectionRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.sectionFill } };
  sectionRow.getCell(1).font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: THEME.headerFont } };
  sectionRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  sectionRow.getCell(1).border = thinBorder();
  mergeRow(ws, SECTION_ROW, 1, lastCol);

  const headerRow = ws.getRow(HEADER_ROW);
  const widths = getColumnWidths(layout);
  let headerLines = 1;

  layout.columnHeaders.forEach((text, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = text;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.headerFill } };
    cell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: THEME.headerFont } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder();
    headerLines = Math.max(headerLines, estimateWrappedLines(text, widths[i] ?? 12));
  });

  headerRow.height = Math.min(
    MAX_HEADER_ROW_HEIGHT,
    Math.max(MIN_HEADER_ROW_HEIGHT, headerLines * LINE_HEIGHT_PT + ROW_PADDING_PT + 8),
  );
}

function styleDataRow(
  row: ExcelJS.Row,
  colCount: number,
  index: number,
  options?: { textColumns?: number[] },
) {
  const { textColumns = [] } = options ?? {};
  if (index % 2 === 1) {
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.zebraFill } };
    }
  }
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.font = { name: 'Times New Roman', size: 13 };
    cell.border = thinBorder();
  }
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  for (let c = 3; c <= colCount; c++) {
    const cell = row.getCell(c);
    if (textColumns.includes(c)) {
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.numFmt = '0';
    }
  }
}

function styleTotalRow(row: ExcelJS.Row, colCount: number) {
  row.height = 26;
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.totalFill } };
    cell.font = {
      name: 'Times New Roman',
      size: 13,
      bold: true,
      color: { argb: c <= 2 ? THEME.totalFont : THEME.headerFont },
    };
    cell.border = thinBorder();
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    if (c >= 3) cell.numFmt = '0';
  }
}

function mergeTotalLabel(ws: ExcelJS.Worksheet, rowNumber: number, label: string) {
  ws.mergeCells(rowNumber, 1, rowNumber, 2);
  const cell = ws.getRow(rowNumber).getCell(1);
  cell.value = label;
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: THEME.totalFont } };
}

function sumNumbers(rows: number[]): number {
  return rows.reduce((sum, n) => sum + (Number(n) || 0), 0);
}

function applyRowAutoHeight(
  row: ExcelJS.Row,
  layout: ReportSheetLayout,
  valueColumns: number[],
) {
  const widths = getColumnWidths(layout);
  const values = valueColumns.map((col) => String(row.getCell(col).value ?? ''));
  const usedWidths = valueColumns.map((col) => widths[col - 1] ?? 12);
  row.height = calcRowHeight(values, usedWidths);
}

function finalizeSheet(
  ws: ExcelJS.Worksheet,
  layout: ReportSheetLayout,
  lastRow: number,
  printEndCol?: number,
) {
  const endCol = printEndCol ?? layout.columnHeaders.length;
  const colLetter = columnIndexToLetter(endCol);
  ws.pageSetup.printArea = `A1:${colLetter}${lastRow}`;
  ws.views = [
    {
      state: 'frozen',
      ySplit: HEADER_ROW,
      activeCell: `A${BODY_START_ROW}`,
      showGridLines: true,
    },
  ];
}

function fillDataSheet(
  ws: ExcelJS.Worksheet,
  layout: ReportSheetLayout,
  items: unknown[],
  options: {
    fillData: (row: ExcelJS.Row, item: unknown, index: number) => void;
    fillTotal?: (row: ExcelJS.Row) => void;
    textColumns?: number[];
    autoHeightColumns?: number[];
  },
): number {
  const colCount = layout.columnHeaders.length;
  writeSheetLayout(ws, layout);

  let rowIndex = BODY_START_ROW;
  items.forEach((item, index) => {
    const row = ws.getRow(rowIndex++);
    styleDataRow(row, colCount, index, { textColumns: options.textColumns });
    options.fillData(row, item, index);
    if (options.autoHeightColumns?.length) {
      applyRowAutoHeight(row, layout, options.autoHeightColumns);
    }
  });

  let lastRow = rowIndex - 1;

  if (layout.hasTotalRow && options.fillTotal) {
    const totalRowNum = rowIndex;
    const totalRow = ws.getRow(rowIndex++);
    styleTotalRow(totalRow, colCount);
    mergeTotalLabel(ws, totalRowNum, layout.totalLabel ?? 'Total');
    options.fillTotal(totalRow);
    lastRow = totalRowNum;
  }

  return lastRow;
}

function fillLeaveReasonsSheet(
  ws: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  layout: ReportSheetLayout,
  rows: LeaveReasonRow[],
) {
  const lastRow = fillDataSheet(ws, layout, rows, {
    autoHeightColumns: [2],
    fillData: (row, item, index) => {
      const data = item as LeaveReasonRow;
      row.getCell(1).value = index + 1;
      row.getCell(2).value = data.organizationName ?? '';
      REASON_KEYS.forEach((key, i) => {
        row.getCell(3 + i).value = Number(data[key]) || 0;
      });
    },
    fillTotal: (row) => {
      REASON_KEYS.forEach((key, i) => {
        row.getCell(3 + i).value = sumNumbers(rows.map((r) => r[key]));
      });
    },
  });
  if (layout.hasChart) {
    const chartData = buildClusteredChartDataForLayout(
      layout,
      rows.map((r) => r.organizationName ?? ''),
      REASON_KEYS.map((key) => rows.map((r) => Number(r[key]) || 0)),
    );
    embedSheetClusteredChart(ws, workbook, layout, chartData);
  }
  finalizeSheet(
    ws,
    layout,
    lastRow,
    layout.hasChart ? getChartPrintEndColumn(layout) : undefined,
  );
}

function fillRatingsSheet(
  ws: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  layout: ReportSheetLayout,
  rows: RatingRow[],
) {
  const lastRow = fillDataSheet(ws, layout, rows, {
    autoHeightColumns: [2],
    fillData: (row, item, index) => {
      const data = item as RatingRow;
      row.getCell(1).value = index + 1;
      row.getCell(2).value = data.ratingTitle ?? '';
      RATING_KEYS.forEach((key, i) => {
        row.getCell(3 + i).value = Number(data[key]) || 0;
      });
    },
    fillTotal: (row) => {
      RATING_KEYS.forEach((key, i) => {
        row.getCell(3 + i).value = sumNumbers(rows.map((r) => r[key]));
      });
    },
  });
  if (layout.hasChart) {
    const chartData = buildClusteredChartDataForLayout(
      layout,
      rows.map((r) => r.ratingTitle ?? ''),
      RATING_KEYS.map((key) => rows.map((r) => Number(r[key]) || 0)),
    );
    embedSheetClusteredChart(ws, workbook, layout, chartData);
  }
  finalizeSheet(
    ws,
    layout,
    lastRow,
    layout.hasChart ? getChartPrintEndColumn(layout) : undefined,
  );
}

function fillTextsSheet(ws: ExcelJS.Worksheet, layout: ReportSheetLayout, rows: TextRow[]) {
  const lastRow = fillDataSheet(ws, layout, rows, {
    textColumns: [3, 4, 5, 6],
    autoHeightColumns: [3, 4, 5, 6],
    fillData: (row, item, index) => {
      const data = item as TextRow;
      row.getCell(1).value = index + 1;
      row.getCell(2).value = data.employeeCode ?? '';
      row.getCell(3).value = data.employeeName ?? '';
      row.getCell(4).value = data.answerOne ?? '';
      row.getCell(5).value = data.answerTwo ?? '';
      row.getCell(6).value = data.answerThree ?? '';
    },
  });
  finalizeSheet(ws, layout, lastRow);
}

export type ReportExcelLayoutOverrides = {
  leaveReasons?: Partial<ReportSheetLayout>;
  ratings?: Partial<ReportSheetLayout>;
  texts?: Partial<ReportSheetLayout>;
};

function mergeLayout(base: ReportSheetLayout, patch?: Partial<ReportSheetLayout>): ReportSheetLayout {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    columnHeaders: patch.columnHeaders ?? base.columnHeaders,
    columnWidths: patch.columnWidths ?? base.columnWidths,
  };
}

export async function buildReportWorkbook(
  data: ReportExcelResponse,
  layoutOverrides?: ReportExcelLayoutOverrides,
): Promise<ExcelJS.Workbook> {
  const layouts = DEFAULT_REPORT_LAYOUTS;
  const leaveLayout = mergeLayout(layouts[0], layoutOverrides?.leaveReasons);
  const ratingsLayout = mergeLayout(layouts[1], layoutOverrides?.ratings);
  const textsLayout = mergeLayout(layouts[2], layoutOverrides?.texts);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Exit Interview';
  workbook.created = new Date();

  fillLeaveReasonsSheet(
    workbook.addWorksheet(leaveLayout.sheetName),
    workbook,
    leaveLayout,
    data.leaveReasons ?? [],
  );
  fillRatingsSheet(
    workbook.addWorksheet(ratingsLayout.sheetName),
    workbook,
    ratingsLayout,
    data.ratings ?? [],
  );
  fillTextsSheet(workbook.addWorksheet(textsLayout.sheetName), textsLayout, data.texts ?? []);

  return workbook;
}

export async function workbookToBlob(workbook: ExcelJS.Workbook): Promise<Blob> {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export async function downloadReportWorkbook(
  workbook: ExcelJS.Workbook,
  filename = DEFAULT_EXPORT_FILENAME,
) {
  const blob = await workbookToBlob(workbook);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function getDefaultReportFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `Báo cáo phỏng vấn thôi việc/離職面談匯總表-${date}.xlsx`;
}

export function extractReportData(payload: unknown): ReportExcelResponse {
  const root = payload as Record<string, unknown>;
  const data = (root?.data ?? root) as ReportExcelResponse;

  return {
    leaveReasons: Array.isArray(data?.leaveReasons) ? data.leaveReasons : [],
    ratings: Array.isArray(data?.ratings) ? data.ratings : [],
    texts: Array.isArray(data?.texts) ? data.texts : [],
  };
}
