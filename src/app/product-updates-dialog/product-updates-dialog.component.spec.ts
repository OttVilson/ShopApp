import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductUpdatesDialogComponent } from './product-updates-dialog.component';

describe('ProductUpdatesDialogComponent', () => {
  let component: ProductUpdatesDialogComponent;
  let fixture: ComponentFixture<ProductUpdatesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductUpdatesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductUpdatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
