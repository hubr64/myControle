import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoirEditionComponent } from './devoir-edition.component';

describe('DevoirEditionComponent', () => {
  let component: DevoirEditionComponent;
  let fixture: ComponentFixture<DevoirEditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevoirEditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevoirEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
