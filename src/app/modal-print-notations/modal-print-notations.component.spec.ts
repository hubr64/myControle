import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPrintNotationsComponent } from './modal-print-notations.component';

describe('ModalPrintNotationsComponent', () => {
  let component: ModalPrintNotationsComponent;
  let fixture: ComponentFixture<ModalPrintNotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPrintNotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPrintNotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
