import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsiModal } from './msi-modal';

describe('MsiModal', () => {
  let component: MsiModal;
  let fixture: ComponentFixture<MsiModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsiModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsiModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
