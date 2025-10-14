import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checks } from './checks';

describe('Checks', () => {
  let component: Checks;
  let fixture: ComponentFixture<Checks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Checks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
