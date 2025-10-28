import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFolder } from './view-folder';

describe('ViewFolder', () => {
  let component: ViewFolder;
  let fixture: ComponentFixture<ViewFolder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFolder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFolder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
