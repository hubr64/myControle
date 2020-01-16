import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmClasseComponent } from './modal-confirm-classe.component';

describe('ModalConfirmClasseComponent', () => {
  let component: ModalConfirmClasseComponent;
  let fixture: ComponentFixture<ModalConfirmClasseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmClasseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
