import { Component } from '@angular/core';

@Component({
  selector: 'app-language-selector',
  template: `
    <div class="relative">
      <button 
        (click)="toggleLanguageMenu()"
        class="p-2 rounded-full hover:bg-gsdy-violet-clair transition-colors block text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>
      
      <div *ngIf="languageMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
        <div class="py-1">
          <a 
            (click)="selectLanguage('fr'); toggleLanguageMenu()"
            class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer" 
            [ngClass]="{'font-bold': currentLanguage === 'fr'}">
            Français
          </a>
          <a 
            (click)="selectLanguage('en'); toggleLanguageMenu()"
            class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            [ngClass]="{'font-bold': currentLanguage === 'en'}">
            English
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LanguageSelectorComponent {
  languageMenuOpen = false;
  currentLanguage = 'fr'; // Langue par défaut

  constructor() {
    // Récupérer la langue stockée ou utiliser la langue par défaut
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
      this.currentLanguage = storedLang;
    }
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
  }

  selectLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    // Ici, on pourrait ajouter une logique pour changer la langue dans toute l'application
    // en utilisant un service de traduction
  }
}
