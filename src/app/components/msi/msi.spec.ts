import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Msi } from './msi';

describe('Msi', () => {
  let component: Msi;
  let fixture: ComponentFixture<Msi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Msi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Msi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
