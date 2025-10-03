import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsMenu } from './options-menu';

describe('OptionsMenu', () => {
  let component: OptionsMenu;
  let fixture: ComponentFixture<OptionsMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
