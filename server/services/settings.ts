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
    const result = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.settingKey, key))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const setting = result[0];
    return this.parseSettingValue(setting.settingValue, setting.settingType);
  }

  static async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    const results = await db
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
    description?: string,
    updatedBy?: string
  ): Promise<void> {
    const stringValue = this.stringifySettingValue(value, type);
    
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.settingKey, key))
      .limit(1);
    
    if (existing.length > 0) {
      await db
        .update(appSettings)
        .set({
          settingValue: stringValue,
          settingType: type,
          updatedBy,
          updatedAt: new Date()
        })
        .where(eq(appSettings.settingKey, key));
    } else {
      await db.insert(appSettings).values({
        settingKey: key,
        settingValue: stringValue,
        settingType: type,
        category,
        description,
        createdBy: updatedBy
      });
    }
  }

  static async deleteSetting(key: string): Promise<void> {
    await db
      .delete(appSettings)
      .where(and(
        eq(appSettings.settingKey, key),
        eq(appSettings.isSystem, false)
      ));
  }

  private static parseSettingValue(value: string | null, type: string): any {
    if (value === null) return null;
    
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
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

  private static stringifySettingValue(value: any, type: string): string {
    switch (type) {
      case 'json':
      case 'object':
        return JSON.stringify(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      default:
        return String(value);
    }
  }
}