import { TestBed } from '@angular/core/testing';

import { DevoirService } from './devoir.service';

describe('DevoirService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DevoirService = TestBed.get(DevoirService);
    expect(service).toBeTruthy();
  });
});
