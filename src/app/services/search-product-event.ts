import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchProductEvent {
  private searchTermSource = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSource.asObservable();

  emitSearch(term: string) {
    this.searchTermSource.next(term);
  }

  getCurrentSearchTerm(): string {
    return this.searchTermSource.getValue();
  }

}
