import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightIcon } from './right-icon';

describe('RightIcon', () => {
  let component: RightIcon;
  let fixture: ComponentFixture<RightIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
