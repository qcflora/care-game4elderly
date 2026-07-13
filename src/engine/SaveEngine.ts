/**
 * 存档/回溯引擎
 * 负责序列化/反序列化、自动存档、检查点管理、回溯恢复
 */
import type { SaveData, Checkpoint } from '@/types/save';

const STORAGE_KEY = 'guardian_spirit_save';
const SETTINGS_KEY = 'guardian_spirit_settings';
const SAVE_VERSION = '1.0.0';

export class SaveEngine {
  /**
   * 序列化存档数据
   */
  serialize(data: SaveData): string {
    return JSON.stringify(data);
  }

  /**
   * 反序列化存档数据
   */
  deserialize(json: string): SaveData | null {
    try {
      const data = JSON.parse(json);
      if (this.validate(data)) {
        return data as SaveData;
      }
      console.error('[SaveEngine] 存档数据校验失败');
      return null;
    } catch (error) {
      console.error('[SaveEngine] 反序列化失败:', error);
      return null;
    }
  }

  /**
   * 存档数据校验
   */
  validate(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const save = data as Record<string, unknown>;

    // 必须字段检查
    const requiredFields = ['version', 'saveTime', 'characterId', 'currentDay', 'attributes'];
    for (const field of requiredFields) {
      if (save[field] === undefined || save[field] === null) {
        console.error(`[SaveEngine] 缺少必填字段: ${field}`);
        return false;
      }
    }

    // 属性值范围检查
    const attrs = save.attributes as Record<string, number>;
    for (const [key, value] of Object.entries(attrs)) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        console.error(`[SaveEngine] 属性值异常: ${key}=${value}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 保存到 LocalStorage
   */
  saveToStorage(data: SaveData): boolean {
    try {
      const json = this.serialize(data);
      localStorage.setItem(STORAGE_KEY, json);

      // 检查存储空间
      const remaining = this.getRemainingSpace();
      if (remaining < 100 * 1024) {
        console.warn(`[SaveEngine] 存储空间不足: 剩余 ${Math.round(remaining / 1024)}KB`);
      }

      return true;
    } catch (error) {
      console.error('[SaveEngine] 保存失败:', error);
      return false;
    }
  }

  /**
   * 从 LocalStorage 加载
   */
  loadFromStorage(): SaveData | null {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;
      return this.deserialize(json);
    } catch (error) {
      console.error('[SaveEngine] 加载失败:', error);
      return null;
    }
  }

  /**
   * 清除存档
   */
  clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * 检查是否有存档
   */
  hasSaveData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * 获取剩余存储空间（字节）
   */
  private getRemainingSpace(): number {
    try {
      const testKey = '__storage_test__';
      const testData = 'x'.repeat(1024); // 1KB
      let count = 0;

      while (true) {
        try {
          localStorage.setItem(testKey + count, testData);
          count++;
        } catch {
          break;
        }
      }

      // 清理测试数据
      for (let i = 0; i < count; i++) {
        localStorage.removeItem(testKey + i);
      }

      return count * 1024;
    } catch {
      return 0;
    }
  }

  /**
   * 存档版本迁移
   */
  migrate(data: SaveData): SaveData {
    // 当前版本无需迁移
    if (data.version === SAVE_VERSION) return data;

    // 未来版本迁移逻辑
    console.log(`[SaveEngine] 存档版本迁移: ${data.version} -> ${SAVE_VERSION}`);
    data.version = SAVE_VERSION;
    return data;
  }

  /**
   * 获取存档信息摘要（不加载完整数据）
   */
  getSaveSummary(): { characterId: string; day: number; saveTime: number } | null {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;
      const data = JSON.parse(json) as SaveData;
      return {
        characterId: data.characterId,
        day: data.currentDay,
        saveTime: data.saveTime,
      };
    } catch {
      return null;
    }
  }
}

/** 全局引擎单例 */
let engineInstance: SaveEngine | null = null;

export function getSaveEngine(): SaveEngine {
  if (!engineInstance) {
    engineInstance = new SaveEngine();
  }
  return engineInstance;
}
