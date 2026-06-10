import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'vivero-theme';
  private readonly darkModeQuery = '(prefers-color-scheme: dark)';
  private readonly currentTheme = signal<Theme>('light');
  private systemThemeQuery?: MediaQueryList;

  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.systemThemeQuery = window.matchMedia(this.darkModeQuery);
    const storedTheme = this.getStoredTheme();
    this.applyTheme(storedTheme ?? this.getSystemTheme());

    this.systemThemeQuery.addEventListener('change', (event) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(event.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.isDark() ? 'light' : 'dark';
    try {
      localStorage.setItem(this.storageKey, nextTheme);
    } catch {
      // The theme still changes for the current session when storage is unavailable.
    }
    this.applyTheme(nextTheme);
  }

  private getStoredTheme(): Theme | null {
    try {
      const storedTheme = localStorage.getItem(this.storageKey);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    } catch {
      return null;
    }
  }

  private getSystemTheme(): Theme {
    return this.systemThemeQuery?.matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    this.document.documentElement.style.colorScheme = theme;
  }
}
