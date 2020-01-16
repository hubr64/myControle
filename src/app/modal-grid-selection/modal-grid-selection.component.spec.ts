import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGridSelectionComponent } from './modal-grid-selection.component';

describe('ModalGridSelectionComponent', () => {
  let component: ModalGridSelectionComponent;
  let fixture: ComponentFixture<ModalGridSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalGridSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGridSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
