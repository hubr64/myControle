import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditGroupComponent } from './modal-edit-group.component';

describe('ModalEditGroupComponent', () => {
  let component: ModalEditGroupComponent;
  let fixture: ComponentFixture<ModalEditGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEditGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
