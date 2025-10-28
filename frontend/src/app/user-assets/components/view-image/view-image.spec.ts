import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewImage } from './view-image';

describe('ViewImage', () => {
  let component: ViewImage;
  let fixture: ComponentFixture<ViewImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
