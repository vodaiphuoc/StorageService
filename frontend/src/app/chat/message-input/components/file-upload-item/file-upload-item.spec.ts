import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadItem } from './file-upload-item';

describe('FileUploadItem', () => {
  let component: FileUploadItem;
  let fixture: ComponentFixture<FileUploadItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
