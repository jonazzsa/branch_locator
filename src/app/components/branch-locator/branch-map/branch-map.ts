
import {
  Component,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  PLATFORM_ID,
  inject,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import OlMap from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import type { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import type { Extent } from 'ol/extent';

import {
  Style,
  Icon,
  Text,
  Fill,
  Stroke,
  Circle as CircleStyle
} from 'ol/style';

import { Coordinates } from '../../../models/coordinates';
import { Store } from '../../../models/store';
import { StoreDetails } from '../shared/store-details/store-details';

type StoreFeature = Feature<Point>;

type MapCoordinates = {
  latitude: string | number;
  longitude: string | number;
};

@Component({
  selector: 'branch-map',
  standalone: true,
  imports: [StoreDetails],
  templateUrl: './branch-map.html',
  styleUrl: './branch-map.css'
})
export class BranchMap implements AfterViewInit, OnChanges, OnDestroy {

  @Input() stores: Store[] = [];
  @Input() coordinates?: Coordinates | null;

  @Output() closeStoreDetailsEmitter: EventEmitter<void> =
    new EventEmitter<void>();

  private readonly platformId: object = inject(PLATFORM_ID);

  private map?: OlMap;
  private vectorSource?: VectorSource<StoreFeature>;
  private clusterSource?: Cluster<StoreFeature>;

  private branchStyle?: Style;

  private isMapInitialized: boolean = false;
  private isDestroyed: boolean = false;

  private populateVersion: number = 0;
  private viewVersion: number = 0;

  private populateTimer?: ReturnType<typeof setTimeout>;
  private fitTimer?: ReturnType<typeof setTimeout>;

  private readonly clusterStyleCache: globalThis.Map<number, Style> =
    new globalThis.Map<number, Style>();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isMapInitialized || this.isDestroyed) return;

    const storesChanged: boolean = !!changes['stores'];
    const coordinatesChanged: boolean = !!changes['coordinates'];

    if (coordinatesChanged) {
      this.cancelPendingFit();
      this.viewVersion++;
      this.map?.getView().cancelAnimations();
    }

    if (storesChanged) {
      void this.populatePins();
    }

    

    if (coordinatesChanged) {
      if (this.coordinates) {
        void this.zoomTo(this.coordinates);
      } else if (!storesChanged) {
        this.fitMapToMarkers();
      }
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.isMapInitialized = false;

    this.populateVersion++;
    this.viewVersion++;

    this.cancelPendingFit();

    if (this.populateTimer) {
      clearTimeout(this.populateTimer);
      this.populateTimer = undefined;
    }

    this.map?.getView().cancelAnimations();
    this.clusterSource?.setSource(null);
    this.map?.setTarget(undefined);

    this.clusterStyleCache.clear();

    this.map = undefined;
    this.vectorSource = undefined;
    this.clusterSource = undefined;
  }

  public closeStoreDetails(): void {
    this.closeStoreDetailsEmitter.emit();
  }

  private cancelPendingFit(): void {
    if (this.fitTimer) {
      clearTimeout(this.fitTimer);
      this.fitTimer = undefined;
    }
  }

  private initializeMap(): void {
    this.branchStyle = new Style({
      image: new Icon({
        src: 'https://s3-eu-west-1.amazonaws.com/goreview-eb/uploads/local-pages/5216d1ca775be61f19b17a21c4776025/9Wi6jm2C.svg',
        scale: 0.2,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });

    this.vectorSource = new VectorSource<StoreFeature>({
      useSpatialIndex: true
    });

    this.clusterSource = new Cluster<StoreFeature>({
      distance: 40,
      minDistance: 20,
      source: this.vectorSource
    });

    const vectorLayer: VectorLayer<Cluster<StoreFeature>> =
      new VectorLayer<Cluster<StoreFeature>>({
        source: this.clusterSource,
        style: this.getClusterStyle,
        updateWhileAnimating: false,
        updateWhileInteracting: false
      });

    this.map = new OlMap({
      target: 'ol-map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([24.5, -28.5]),
        zoom: 5,
        maxZoom: 18,
        minZoom: 2,
        constrainResolution: true
      })
    });

    this.isMapInitialized = true;

    if (this.coordinates) {
      void this.zoomTo(this.coordinates);
    }

    this.populateTimer = setTimeout((): void => {
      this.populateTimer = undefined;

      if (this.isDestroyed) return;

      this.map?.updateSize();
      void this.populatePins();
    }, 50);
  }

  private readonly getClusterStyle = (
    feature: FeatureLike
  ): Style | undefined => {
    const features: StoreFeature[] | undefined =
      feature.get('features') as StoreFeature[] | undefined;

    if (!features?.length) {
      return undefined;
    }

    const size: number = features.length;

    if (size === 1) {
      return this.branchStyle;
    }

    let style: Style | undefined =
      this.clusterStyleCache.get(size);

    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({
            color: '#00486D'
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: 'white'
          }),
          font: 'bold 12px sans-serif'
        })
      });

      this.clusterStyleCache.set(size, style);
    }

    return style;
  };

  private async populatePins(
    autoFit: boolean = true
  ): Promise<void> {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.isMapInitialized ||
      this.isDestroyed ||
      !this.vectorSource
    ) {
      return;
    }

    const currentVersion: number = ++this.populateVersion;

    this.cancelPendingFit();

    if (!this.stores?.length) {
      this.vectorSource.clear();
      return;
    }

    const storesSnapshot: Store[] = [...this.stores];

    try {
      const featuresBatch: StoreFeature[] = [];

      for (const branch of storesSnapshot) {
        if (
          branch.longitude == null ||
          branch.latitude == null ||
          String(branch.longitude).trim() === '' ||
          String(branch.latitude).trim() === ''
        ) {
          continue;
        }

        const lon: number = Number(branch.longitude);
        const lat: number = Number(branch.latitude);

        if (
          !Number.isFinite(lon) ||
          !Number.isFinite(lat) ||
          lon < -180 ||
          lon > 180 ||
          lat < -90 ||
          lat > 90
        ) {
          continue;
        }

        const feature: StoreFeature = new Feature<Point>({
          geometry: new Point(fromLonLat([lon, lat])),
          name: branch.name,
          branch
        });

        featuresBatch.push(feature);
      }

      if (
        this.isDestroyed ||
        currentVersion !== this.populateVersion ||
        !this.vectorSource
      ) {
        return;
      }

      this.vectorSource.clear(true);
      this.vectorSource.addFeatures(featuresBatch);

      if (autoFit && !this.coordinates) {
        const scheduledViewVersion: number = this.viewVersion;

        this.fitTimer = setTimeout((): void => {
          this.fitTimer = undefined;

          if (
            this.isDestroyed ||
            currentVersion !== this.populateVersion ||
            scheduledViewVersion !== this.viewVersion ||
            this.coordinates
          ) {
            return;
          }

          this.fitMapToMarkers();
        }, 50);
      }

    } catch (error: unknown) {
      if (!this.isDestroyed) {
        console.error('Error populating pins:', error);
      }
    }
  }

  private fitMapToMarkers(force: boolean = false): void {
    if (
      !this.map ||
      !this.vectorSource ||
      this.isDestroyed ||
      (!force && this.coordinates)
    ) {
      return;
    }

    if (this.vectorSource.isEmpty()) return;

    try {
      const extent: Extent = this.vectorSource.getExtent();

      if (!extent.every(Number.isFinite)) {
        return;
      }

      this.map.updateSize();

      this.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 400,
        maxZoom: 14
      });

    } catch (error: unknown) {
      console.warn('Fit mapping process delayed', error);
    }
  }

  public async zoomTo(
    coordinates: MapCoordinates,
    zoomLevel: number = 15
  ): Promise<void> {
    if (!this.map || !coordinates || this.isDestroyed) {
      return;
    }

    const currentViewVersion: number = ++this.viewVersion;

    this.cancelPendingFit();

    try {
      const longitude: number = Number(coordinates.longitude);
      const latitude: number = Number(coordinates.latitude);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        return;
      }

      if (
        this.isDestroyed ||
        !this.map ||
        currentViewVersion !== this.viewVersion
      ) {
        return;
      }

      const view: View = this.map.getView();

      const targetCenter: Coordinate =
        fromLonLat([longitude, latitude]);

      view.cancelAnimations();
      this.map.updateSize();

      const mapSize: number[] | undefined =
        this.map.getSize();

      if (!mapSize || mapSize[1] <= 0) return;

      const resolution: number =
        view.getResolutionForZoom(zoomLevel);

      const coordinateOffset: number =
        mapSize[1] * resolution * 0.25;

      const offsetCenter: Coordinate = [
        targetCenter[0],
        targetCenter[1] + coordinateOffset
      ];

      view.animate({
        center: offsetCenter,
        zoom: zoomLevel,
        duration: 500
      });

    } catch (error: unknown) {
      if (!this.isDestroyed) {
        console.error('Error zooming to coordinates:', error);
      }
    }
  }

  public async refresh(): Promise<void> {
    if (!this.isMapInitialized || this.isDestroyed) {
      return;
    }

    this.cancelPendingFit();
    this.viewVersion++;

    this.map?.getView().cancelAnimations();

    await this.populatePins(false);

    if (!this.isDestroyed) {
      this.fitMapToMarkers(true);
      this.map?.updateSize();
    }
  }
}
