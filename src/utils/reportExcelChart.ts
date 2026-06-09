import type ExcelJS from 'exceljs';
import {
  REPORT_CHART_START_COLUMN,
  type ReportSheetLayout,
} from '@/config/reportExcelLayout';

/** Màu chuỗi giống Excel mặc định (ảnh mẫu) */
const CLUSTERED_SERIES_COLORS = ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4'];

const CHART_IMAGE_MIN_WIDTH = 1000;
const CHART_IMAGE_MIN_HEIGHT = 480;
const CHART_IMAGE_MAX_WIDTH = 2500;
const CHART_IMAGE_MAX_HEIGHT = 900;
const CHART_PLOT_MIN_HEIGHT = 280;
const CHART_PRINT_COL_SPAN = 24;
/** Độ rộng tối thiểu mỗi nhóm cột (BU / 1分…) trên chart */
const CHART_GROUP_MIN_WIDTH = 72;
const CHART_GROUP_PER_SERIES = 16;
/** % chiều rộng nhóm dùng vẽ cụm cột (còn lại = khe giữa các nhóm) */
const CHART_CLUSTER_WIDTH_RATIO = 0.9;

const LEGEND_ITEM_MIN_WIDTH = 240;
const LEGEND_ITEM_MAX_WIDTH = 420;
const CHART_FONT_TITLE = 'bold 20px Arial, sans-serif';
const CHART_FONT_AXIS = '16px Arial, sans-serif';
const CHART_FONT_LABEL = '15px Arial, sans-serif';
const CHART_FONT_VALUE = 'bold 15px Arial, sans-serif';

const LEGEND_LINE_HEIGHT = 14;
const LEGEND_BOX = 14;
const LEGEND_GAP_Y = 14;
/** Bề ngang wrap mỗi ratingTitle trong chú thích chart (sheet 2) */
const WRAPPED_LEGEND_WRAP_WIDTH = 220;
const CATEGORY_LINE_HEIGHT = 14;
const CATEGORY_SLANTED_RESERVE = 80;

/** Khoảng cách chữ ↔ khung vùng vẽ cột */
const CHART_SPACING = {
  padLeft: 62,
  padRight: 36,
  padTop: 36,
  padBottom: 28,
  titleY: 30,
  gapTitleToPlot: 22,
  gapPlotToCategory: 24,
  gapCategoryToLegend: 28,
  yLabelOffset: 16,
  barValueGap: 10,
};

const CHART_HEADER_ROW = 4;
const CHART_DATA_START_ROW = 5;

const CHART_THEME = {
  headerFill: 'FFD9E2F3',
  border: '0C0A09',
  grid: '#E2E8F0',
  axis: '#94A3B8',
};

export interface ClusteredChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface ClusteredChartData {
  title: string;
  categories: string[];
  series: ClusteredChartSeries[];
}

export function chartCategoryLabels(layout: ReportSheetLayout): string[] {
  return layout.columnHeaders.slice(2);
}

export function getChartStartColumn(layout: ReportSheetLayout): number {
  return layout.chartStartColumn ?? REPORT_CHART_START_COLUMN;
}

export function getChartPrintEndColumn(layout: ReportSheetLayout): number {
  return getChartStartColumn(layout) + CHART_PRINT_COL_SPAN - 1;
}

export function buildClusteredChartData(
  layout: ReportSheetLayout,
  categories: string[],
  seriesValues: number[][],
): ClusteredChartData {
  const labels = chartCategoryLabels(layout);
  return {
    title: layout.chartTitle ?? layout.sectionTitle,
    categories,
    series: labels.map((name, i) => ({
      name,
      color: CLUSTERED_SERIES_COLORS[i % CLUSTERED_SERIES_COLORS.length],
      values: seriesValues[i] ?? [],
    })),
  };
}

/** Đảo hàng/cột: trục X = cột số (1–5分), mỗi chuỗi = một dòng bảng (đánh giá / BU) */
export function buildClusteredChartDataTransposed(
  layout: ReportSheetLayout,
  rowLabels: string[],
  seriesValues: number[][],
): ClusteredChartData {
  const categories = chartCategoryLabels(layout);
  return {
    title: layout.chartTitle ?? layout.sectionTitle,
    categories,
    series: rowLabels.map((name, ri) => ({
      name,
      color: CLUSTERED_SERIES_COLORS[ri % CLUSTERED_SERIES_COLORS.length],
      values: seriesValues.map((col) => Number(col[ri]) || 0),
    })),
  };
}

