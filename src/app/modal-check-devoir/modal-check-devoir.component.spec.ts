import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCheckDevoirComponent } from './modal-check-devoir.component';

describe('ModalCheckDevoirComponent', () => {
  let component: ModalCheckDevoirComponent;
  let fixture: ComponentFixture<ModalCheckDevoirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCheckDevoirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCheckDevoirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
