import ExcelJS from 'exceljs';

export interface OrganizationImportRow {
  priority: number;
  name: string;
  isActive: boolean;
}

export interface OrganizationImportErrorLocation {
  kind: 'row' | 'stt';
  value: number;
}

export class OrganizationImportValidationError extends Error {
  readonly code = 'invalid_import' as const;

  constructor(readonly locations: OrganizationImportErrorLocation[]) {
    super('invalid_import');
  }
}

export const formatOrganizationImportErrorLocations = (
  locations: OrganizationImportErrorLocation[],
  translate: (key: string, params?: Record<string, unknown>) => string,
) => {
  const rowValues = locations.filter((location) => location.kind === 'row').map((location) => location.value);
  const sttValues = locations.filter((location) => location.kind === 'stt').map((location) => location.value);
  const parts: string[] = [];

  if (rowValues.length > 0) {
    parts.push(
      translate('organization.import.error_location_row', {
        value: rowValues.join(', '),
      }),
    );
  }

  if (sttValues.length > 0) {
    parts.push(
      translate('organization.import.error_location_stt', {
        value: sttValues.join(', '),
      }),
    );
  }

  return parts.join(', ');
};

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

const STT_HEADERS = new Set(['stt', 'so thu tu', 'no', '#', 'thu tu uu tien', 'uu tien', 'priority']);

const NAME_HEADERS = new Set([
  'ten bo phan',
  'ten phong ban',
  'name',
  'department',
  'department name',
  'bo phan',
  'phong ban',
]);

const STATUS_HEADERS = new Set(['trang thai', 'status', 'isactive', 'active']);

const STATUS_ACTIVE = 'Đang hoạt động';
const STATUS_INACTIVE = 'Ngưng';
const FIRST_DATA_ROW = 3;

const getCellText = (value: ExcelJS.CellValue): string => {
  if (value == null) return '';
  if (typeof value === 'object' && 'text' in value && value.text) {
    return String(value.text).trim();
  }
  if (typeof value === 'object' && 'result' in value && value.result != null) {
    return String(value.result).trim();
  }
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
};

const parsePriority = (value: ExcelJS.CellValue): number | null => {
  if (value == null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const text = getCellText(value);
  if (!text) return null;

  const num = Number(text);
  return Number.isFinite(num) ? num : null;
};

const parseStatus = (value: ExcelJS.CellValue): { isActive: boolean; isValid: boolean } => {
  const text = getCellText(value);

  if (!text) {
    return { isActive: false, isValid: true };
  }

  if (text === STATUS_ACTIVE) {
    return { isActive: true, isValid: true };
  }

  if (text === STATUS_INACTIVE) {
    return { isActive: false, isValid: true };
  }

  return { isActive: false, isValid: false };
};

const findColumnIndex = (headers: Map<number, string>, candidates: Set<string>) => {
  for (const [index, header] of headers.entries()) {
    if (candidates.has(header)) return index;
  }

  for (const [index, header] of headers.entries()) {
    if ([...candidates].some((candidate) => header.includes(candidate) || candidate.includes(header))) {
      return index;
    }
  }

  return -1;
};

const toErrorLocation = (priority: number | null, rowNumber: number): OrganizationImportErrorLocation =>
  priority == null
    ? { kind: 'row', value: rowNumber }
    : { kind: 'stt', value: priority };

export async function parseOrganizationExcel(file: File): Promise<OrganizationImportRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'xlsx' && extension !== 'xls') {
    throw new Error('invalid_file');
  }

  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers = new Map<number, string>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers.set(colNumber, normalizeHeader(getCellText(cell.value)));
  });

  const sttCol = findColumnIndex(headers, STT_HEADERS);
  const nameCol = findColumnIndex(headers, NAME_HEADERS);
  const statusCol = findColumnIndex(headers, STATUS_HEADERS);

  if (sttCol < 0 || nameCol < 0 || statusCol < 0) {
    throw new Error('missing_columns');
  }

  const rows: OrganizationImportRow[] = [];
  const invalidLocations: OrganizationImportErrorLocation[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < FIRST_DATA_ROW) return;

    const priority = parsePriority(row.getCell(sttCol).value);
    const name = getCellText(row.getCell(nameCol).value).replace(/\s+/g, ' ').trim();
    const statusText = getCellText(row.getCell(statusCol).value);

    if (priority == null && !name && !statusText) return;

    if (priority == null || !name) {
      invalidLocations.push(toErrorLocation(priority, rowNumber));
      return;
    }

    const status = parseStatus(row.getCell(statusCol).value);
    if (!status.isValid) {
      invalidLocations.push({ kind: 'stt', value: priority });
      return;
    }

    rows.push({
      priority,
      name,
      isActive: status.isActive,
    });
  });

  if (invalidLocations.length > 0) {
    throw new OrganizationImportValidationError(invalidLocations);
  }

  return rows;
}
