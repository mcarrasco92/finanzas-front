import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTDC } from './lista-tdc';

describe('ListaTDC', () => {
  let component: ListaTDC;
  let fixture: ComponentFixture<ListaTDC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTDC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaTDC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
