import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAssets } from './user-assets';

describe('UserAssets', () => {
  let component: UserAssets;
  let fixture: ComponentFixture<UserAssets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAssets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAssets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
