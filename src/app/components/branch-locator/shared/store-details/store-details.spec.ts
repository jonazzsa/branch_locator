import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetails } from './store-details';

describe('StoreDetails', () => {
  let component: StoreDetails;
  let fixture: ComponentFixture<StoreDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
