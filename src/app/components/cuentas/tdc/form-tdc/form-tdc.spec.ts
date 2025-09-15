import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTDC } from './form-tdc';

describe('FormTDC', () => {
  let component: FormTDC;
  let fixture: ComponentFixture<FormTDC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTDC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTDC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
