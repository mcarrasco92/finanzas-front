import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragIcon } from './drag-icon';

describe('DragIcon', () => {
  let component: DragIcon;
  let fixture: ComponentFixture<DragIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
