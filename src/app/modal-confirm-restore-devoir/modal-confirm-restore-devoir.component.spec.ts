import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmRestoreDevoirComponent } from './modal-confirm-restore-devoir.component';

describe('ModalConfirmRestoreDevoirComponent', () => {
  let component: ModalConfirmRestoreDevoirComponent;
  let fixture: ComponentFixture<ModalConfirmRestoreDevoirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmRestoreDevoirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmRestoreDevoirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
