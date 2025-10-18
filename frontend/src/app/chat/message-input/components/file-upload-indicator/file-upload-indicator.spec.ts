import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadIndicator } from './file-upload-indicator';

describe('FileUploadIndicator', () => {
  let component: FileUploadIndicator;
  let fixture: ComponentFixture<FileUploadIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
