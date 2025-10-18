import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFiles } from './add-files';

describe('AddFiles', () => {
  let component: AddFiles;
  let fixture: ComponentFixture<AddFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