export function buildClusteredChartDataForLayout(
  layout: ReportSheetLayout,
  rowLabels: string[],
  seriesValues: number[][],
): ClusteredChartData {
  return layout.chartTranspose
    ? buildClusteredChartDataTransposed(layout, rowLabels, seriesValues)
    : buildClusteredChartData(layout, rowLabels, seriesValues);
}

function calcYAxisMax(series: ClusteredChartSeries[]): number {
  const max = Math.max(0, ...series.flatMap((s) => s.values.map((v) => Number(v) || 0)));
  if (max === 0) return 12;
  const rounded = Math.ceil(max / 2) * 2;
  return Math.max(rounded, 4);
}

/** Nhãn đầy đủ — giữ Việt + Trung (mỗi phần sau dấu / xuống dòng riêng khi vẽ) */
function chartLabelLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  const value = String(text ?? '').trim();
  if (!value) return [''];
  if (!value.includes('/')) {
    return measureTextLines(ctx, value, maxWidth, font);
  }
  const slash = value.indexOf('/');
  const vi = value.slice(0, slash).trim();
  const zh = value.slice(slash + 1).trim();
  const lines: string[] = [];
  if (vi) lines.push(...measureTextLines(ctx, vi, maxWidth, font));
  if (zh) lines.push(...measureTextLines(ctx, zh, maxWidth, font));
  return lines.length ? lines : [''];
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const value = String(text ?? '').trim();
  if (!value) return [''];
  if (ctx.measureText(value).width <= maxWidth) return [value];

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  const lines: string[] = [];
  let chunk = '';
  for (const ch of value) {
    const test = chunk + ch;
    if (ctx.measureText(test).width > maxWidth && chunk) {
      lines.push(chunk);
      chunk = ch;
    } else {
      chunk = test;
    }
  }
  if (chunk) lines.push(chunk);
  return lines.length ? lines : [value];
}

function measureTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  ctx.font = font;
  return wrapCanvasText(ctx, text, maxWidth);
}

function chartCanvasWidth(categoryCount: number, seriesCount: number): number {
  const perGroup = Math.max(CHART_GROUP_MIN_WIDTH, seriesCount * CHART_GROUP_PER_SERIES + 36);
  const byCategories = 120 + categoryCount * perGroup;
  const legendCols = Math.max(1, Math.min(seriesCount, 3));
  const legendRows = Math.ceil(seriesCount / legendCols);
  const byLegend = legendCols * LEGEND_ITEM_MIN_WIDTH + 48;
  const byLegendTall = legendRows > 1 ? byLegend : seriesCount * LEGEND_ITEM_MIN_WIDTH + 48;
  return Math.min(
    CHART_IMAGE_MAX_WIDTH,
    Math.max(CHART_IMAGE_MIN_WIDTH, byCategories, byLegend, byLegendTall),
  );
}

type LegendLayout = {
  vertical: boolean;
  cols: number;
  itemWidths: number[];
  rowHeights: number[];
  totalHeight: number;
};

function measureWrappedLegendItem(
  ctx: CanvasRenderingContext2D,
  name: string,
  font: string,
): { itemWidth: number; itemHeight: number } {
  const lines = chartLabelLines(ctx, name, WRAPPED_LEGEND_WRAP_WIDTH, font);
  ctx.font = font;
  const maxLineW = Math.max(20, ...lines.map((l) => ctx.measureText(l).width));
  return {
    itemWidth: LEGEND_BOX + 12 + maxLineW,
    itemHeight: LEGEND_BOX + 8 + lines.length * LEGEND_LINE_HEIGHT,
  };
}

