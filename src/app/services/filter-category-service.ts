import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FilterCategoryService {
  private currentCategory = signal<string>('plantas');
  constructor() {}

  public setCurrentCategory(category: string) {
    this.currentCategory.set(category);
  }

  public getCurrentCategory() {
    return this.currentCategory();
  }
}
