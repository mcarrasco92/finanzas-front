import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowLeftRight } from './arrow-left-right';

describe('ArrowLeftRight', () => {
  let component: ArrowLeftRight;
  let fixture: ComponentFixture<ArrowLeftRight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowLeftRight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrowLeftRight);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
