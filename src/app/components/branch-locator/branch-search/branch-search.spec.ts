import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchSearch } from './branch-search';

describe('BranchSearch', () => {
  let component: BranchSearch;
  let fixture: ComponentFixture<BranchSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
