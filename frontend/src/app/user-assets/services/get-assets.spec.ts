import { TestBed } from '@angular/core/testing';

import { GetAssets } from './get-assets';

describe('GetAssets', () => {
  let service: GetAssets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAssets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
