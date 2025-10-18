import { TestBed } from '@angular/core/testing';

import { FileCheck } from './file-check';

describe('FileCheck', () => {
  let service: FileCheck;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileCheck);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
