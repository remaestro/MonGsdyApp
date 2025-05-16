import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = {
  code: string;
  name: string;
  flag?: string;
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // Langues supportées par l'application
  private supportedLanguages: SupportedLanguage[] = [
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'en', name: 'English', flag: 'gb' }
  ];

  // Observable pour la langue actuelle
  private currentLanguageSubject = new BehaviorSubject<string>('fr'); // Français par défaut
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Initialiser la langue selon les préférences ou la langue par défaut
   */
  private initializeLanguage(): void {
    // Récupération des préférences de langue de l'utilisateur depuis le localStorage ou autre
    const savedLang = localStorage.getItem('preferredLanguage');
    
    // Langues disponibles et langue par défaut
    const availableLangs = this.supportedLanguages.map(lang => lang.code);
    this.translate.addLangs(availableLangs);
    
    // Définir la langue par défaut si nécessaire
    if (savedLang && availableLangs.includes(savedLang)) {
      this.translate.setDefaultLang(savedLang);
      this.translate.use(savedLang);
      this.currentLanguageSubject.next(savedLang);
    } else {
      // Si aucune langue n'est enregistrée, utiliser le français par défaut
      const defaultLang = 'fr';
      this.translate.setDefaultLang(defaultLang);
      this.translate.use(defaultLang);
      this.currentLanguageSubject.next(defaultLang);
      localStorage.setItem('preferredLanguage', defaultLang);
    }
  }

  /**
   * Changer la langue de l'application
   */
  changeLanguage(langCode: string): void {
    if (this.isLanguageSupported(langCode)) {
      this.translate.use(langCode);
      this.currentLanguageSubject.next(langCode);
      localStorage.setItem('preferredLanguage', langCode);
    }
  }

  /**
   * Vérifier si une langue est supportée
   */
  isLanguageSupported(langCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === langCode);
  }

  /**
   * Obtenir toutes les langues supportées
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  /**
   * Obtenir la langue actuelle
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Traduire une clé
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}
