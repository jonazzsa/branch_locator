import { Component, inject, OnInit, signal } from '@angular/core';
import { BranchService } from '../../api/branch-service';
import { Coordinates } from '../../models/coordinates';
import { Store } from '../../models/store';
import { BranchMap } from './branch-map/branch-map';
import { BranchSearch } from './branch-search/branch-search';
import { getDistance } from 'ol/sphere';

@Component({
  selector: 'branch-locator',
  standalone: true,
  imports: [BranchMap, BranchSearch],
  templateUrl: './branch-locator.html',
  styleUrls: ['./branch-locator.css'],
})
export class BranchLocator implements OnInit {
  private stores = signal<Store[]>([]);
  public filteredStores = signal<Store[]>([]);
  public initFilteredStores = signal<Store[]>([]);
  public coordinates = signal<Coordinates>(null);
  public isLoading = signal<boolean>(false);
  public storeDetails = signal<Store[]>([]);
  private branchService = inject(BranchService);
  private selectedTypes!: string[];
  private selectedDistance!: number;
  private searchQuery!: string;
  public userCoords: { longitude: number; latitude: number } | null = null;
  public userLocationDenied: boolean = true;
  public searchIsActive: boolean = false;

  async ngOnInit() {
    this.isLoading.set(true);
    const stores = await this.branchService.getStores();
    this.stores.set(stores['stores']);
    this.initFilteredStores.set(stores['stores']);
    this.getUserLiveLocation();
    this.isLoading.set(false);
  }

  public closeStoreDetails(){
    
    this.storeDetails.set([]);
    this.coordinates.set(null);
    
  }

  public async searchStores(searchQuery: string) {
    this.searchQuery = searchQuery;
this.searchIsActive = true;
    this.refreshDisplay();
  }

 

  public zoomTo(coordinates: Coordinates) {
    if (!coordinates) return;
    this.coordinates.set(coordinates);

    const stores = this.stores();
    const filtered = stores.filter(
      b =>
        b.longitude === coordinates.longitude &&
        b.latitude === coordinates.latitude
    );
this.storeDetails.set(filtered);
  }

  public refreshDisplay() {
    const filterSearch = this.applySearch([...this.stores()]);
    const filteredStores = this.applyFilters(filterSearch);
    const finalFilteredList = this.applyDistance(filteredStores);

    this.storeDetails.set([]);
    this.coordinates.set(null);
    this.filteredStores.set(finalFilteredList);
  }
  
  public filterType(event: string[]) {
    this.selectedTypes = event;
    this.refreshDisplay();
  }
  
  public distanceChange(distance: number) {
    this.selectedDistance = distance;
    this.refreshDisplay();
  }

  private applySearch(stores: Store[]): Store[] {
    if (this.searchIsActive && this.searchQuery.length === 0){

      this.searchIsActive = false;
      return[]
    }
    let filteredStores = [...stores];
    this.filteredStores.set([]);
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      filteredStores = filteredStores.filter(store =>
        (store.name && store.name.toLowerCase().includes(query)) ||
        (store.address && store.address.toLowerCase().includes(query)) ||
        (store.country && store.country.toLowerCase().includes(query))
      );
    }
    return filteredStores;
  }

  public getUserLiveLocation() {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          };
          this.userLocationDenied = false;
        },
        (error) => {
          this.userLocationDenied = true;
        }
      );
    } else {
      this.userLocationDenied = true;
    }
  }

  
  private applyDistance(stores: Store[]): Store[] {
    
    if (this.userLocationDenied || !this.selectedDistance) {
      return stores;
    }
  
    if (!this.userCoords) {
      return stores;
    }
  
    const filteredStores = [...stores];
  
    return filteredStores.filter((store: Store) => {
      const storeLon = parseFloat(store.longitude);
      const storeLat = parseFloat(store.latitude);
  
      if (isNaN(storeLon) || isNaN(storeLat)) {
        return false;
      }
  
      const distanceInMeters = getDistance(
        [this.userCoords!.longitude, this.userCoords!.latitude],
        [storeLon, storeLat]
      );
  
      const distanceInKm = distanceInMeters / 1000;
      return distanceInKm <= this.selectedDistance;
    });
  }


  private applyFilters(store: Store[]):Store[] {
    let filteredStores = [...store];
  
    if (this.selectedTypes && this.selectedTypes.length > 0) {
      filteredStores = filteredStores.filter(store => {
        const isAtm = store.attributes?.some((attr: any) => attr.value === 'ATM');
        const isBranch = store.attributes?.some((attr: any) => attr.value === 'Branch');
        const hasSmartId = store.attributes?.some((attr: any) => attr.value === 'SmartID Services');
        const isCashAccepting = store.attributes?.some((attr: any) => attr.value === 'Cash Accepting ATM');
        const isBusinessCentre = store.attributes?.some((attr: any) => attr.value === 'Business Banking Centre');
    
        const matchesAtm = this.selectedTypes.includes('IsAtm') && isAtm;
        const matchesBranch = this.selectedTypes.includes('IsBranch') && isBranch;
        const matchesSmartId = this.selectedTypes.includes('SmartID') && hasSmartId;
        const matchesCash = this.selectedTypes.includes('CashAccepting') && isCashAccepting;
        const matchesBusiness = this.selectedTypes.includes('BusinessBankCenter') && isBusinessCentre;
    
        return matchesAtm || matchesBranch || matchesSmartId || matchesCash || matchesBusiness;
      });
    }
    

  
    return filteredStores || [];
  }
  
}
