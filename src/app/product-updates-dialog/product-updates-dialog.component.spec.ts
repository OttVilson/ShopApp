import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';

import { ProductUpdatesDialogComponent } from './product-updates-dialog.component';


describe('ProductUpdatesDialogComponent', () => {
  let component: ProductUpdatesDialogComponent;
  let fixture: ComponentFixture<ProductUpdatesDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductUpdatesDialogComponent ],
      imports: [ 
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ProductUpdatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have Angular material dialog title, context, and actions part', () => {
    const title = fixture.debugElement.query(By.css('.mat-dialog-title'));
    expect(title).toBeTruthy();
    
    const content = fixture.debugElement.query(By.css('.mat-dialog-content'));
    expect(content).toBeTruthy();

    const actions = fixture.debugElement.query(By.css('.mat-dialog-actions'));
    expect(actions).toBeTruthy();
  })
});
