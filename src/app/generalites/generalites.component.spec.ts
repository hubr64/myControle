import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralitesComponent } from './generalites.component';

describe('GeneralitesComponent', () => {
  let component: GeneralitesComponent;
  let fixture: ComponentFixture<GeneralitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
