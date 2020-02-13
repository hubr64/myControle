import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCorrectionComponent } from './print-correction.component';

describe('PrintCorrectionComponent', () => {
  let component: PrintCorrectionComponent;
  let fixture: ComponentFixture<PrintCorrectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintCorrectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
