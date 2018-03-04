import { TestBed, inject } from '@angular/core/testing';

import { EsService } from './es.service';

describe('EsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EsService]
    });
  });

  it('should be created', inject([EsService], (service: EsService) => {
    expect(service).toBeTruthy();
  }));
});
