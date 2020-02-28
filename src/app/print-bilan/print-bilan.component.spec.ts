import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBilanComponent } from './print-bilan.component';

describe('PrintBilanComponent', () => {
  let component: PrintBilanComponent;
  let fixture: ComponentFixture<PrintBilanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintBilanComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintBilanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
