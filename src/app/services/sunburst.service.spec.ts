import { TestBed } from '@angular/core/testing';

import { SunburstService } from './sunburst.service';

describe('SunburstService', () => {
  let service: SunburstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunburstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
