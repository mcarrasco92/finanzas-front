import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalDots } from './vertical-dots';

describe('VerticalDots', () => {
  let component: VerticalDots;
  let fixture: ComponentFixture<VerticalDots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalDots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalDots);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
