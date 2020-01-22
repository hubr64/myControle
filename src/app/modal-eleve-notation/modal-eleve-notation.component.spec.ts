import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEleveNotationComponent } from './modal-eleve-notation.component';

describe('ModalEleveNotationComponent', () => {
  let component: ModalEleveNotationComponent;
  let fixture: ComponentFixture<ModalEleveNotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEleveNotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEleveNotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
