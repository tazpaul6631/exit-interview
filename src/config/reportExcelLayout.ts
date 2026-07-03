/**
 * Cấu hình layout Excel báo cáo — sửa tự do tại đây (dòng 1, 2, 4, 5 mỗi sheet).
 * Không dùng file template .xlsx.
 */

export interface ReportSheetLayout {
  /** Tên tab trong file Excel */
  sheetName: string;
  /** Dòng 1 — tiêu đề chính (merge ngang toàn bảng) */
  titleLine1: string;
  /** Dòng 2 — phụ đề (để trống nếu không cần) */
  titleLine2: string;
  /** Dòng 4 — tiêu đề phần / section */
  sectionTitle: string;
  /** Dòng 5 — tiêu đề từng cột */
  columnHeaders: string[];
  /** Độ rộng cột (theo thứ tự columnHeaders) */
  columnWidths: number[];
  /** Có dòng Total cuối bảng */
  hasTotalRow: boolean;
  /** Nhãn cột Total (mặc định "Total") */
  totalLabel?: string;
  /** Biểu đồ cột tổng (cột phụ từ chartStartColumn, mặc định I = 9) */
  hasChart?: boolean;
  /** Cột bắt đầu vùng biểu đồ / dữ liệu chart (1-based, mặc định 9 = I) */
  chartStartColumn?: number;
  /** Tiêu đề biểu đồ cột nhóm */
  chartTitle?: string;
  /** Đảo trục: cột X = điểm (1–5分), chuỗi = từng dòng đánh giá */
  chartTranspose?: boolean;
  /** Nhãn trục X in nghiêng (mặc định true) */
  chartSlantedLabels?: boolean;
  /** Tiêu đề cột đầu bảng nguồn chart khi chartTranspose */
  chartSourceRowHeader?: string;
  /**
   * Độ rộng cột bảng chart (cột I+) — Excel column width.
   * [cột 1: nhãn hàng] + [các cột dữ liệu/chuỗi]. Thiếu phần chuỗi thì dùng chartTableDataColWidth.
   */
  chartTableColumnWidths?: number[];
  /** Độ rộng mặc định mỗi cột dữ liệu chart (khi không khai báo từng cột trong chartTableColumnWidths) */
  chartTableDataColWidth?: number | number[];
  /** Chú thích chart: ratingTitle xuống nhiều dòng (chỉ ảnh PNG, không đổi bảng Excel) */
  chartVerticalSeriesLabels?: boolean;
}

/** Cột bắt đầu bảng + ảnh chart (I) — sau bảng chính A–G */
export const REPORT_CHART_START_COLUMN = 9;

/** Tiêu đề chung — có thể đổi 1 chỗ cho cả 3 sheet */
export const REPORT_MAIN_TITLE = 'BÁO CÁO THỐNG KÊ PHỎNG VẤN THÔI VIỆC';

export const SHEET_LEAVE_REASONS = 'LÝ DO CHÍNH NGHỈ VIỆC';
export const SHEET_RATINGS = 'ĐÁNH GIÁ THỰC TẾ';
export const SHEET_TEXTS = 'CÁC CÂU HỎI TRỌNG TÂM';

export const LEAVE_REASONS_LAYOUT: ReportSheetLayout = {
  sheetName: SHEET_LEAVE_REASONS,
  titleLine1: REPORT_MAIN_TITLE,
  titleLine2: '',
  sectionTitle: 'PHẦN 1: LÝ DO CHÍNH NGHỈ VIỆC/第一部分：離職主因',
  columnHeaders: [
    'STT',
    'Bộ phận',
    '(1) Lương thưởng & Phúc lợi/薪資福利',
    '(2) Vấn đề quản lý/管理問題',
    '(3) Môi trường làm việc/工作環境',
    '(4) Chế độ đãi ngộ/福利伙食',
    '(5) Lý do cá nhân/個人因素',
  ],
  columnWidths: [9, 30, 20, 20, 20, 20, 20],
  hasTotalRow: true,
  totalLabel: 'Total',
  hasChart: true,
  chartStartColumn: REPORT_CHART_START_COLUMN,
  chartTitle: 'Lý do thôi việc',
  chartTranspose: false,
  chartSlantedLabels: false,
  chartSourceRowHeader: 'Lý do',
  /** Bảng chart cột I+: [Bộ phận, (1)…, (2)…, (3)…, (4)…, (5)…] */
  chartTableColumnWidths: [20, 20, 20, 20, 20, 20],
};

export const RATINGS_LAYOUT: ReportSheetLayout = {
  sheetName: SHEET_RATINGS,
  titleLine1: REPORT_MAIN_TITLE,
  titleLine2: '',
  sectionTitle: 'PHẦN 2: ĐÁNH GIÁ THỰC TẾ (1-5 ĐIỂM)/第二部分：現場評價 (1-5分)',
  columnHeaders: ['STT', 'Đánh giá thực tế', '1分', '2分', '3分', '4分', '5分'],
  columnWidths: [9, 42, 12, 12, 12, 12, 12],
  hasTotalRow: true,
  totalLabel: 'Total',
  hasChart: true,
  chartStartColumn: REPORT_CHART_START_COLUMN,
  chartTitle: 'Đánh giá thực tế',
  chartTranspose: true,
  chartSlantedLabels: false,
  chartVerticalSeriesLabels: true,
  chartSourceRowHeader: 'Điểm',
  /** Bảng chart cột I+: [Điểm, cột theo ratingTitle — thêm cột dùng chartTableDataColWidth] */
  chartTableColumnWidths: [14],
  chartTableDataColWidth: [25, 25, 25, 25, 25, 25],
};

export const TEXTS_LAYOUT: ReportSheetLayout = {
  sheetName: SHEET_TEXTS,
  titleLine1: REPORT_MAIN_TITLE,
  titleLine2: '',
  sectionTitle: 'PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/第三部分：核心問答',
  columnHeaders: [
    'STT',
    'Mã nhân viên',
    'Họ tên',
    '(1) So sánh với công việc mới/競爭力對比: Điểm nào của công việc mới tốt hơn công ty mình?/新工作的哪一點比我們公司好？',
    '(2) Góp ý về quản lý/管理建議: Nếu bạn là sếp, bạn muốn thay đổi quy định nào nhất tại xưởng?/如果你是老闆，你最想改變現場哪一個規定？',
    '(3) Ý định quay lại/回任意願: Sau này nếu điều kiện cải thiện, bạn có muốn quay lại làm việc không?/未來如果條件改善，你願意回來工作嗎？',
  ],
  columnWidths: [9, 15, 28, 50, 64, 60],
  hasTotalRow: false,
};

export const DEFAULT_REPORT_LAYOUTS: ReportSheetLayout[] = [
  LEAVE_REASONS_LAYOUT,
  RATINGS_LAYOUT,
  TEXTS_LAYOUT,
];
