import { TestBed } from '@angular/core/testing';

import { ChunkUpload } from './chunk-upload';

describe('ChunkUpload', () => {
  let service: ChunkUpload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChunkUpload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