function layoutLegend(
  ctx: CanvasRenderingContext2D,
  series: ClusteredChartSeries[],
  chartWidth: number,
  verticalSeriesLabels = false,
): LegendLayout {
  const font = CHART_FONT_LABEL;
  const innerW = chartWidth - 48;

  if (verticalSeriesLabels) {
    const metrics = series.map((s) => measureWrappedLegendItem(ctx, s.name, font));
    const itemWidths = metrics.map((m) => m.itemWidth);
    const gapX = 14;
    const rowHeights: number[] = [];
    let rowStart = 0;

    while (rowStart < series.length) {
      let rowW = 0;
      let rowEnd = rowStart;
      while (rowEnd < series.length) {
        const nextW = itemWidths[rowEnd] + (rowEnd > rowStart ? gapX : 0);
        if (rowEnd > rowStart && rowW + nextW > innerW) break;
        rowW += nextW;
        rowEnd++;
      }
      const maxH = Math.max(...metrics.slice(rowStart, rowEnd).map((m) => m.itemHeight), 40);
      rowHeights.push(maxH);
      rowStart = rowEnd;
    }

    const totalHeight =
      rowHeights.reduce((sum, h) => sum + h + LEGEND_GAP_Y, 12) + CHART_SPACING.padBottom;
    return {
      vertical: true,
      cols: series.length,
      itemWidths,
      rowHeights,
      totalHeight,
    };
  }

  const cols = Math.max(1, Math.min(series.length, Math.floor(innerW / LEGEND_ITEM_MIN_WIDTH)));
  const itemWidth = Math.min(LEGEND_ITEM_MAX_WIDTH, innerW / cols);
  const rows = Math.ceil(series.length / cols);
  const rowHeights: number[] = [];
  const itemWidths = series.map(() => itemWidth);

  for (let r = 0; r < rows; r++) {
    let maxH = LEGEND_BOX + 6;
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= series.length) break;
      const lines = chartLabelLines(ctx, series[idx].name, itemWidth - 22, font);
      maxH = Math.max(maxH, LEGEND_BOX + 4 + lines.length * LEGEND_LINE_HEIGHT);
    }
    rowHeights.push(maxH);
  }

  const totalHeight =
    rowHeights.reduce((sum, h) => sum + h + LEGEND_GAP_Y, 12) + CHART_SPACING.padBottom;
  return { vertical: false, cols, itemWidths, rowHeights, totalHeight };
}

/** Chú thích ratingTitle: xuống dòng, không xoay */
function drawWrappedLegendText(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  maxWidth: number,
  font: string,
) {
  ctx.font = font;
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  chartLabelLines(ctx, text, maxWidth, font).forEach((line, li) => {
    ctx.fillText(line, left, top + li * LEGEND_LINE_HEIGHT);
  });
}

function measureCategoryAxisHeight(
  ctx: CanvasRenderingContext2D,
  categories: string[],
  groupW: number,
  slanted: boolean,
): number {
  if (slanted) return CATEGORY_SLANTED_RESERVE + CHART_SPACING.gapPlotToCategory;
  const font = CHART_FONT_LABEL;
  let maxLines = 1;
  categories.forEach((cat) => {
    maxLines = Math.max(maxLines, chartLabelLines(ctx, cat, Math.max(40, groupW - 6), font).length);
  });
  return CHART_SPACING.gapPlotToCategory + 16 + maxLines * CATEGORY_LINE_HEIGHT;
}

function getPlotTop(): number {
  return CHART_SPACING.padTop + CHART_SPACING.gapTitleToPlot;
}

