import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkMode.value;
    this.isDarkMode.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('darkMode', newTheme.toString());
  }

  private applyTheme(isDark: boolean): void {
    const themeClass = isDark ? 'dark' : 'light';
    const removeClass = isDark ? 'light' : 'dark';
    this.renderer.removeClass(document.body, removeClass);
    this.renderer.addClass(document.body, themeClass);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);
  }
}