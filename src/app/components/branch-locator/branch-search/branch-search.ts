import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { Coordinates } from '../../../models/coordinates';
import { Store } from '../../../models/store';
import { StoreDetails } from '../shared/store-details/store-details';

@Component({
  selector: 'branch-search',
  imports: [StoreDetails],
  templateUrl: './branch-search.html',
  styleUrl: './branch-search.css',
})
export class BranchSearch {

@Input() stores!: Store[];
@Input() isLoading!: boolean;
@Output() searchStoresEmit = new EventEmitter();
@Output() zoomToEmit = new EventEmitter();
@Output() filterTypeEmit = new EventEmitter();
@Output() changeDistanceEmit = new EventEmitter();
public searchInputIsDirty = false;
public searchQuery!: string;
public centresFilterIsOpen = signal<boolean>(false);
private searchDebounceTimer: any;

public selectedDistance = signal<number>(0)
private selectedTypes: string[] = [];

public selectedTypesCount = signal<number>(0) ;

public filterByDistance(distance: number){
  this.selectedDistance.set(distance);
  this.changeDistanceEmit.emit(distance);
}


public toggleCentresFilter(){
  this.centresFilterIsOpen.update(value => !value);
}

public onSearchBranch(e: any) {
  this.isLoading = true;
  const value = e.target.value;
  this.searchQuery = value;
  this.searchInputIsDirty = !!value;

  if (this.searchDebounceTimer) {
    clearTimeout(this.searchDebounceTimer);
  }

  this.searchDebounceTimer = setTimeout(() => {
    this.searchStoresEmit.emit(value);
    this.isLoading = false;
  }, 500);
}
public onZoomTo(coordinates: Coordinates) {
  this.zoomToEmit.emit(coordinates);
}

public clearTypesCount(){
  this.selectedTypes = [];
  this.selectedTypesCount.set(0);
  this.filterTypeEmit.emit(this.selectedTypes);
}

public onTypeChange(event: any, type: string) {
  const checked = event.target.checked

  if (checked) {
    this.selectedTypes.push(type);
  } else {
    this.selectedTypes = this.selectedTypes.filter(t => t !== type);
  }

  this.selectedTypesCount.set(this.selectedTypes.length);
  
}

public isTypeChecked(type: string): boolean {
  return this.selectedTypes.includes(type);
}

public submitType(){
  this.filterTypeEmit.emit(this.selectedTypes);
  this.toggleCentresFilter();
}

public cancelType(){
  this.filterTypeEmit.emit([]);
  this.toggleCentresFilter();
}



}
