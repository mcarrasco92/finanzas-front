import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDebito } from './form-debito';

describe('FormDebito', () => {
  let component: FormDebito;
  let fixture: ComponentFixture<FormDebito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDebito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDebito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