export function computeChartCanvasSize(
  data: ClusteredChartData,
  options?: ClusteredChartRenderOptions,
): { width: number; height: number } {
  const slanted = options?.slantedCategoryLabels !== false;
  const nCat = data.categories.length;
  const nSeries = data.series.length;
  const width = chartCanvasWidth(nCat, nSeries);

  if (typeof document === 'undefined') {
    return { width, height: CHART_IMAGE_MIN_HEIGHT };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { width, height: CHART_IMAGE_MIN_HEIGHT };

  const chartW = width - CHART_SPACING.padLeft - CHART_SPACING.padRight;
  const groupW = chartW / Math.max(1, nCat);
  const legend = layoutLegend(ctx, data.series, width, options?.verticalSeriesLabels === true);
  const axisH = measureCategoryAxisHeight(ctx, data.categories, groupW, slanted);
  const plotTop = getPlotTop();
  const height = Math.min(
    CHART_IMAGE_MAX_HEIGHT,
    Math.max(
      CHART_IMAGE_MIN_HEIGHT,
      plotTop + CHART_PLOT_MIN_HEIGHT + axisH + legend.totalHeight + CHART_SPACING.gapCategoryToLegend,
    ),
  );

  return { width, height };
}

export type ClusteredChartRenderOptions = {
  /** Nhãn trục X xoay chéo (mặc định true) */
  slantedCategoryLabels?: boolean;
  /** Chú thích: tên chuỗi (ratingTitle) xuống dòng — chỉ khi vẽ PNG */
  verticalSeriesLabels?: boolean;
};

export function getChartRenderOptions(layout: ReportSheetLayout): ClusteredChartRenderOptions {
  return {
    slantedCategoryLabels: layout.chartSlantedLabels !== false,
    verticalSeriesLabels: layout.chartVerticalSeriesLabels === true,
  };
}

function drawCategoryLabel(
  ctx: CanvasRenderingContext2D,
  cat: string,
  cx: number,
  baseY: number,
  groupW: number,
  slanted: boolean,
) {
  const font = CHART_FONT_LABEL;
  ctx.fillStyle = '#475569';
  ctx.font = font;
  if (slanted) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.translate(cx, baseY);
    ctx.rotate(-0.45);
    chartLabelLines(ctx, cat, Math.max(60, groupW * 1.6), font).forEach((line, li) => {
      ctx.fillText(line, 0, li * CATEGORY_LINE_HEIGHT);
    });
    ctx.restore();
    return;
  }
  ctx.textAlign = 'center';
  chartLabelLines(ctx, cat, Math.max(40, groupW - 6), font).forEach((line, li) => {
    ctx.fillText(line, cx, baseY + li * CATEGORY_LINE_HEIGHT);
  });
}

function drawLegendGrid(
  ctx: CanvasRenderingContext2D,
  series: ClusteredChartSeries[],
  layout: LegendLayout,
  top: number,
  chartWidth: number,
) {
  const font = CHART_FONT_LABEL;
  let y = top + 6;

  if (!layout.vertical) {
    const itemWidth = layout.itemWidths[0] ?? LEGEND_ITEM_MIN_WIDTH;
    const startX = Math.max(CHART_SPACING.padLeft, (chartWidth - layout.cols * itemWidth) / 2);

    layout.rowHeights.forEach((rowH, row) => {
      for (let col = 0; col < layout.cols; col++) {
        const idx = row * layout.cols + col;
        if (idx >= series.length) break;
        const s = series[idx];
        const x = startX + col * itemWidth;

        ctx.fillStyle = s.color;
        ctx.fillRect(x, y, LEGEND_BOX, LEGEND_BOX);
        ctx.strokeStyle = '#CBD5E1';
        ctx.strokeRect(x, y, LEGEND_BOX, LEGEND_BOX);

        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        chartLabelLines(ctx, s.name, itemWidth - 22, font).forEach((line, li) => {
          ctx.fillText(line, x + LEGEND_BOX + 8, y + 12 + li * LEGEND_LINE_HEIGHT);
        });
      }
      y += rowH + LEGEND_GAP_Y;
    });
    return;
  }

  let idx = 0;
  layout.rowHeights.forEach((rowH) => {
    const rowItems: number[] = [];
    let rowW = 0;
    const gapX = 14;
    while (idx < series.length) {
      const w = layout.itemWidths[idx] ?? LEGEND_ITEM_MIN_WIDTH;
      if (rowItems.length > 0 && rowW + gapX + w > chartWidth - 48) break;
      rowW += (rowItems.length ? gapX : 0) + w;
      rowItems.push(idx);
      idx++;
    }

    const startX = Math.max(CHART_SPACING.padLeft, (chartWidth - rowW) / 2);
    let x = startX;

    rowItems.forEach((seriesIdx) => {
      const s = series[seriesIdx];
      const itemW = layout.itemWidths[seriesIdx] ?? LEGEND_ITEM_MIN_WIDTH;

      ctx.fillStyle = s.color;
      ctx.fillRect(x, y, LEGEND_BOX, LEGEND_BOX);
      ctx.strokeStyle = '#CBD5E1';
      ctx.strokeRect(x, y, LEGEND_BOX, LEGEND_BOX);

      drawWrappedLegendText(
        ctx,
        s.name,
        x + LEGEND_BOX + 8,
        y + 12,
        itemW - LEGEND_BOX - 16,
        font,
      );
      x += itemW + gapX;
    });

    y += rowH + LEGEND_GAP_Y;
  });
}

