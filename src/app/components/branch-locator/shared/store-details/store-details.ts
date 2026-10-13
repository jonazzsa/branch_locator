import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Coordinates } from '../../../../models/coordinates';
import { Store } from '../../../../models/store';

@Component({
  selector: 'store-details',
  imports: [],
  templateUrl: './store-details.html',
  styleUrl: './store-details.css',
})
export class StoreDetails {
@Input() store!: Store;
@Input() position!: number;
@Output() zoomToEmit: any = new EventEmitter();
@Input() bgColor: string = '#ffffff';

public onZoomTo(longitude: string, latitude: string){
  this.zoomToEmit.emit({ longitude, latitude });

}

public getDirection(googleDirectionsLink: string = ""){
  window.open(googleDirectionsLink, '_blank', 'noopener,noreferrer');
}
}
