import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowRight } from './arrow-right';

describe('ArrowRight', () => {
  let component: ArrowRight;
  let fixture: ComponentFixture<ArrowRight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowRight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrowRight);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
