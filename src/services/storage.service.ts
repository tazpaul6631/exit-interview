import { Preferences } from '@capacitor/preferences';

class StorageService {
  /**
   * Lưu dữ liệu (Tự động stringify nếu là object)
   */
  async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await Preferences.set({
      key,
      value: stringValue,
    });
  }

  /**
   * Lấy dữ liệu
   * @param isObject Nếu true sẽ tự động parse JSON
   */
  async get(key: string, isObject = false): Promise<any> {
    const { value } = await Preferences.get({ key });

    if (!value) return null;

    try {
      return isObject ? JSON.parse(value) : value;
    } catch (e) {
      return value;
    }
  }

  /**
   * Xóa một key cụ thể
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Xóa sạch bách (Dùng khi Logout)
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }

  /**
   * Lấy danh sách tất cả các keys đang lưu
   */
  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }
}

// Export một instance duy nhất để dùng khắp app
const storageService = new StorageService();
export default storageService;