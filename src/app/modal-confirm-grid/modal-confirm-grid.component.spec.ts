import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmGridComponent } from './modal-confirm-grid.component';

describe('ModalConfirmGridComponent', () => {
  let component: ModalConfirmGridComponent;
  let fixture: ComponentFixture<ModalConfirmGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
