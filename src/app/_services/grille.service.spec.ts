import { TestBed } from '@angular/core/testing';

import { GrilleService } from './grille.service';

describe('GrilleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GrilleService = TestBed.get(GrilleService);
    expect(service).toBeTruthy();
  });
});