/** Biểu đồ cột nhóm (clustered column) — PNG base64 */
export function createClusteredColumnChartPngBase64(
  data: ClusteredChartData,
  options?: ClusteredChartRenderOptions,
): string {
  const slantedCategoryLabels = options?.slantedCategoryLabels !== false;
  if (typeof document === 'undefined') return '';

  const { title, categories, series } = data;
  const nCat = categories.length;
  const nSeries = series.length;
  if (!nCat || !nSeries) return '';

  const width = chartCanvasWidth(nCat, nSeries);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const plotTop = getPlotTop();
  const chartW = width - CHART_SPACING.padLeft - CHART_SPACING.padRight;
  const groupW = chartW / nCat;
  const legendLayout = layoutLegend(ctx, series, width, options?.verticalSeriesLabels === true);
  const axisH = measureCategoryAxisHeight(ctx, categories, groupW, slantedCategoryLabels);
  const height = Math.min(
    CHART_IMAGE_MAX_HEIGHT,
    Math.max(
      CHART_IMAGE_MIN_HEIGHT,
      plotTop + CHART_PLOT_MIN_HEIGHT + axisH + legendLayout.totalHeight + CHART_SPACING.gapCategoryToLegend,
    ),
  );

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const chartH =
    height - plotTop - axisH - legendLayout.totalHeight - CHART_SPACING.gapCategoryToLegend;
  const legendTop = plotTop + chartH + axisH + CHART_SPACING.gapCategoryToLegend;
  const categoryLabelY = plotTop + chartH + CHART_SPACING.gapPlotToCategory;
  const yMax = calcYAxisMax(series);
  const yStep = 2;

  ctx.fillStyle = '#1E293B';
  ctx.font = CHART_FONT_TITLE;
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, CHART_SPACING.titleY);

  ctx.strokeStyle = CHART_THEME.grid;
  ctx.fillStyle = '#64748B';
  ctx.font = CHART_FONT_AXIS;
  ctx.textAlign = 'right';
  for (let y = 0; y <= yMax; y += yStep) {
    const py = plotTop + chartH - (y / yMax) * chartH;
    ctx.beginPath();
    ctx.moveTo(CHART_SPACING.padLeft, py);
    ctx.lineTo(width - CHART_SPACING.padRight, py);
    ctx.stroke();
    ctx.fillText(String(y), CHART_SPACING.padLeft - CHART_SPACING.yLabelOffset, py + 4);
  }

  ctx.strokeStyle = CHART_THEME.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CHART_SPACING.padLeft, plotTop);
  ctx.lineTo(CHART_SPACING.padLeft, plotTop + chartH);
  ctx.lineTo(width - CHART_SPACING.padRight, plotTop + chartH);
  ctx.stroke();

  const clusterW = groupW * CHART_CLUSTER_WIDTH_RATIO;
  const barW = clusterW / nSeries;
  const clusterStart = (groupW - clusterW) / 2;

  categories.forEach((cat, gi) => {
    const gx = CHART_SPACING.padLeft + gi * groupW + clusterStart;

    series.forEach((s, si) => {
      const v = Number(s.values[gi]) || 0;
      if (v <= 0) return;

      const barH = (v / yMax) * chartH;
      const x = gx + si * barW + barW * 0.08;
      const w = barW * 0.84;
      const y = plotTop + chartH - barH;

      ctx.fillStyle = s.color;
      ctx.fillRect(x, y, w, barH);

      ctx.fillStyle = '#334155';
      ctx.font = CHART_FONT_VALUE;
      ctx.textAlign = 'center';
      ctx.fillText(
        String(v),
        x + w / 2,
        Math.max(plotTop + 14, y - CHART_SPACING.barValueGap),
      );
    });

    const cx = CHART_SPACING.padLeft + gi * groupW + groupW / 2;
    drawCategoryLabel(ctx, cat, cx, categoryLabelY, groupW, slantedCategoryLabels);
  });

  drawLegendGrid(ctx, series, legendLayout, legendTop, width);

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.includes(',') ? (dataUrl.split(',')[1] ?? '') : dataUrl;
}

function thinChartBorder(): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: CHART_THEME.border } };
  return { top: side, left: side, bottom: side, right: side };
}

