import { db } from '@/lib/db/repository';
import { DatabaseMonetizationSettings } from '@/lib/db/types';

class MonetizationService {
  public getSettings(): DatabaseMonetizationSettings {
    return db.getMonetization();
  }

  public updateSettings(updates: Partial<DatabaseMonetizationSettings>): DatabaseMonetizationSettings {
    return db.updateMonetization(updates);
  }
}

export const monetizationService = new MonetizationService();
