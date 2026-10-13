import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchMap } from './branch-map';

describe('BranchMap', () => {
  let component: BranchMap;
  let fixture: ComponentFixture<BranchMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
