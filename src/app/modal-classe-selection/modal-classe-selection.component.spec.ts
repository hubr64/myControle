import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClasseSelectionComponent } from './modal-classe-selection.component';

describe('ModalClasseSelectionComponent', () => {
  let component: ModalClasseSelectionComponent;
  let fixture: ComponentFixture<ModalClasseSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalClasseSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalClasseSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
