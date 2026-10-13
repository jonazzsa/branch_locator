import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private platformId = inject(PLATFORM_ID);

  async getStores() {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const response = await fetch(`/Branch`); 
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Error fetching branches:', err);
      return [];
    }
  }

}
