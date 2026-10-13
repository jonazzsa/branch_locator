import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchLocator } from './branch-locator';

describe('BranchLocator', () => {
  let component: BranchLocator;
  let fixture: ComponentFixture<BranchLocator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchLocator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchLocator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