/** Bảng nguồn (cột I+: hàng = bộ phận, cột = từng chuỗi) */
export function writeChartSourceData(
  ws: ExcelJS.Worksheet,
  layout: ReportSheetLayout,
  data: ClusteredChartData,
) {
  const startCol = getChartStartColumn(layout);
  const seriesCount = data.series.length;
  const lastDataCol = startCol + seriesCount;

  const configured = layout.chartTableColumnWidths ?? [];
  const dataColWidths = layout.chartTableDataColWidth;
  const fallbackDataColW = Math.min(
    55,
    Math.max(16, ...data.series.map((s) => String(s.name).length * 0.9), 16),
  );

  const autoFirstColW = Math.min(
    50,
    Math.max(24, ...data.categories.map((c) => String(c).length * 0.85)),
  );
  ws.getColumn(startCol).width = configured[0] ?? autoFirstColW;

  data.series.forEach((s, i) => {
    const col = startCol + 1 + i;
    const autoW = Math.min(55, Math.max(16, String(s.name).length * 0.9));
    const fromConfig = Array.isArray(dataColWidths)
      ? dataColWidths[i] ?? dataColWidths[0]
      : dataColWidths;
    ws.getColumn(col).width = configured[i + 1] ?? fromConfig ?? autoW;
  });

  const titleRow = ws.getRow(CHART_HEADER_ROW);
  const titleCell = titleRow.getCell(startCol);
  titleCell.value = data.title;
  titleCell.font = { name: 'Times New Roman', size: 13, bold: true };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHART_THEME.headerFill } };
  titleCell.border = thinChartBorder();
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  try {
    ws.mergeCells(CHART_HEADER_ROW, startCol, CHART_HEADER_ROW, lastDataCol);
  } catch {
    /* merged */
  }

  const hdr = ws.getRow(CHART_DATA_START_ROW);
  hdr.getCell(startCol).value = layout.chartTranspose
    ? (layout.chartSourceRowHeader ?? 'Điểm')
    : (layout.columnHeaders[1] ?? 'Bộ phận');
  data.series.forEach((s, i) => {
    hdr.getCell(startCol + 1 + i).value = s.name;
  });
  for (let c = startCol; c <= lastDataCol; c++) {
    const cell = hdr.getCell(c);
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHART_THEME.headerFill } };
    cell.border = thinChartBorder();
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  }

  data.categories.forEach((cat, ri) => {
    const row = ws.getRow(CHART_DATA_START_ROW + 1 + ri);
    row.getCell(startCol).value = cat;
    data.series.forEach((s, si) => {
      row.getCell(startCol + 1 + si).value = Number(s.values[ri]) || 0;
      row.getCell(startCol + 1 + si).numFmt = '0';
    });
    for (let c = startCol; c <= lastDataCol; c++) {
      const cell = row.getCell(c);
      cell.border = thinChartBorder();
      cell.font = { name: 'Times New Roman', size: 11 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: c === startCol ? 'left' : 'center',
        wrapText: c === startCol,
      };
    }
  });
}

export function embedSheetClusteredChart(
  ws: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  layout: ReportSheetLayout,
  data: ClusteredChartData,
) {
  if (layout.hasChart === false) return;

  const startCol = getChartStartColumn(layout);
  writeChartSourceData(ws, layout, data);

  const chartOptions = getChartRenderOptions(layout);
  const png = createClusteredColumnChartPngBase64(data, chartOptions);
  if (!png) return;

  const { width: imageWidth, height: imageHeight } = computeChartCanvasSize(data, chartOptions);
  const imageId = workbook.addImage({ base64: png, extension: 'png' });
  ws.addImage(imageId, {
    tl: { col: startCol - 1, row: CHART_HEADER_ROW - 1 },
    ext: { width: imageWidth, height: imageHeight },
  });
}

/** @deprecated dùng embedSheetClusteredChart */
export function embedSheetBarChart(
  ws: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  layout: ReportSheetLayout,
  totals: number[],
) {
  const labels = chartCategoryLabels(layout);
  embedSheetClusteredChart(ws, workbook, layout, {
    title: layout.chartTitle ?? layout.sectionTitle,
    categories: labels,
    series: [{ name: 'Tổng', color: CLUSTERED_SERIES_COLORS[0], values: totals }],
  });
}
