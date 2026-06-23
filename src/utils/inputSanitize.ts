export type SanitizeFn = (value: string) => string;

const ASCII_ALPHANUMERIC_RE = /[^a-zA-Z0-9]/g;
/** × (U+00D7) và ÷ (U+00F7) nằm trong dải Latin mở rộng — chặn riêng */
const FORBIDDEN_SYMBOLS = /[×÷]/;
const FORBIDDEN_SYMBOLS_RE = /[×÷]/g;
const TEXT_CHARS = 'a-zA-Z0-9\u00C0-\u1EF9\u4e00-\u9fff';
const LETTERS_ONLY_RE = /[^a-zA-Z\u00C0-\u1EF9\u4e00-\u9fff\s]/g;
const PLAIN_TEXT_RE = new RegExp(`[^${TEXT_CHARS}\\s]`, 'g');
const ORGANIZATION_NAME_RE = new RegExp(`[^${TEXT_CHARS}\\s+\\-_]`, 'g');

const CODE_FIELDS = new Set(['code', 'employeeCode']);

function isCodeField(field: string): boolean {
  return CODE_FIELDS.has(field);
}

/** Mã nhân viên, login code — chỉ chữ cái Latin (a-zA-Z) và số (0-9) */
export function sanitizeAlphanumeric(value: string): string {
  return value.replace(ASCII_ALPHANUMERIC_RE, '');
}

export function isAllowedAlphanumeric(input: string): boolean {
  if (!input) return true;
  if (containsForbiddenSymbols(input)) return false;
  return sanitizeAlphanumeric(input) === input;
}

export function containsForbiddenSymbols(value: string): boolean {
  return FORBIDDEN_SYMBOLS.test(value);
}

/** Tên, tìm kiếm — chữ, số, khoảng trắng */
export function sanitizePlainText(value: string): string {
  return value.replace(FORBIDDEN_SYMBOLS_RE, '').replace(PLAIN_TEXT_RE, '');
}

/** Chỉ chữ cái và khoảng trắng — không số, không ký tự đặc biệt */
export function sanitizeLettersOnly(value: string): string {
  return value.replace(LETTERS_ONLY_RE, '');
}

export function isAllowedLettersOnlyInput(input: string): boolean {
  return sanitizeLettersOnly(input) === input;
}

/** Tên bộ phận — chữ, số, khoảng trắng và + - _ */
export function isAllowedOrganizationName(input: string): boolean {
  if (!input) return true;
  if (containsForbiddenSymbols(input)) return false;
  return input.replace(ORGANIZATION_NAME_RE, '') === input;
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isAllowedByField(field: string, input: string): boolean {
  if (!input) return true;
  if (containsForbiddenSymbols(input)) return false;
  if (isCodeField(field)) return isAllowedAlphanumeric(input);
  if (field === 'priority') return sanitizeDigits(input) === input;
  return sanitizePlainText(input) === input;
}

export function onInputSanitize(
  event: Event,
  sanitizer: SanitizeFn,
  assign: (value: string) => void,
): void {
  const el = event.target as HTMLInputElement | HTMLTextAreaElement;
  const cleaned = sanitizer(el.value);
  if (el.value !== cleaned) el.value = cleaned;
  assign(cleaned);
}
