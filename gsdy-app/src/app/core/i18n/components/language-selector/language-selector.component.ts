import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  languages: SupportedLanguage[] = [];
  currentLanguage: string = '';
  isDropdownOpen: boolean = false;
  private langSubscription: Subscription | null = null;

  constructor(private translationService: TranslationService) { }

  ngOnInit(): void {
    // Récupérer les langues supportées
    this.languages = this.translationService.getSupportedLanguages();
    
    // S'abonner aux changements de langue
    this.langSubscription = this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    
    // Langue actuelle
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  ngOnDestroy(): void {
    // Nettoyage
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Changer la langue de l'application
   */
  changeLanguage(langCode: string): void {
    this.translationService.changeLanguage(langCode);
    this.toggleDropdown(); // Fermer le menu après sélection
  }

  /**
   * Afficher/cacher le menu déroulant
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Obtenir le nom d'une langue à partir de son code
   */
  getLanguageName(langCode: string): string {
    const lang = this.languages.find(l => l.code === langCode);
    return lang ? lang.name : langCode;
  }

  /**
   * Obtenir le drapeau d'une langue à partir de son code
   */
  getLanguageFlag(langCode: string): string {
    const lang = this.languages.find(l => l.code === langCode);
    return lang && lang.flag ? lang.flag : '';
  }
}
