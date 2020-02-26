import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintNotationsComponent } from './print-notations.component';

describe('PrintNotationsComponent', () => {
  let component: PrintNotationsComponent;
  let fixture: ComponentFixture<PrintNotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintNotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintNotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
