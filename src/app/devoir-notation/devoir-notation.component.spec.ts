import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevoirNotationComponent } from './devoir-notation.component';

describe('DevoirNotationComponent', () => {
  let component: DevoirNotationComponent;
  let fixture: ComponentFixture<DevoirNotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevoirNotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevoirNotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
