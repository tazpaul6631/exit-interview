import { useI18n } from 'vue-i18n';
import { containsForbiddenSymbols, isAllowedAlphanumeric, isAllowedByField, isAllowedLettersOnlyInput, isAllowedOrganizationName } from '@/utils/inputSanitize';

/** Validate định dạng ô nhập trong modal — không cho ký tự đặc biệt (chỉ hiện lỗi, không tự xóa ký tự). */
export function useModalFieldValidation() {
  const { t } = useI18n();

  const getForbiddenSymbolsError = (value: string) => {
    if (!value || !containsForbiddenSymbols(value)) return '';
    return t('common.errors.forbidden_symbols');
  };

  const getCodeFormatError = (value: string) => {
    if (!value) return '';
    const forbidden = getForbiddenSymbolsError(value);
    if (forbidden) return forbidden;
    return isAllowedAlphanumeric(value) ? '' : t('common.errors.code_alphanumeric');
  };

  const getNameFormatError = (value: string) => {
    if (!value) return '';
    const forbidden = getForbiddenSymbolsError(value);
    if (forbidden) return forbidden;
    return isAllowedByField('name', value) ? '' : t('common.errors.no_special_characters');
  };

  /** Tên người / bộ phận / vai trò trong modal — không số, không ký tự đặc biệt */
  const getModalNameFormatError = (value: string) => {
    if (!value) return '';
    const forbidden = getForbiddenSymbolsError(value);
    if (forbidden) return forbidden;
    if (/\d/.test(value)) return t('common.errors.name_no_numbers');
    if (!isAllowedLettersOnlyInput(value)) return t('common.errors.no_special_characters');
    return '';
  };

  const getPriorityFormatError = (value: string) => {
    if (!value) return '';
    const forbidden = getForbiddenSymbolsError(value);
    if (forbidden) return forbidden;
    return isAllowedByField('priority', value) ? '' : t('common.errors.digits_only');
  };

  /** Tên bộ phận — chữ, số, khoảng trắng, + - _ */
  const getOrganizationNameFormatError = (value: string) => {
    if (!value) return '';
    const forbidden = getForbiddenSymbolsError(value);
    if (forbidden) return forbidden;
    return isAllowedOrganizationName(value) ? '' : t('common.errors.organization_name_format');
  };

  return {
    getCodeFormatError,
    getNameFormatError,
    getModalNameFormatError,
    getOrganizationNameFormatError,
    getPriorityFormatError,
  };
}
