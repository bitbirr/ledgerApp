import { db } from '../db/index.js';
import { appSettings } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export interface AppSetting {
  settingId?: number;
  settingKey: string;
  settingValue: any;
  settingType: 'string' | 'number' | 'boolean' | 'json' | 'object';
  category: string;
  description?: string;
  isSystem?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export class SettingsService {
  static async getSetting(key: string): Promise<any> {
    const database = await db; // ✅ always await
    const result = await database
      .select()
      .from(appSettings)
      .where(eq(appSettings.settingKey, key))
      .limit(1);

    if (result.length === 0) return null;

    const setting = result[0];
    return this.parseSettingValue(setting.settingValue, setting.settingType);
  }

  static async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    const database = await db; // ✅ always await
    const results = await database
      .select()
      .from(appSettings)
      .where(eq(appSettings.category, category));

    const settings: Record<string, any> = {};
    for (const setting of results) {
      settings[setting.settingKey] = this.parseSettingValue(
        setting.settingValue,
        setting.settingType
      );
    }
    return settings;
  }

  static async setSetting(
    key: string,
    value: any,
    type: AppSetting['settingType'] = 'string',
    category: string = 'general',
    description?: string | null,
    updatedBy?: string
  ): Promise<void> {
    const database = await db; // ✅ always await

    // Store null as null, not the string "null"
    const stringValue: string | null =
      value === null || value === undefined ? null : this.stringifySettingValue(value, type);

    const existing = await database
      .select()
      .from(appSettings)
      .where(eq(appSettings.settingKey, key))
      .limit(1);

    if (existing.length > 0) {
      await database
        .update(appSettings)
        .set({
          settingValue: stringValue,
          settingType: type,
          category,
          description: description ?? null,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.settingKey, key));
    } else {
      await database.insert(appSettings).values({
        settingKey: key,
        settingValue: stringValue,
        settingType: type,
        category,
        description: description ?? null,
        createdBy: updatedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  static async deleteSetting(key: string): Promise<void> {
    const database = await db; // ✅ always await
    await database
      .delete(appSettings)
      .where(
        and(eq(appSettings.settingKey, key), eq(appSettings.isSystem, false))
      );
  }

  // ✅ accept string | null for type, default to 'string'
  private static parseSettingValue(value: string | null, type: string | null): any {
    if (value === null) return null;
    const t = type ?? 'string';

    switch (t) {
      case 'boolean':
        return value === 'true';
      case 'number': {
        const n = Number(value);
        return Number.isNaN(n) ? value : n;
      }
      case 'json':
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private static stringifySettingValue(value: any, type: AppSetting['settingType']): string {
    switch (type) {
      case 'json':
      case 'object':
        return JSON.stringify(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return (value ?? 0).toString();
      default:
        return String(value ?? '');
    }
  }
}
