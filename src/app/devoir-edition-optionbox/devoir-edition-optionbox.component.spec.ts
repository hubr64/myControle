import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoirEditionOptionboxComponent } from './devoir-edition-optionbox.component';

describe('DevoirEditionOptionboxComponent', () => {
  let component: DevoirEditionOptionboxComponent;
  let fixture: ComponentFixture<DevoirEditionOptionboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevoirEditionOptionboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevoirEditionOptionboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
