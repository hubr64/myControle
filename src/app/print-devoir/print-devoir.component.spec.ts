import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDevoirComponent } from './print-devoir.component';

describe('PrintDevoirComponent', () => {
  let component: PrintDevoirComponent;
  let fixture: ComponentFixture<PrintDevoirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDevoirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDevoirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
