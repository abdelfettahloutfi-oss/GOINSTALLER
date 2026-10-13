import { db } from '@/lib/db/repository';
import { DatabaseLanguage, DatabaseTranslation } from '@/lib/db/types';

class LanguageService {
  public getActiveLanguages(): DatabaseLanguage[] {
    return db.getAllLanguages().filter((l) => l.isEnabled);
  }

  public getAllLanguages(): DatabaseLanguage[] {
    return db.getAllLanguages();
  }

  public getLanguageByCode(code: string): DatabaseLanguage | undefined {
    return db.getLanguageByCode(code);
  }

  public saveLanguage(langData: Partial<DatabaseLanguage> & { code: string; name: string }): DatabaseLanguage {
    return db.saveLanguage(langData);
  }

  public deleteLanguage(code: string): boolean {
    return db.deleteLanguage(code);
  }

  public getTranslations(languageCode = 'en', namespace?: string): Record<string, string> {
    return db.getTranslations(languageCode, namespace);
  }

  public getAllTranslations(): DatabaseTranslation[] {
    return db.getAllTranslationsList();
  }

  public saveTranslation(data: { languageCode: string; namespace: string; key: string; value: string }): DatabaseTranslation {
    return db.saveTranslation(data);
  }
}

export const languageService = new LanguageService();
