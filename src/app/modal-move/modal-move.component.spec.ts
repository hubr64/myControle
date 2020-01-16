import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMoveComponent } from './modal-move.component';

describe('ModalMoveComponent', () => {
  let component: ModalMoveComponent;
  let fixture: ComponentFixture<ModalMoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
