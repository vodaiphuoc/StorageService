import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Authen } from './authen';

describe('Authen', () => {
  let component: Authen;
  let fixture: ComponentFixture<Authen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Authen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Authen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
