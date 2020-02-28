import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPrintBilanComponent } from './modal-print-bilan.component';

describe('ModalPrintNotationsComponent', () => {
  let component: ModalPrintBilanComponent;
  let fixture: ComponentFixture<ModalPrintBilanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPrintBilanComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPrintBilanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
