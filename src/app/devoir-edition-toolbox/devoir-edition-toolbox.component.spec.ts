import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoirEditionToolboxComponent } from './devoir-edition-toolbox.component';

describe('DevoirEditionToolboxComponent', () => {
  let component: DevoirEditionToolboxComponent;
  let fixture: ComponentFixture<DevoirEditionToolboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevoirEditionToolboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevoirEditionToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
