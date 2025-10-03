import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftIcon } from './left-icon';

describe('LeftIcon', () => {
  let component: LeftIcon;
  let fixture: ComponentFixture<LeftIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
