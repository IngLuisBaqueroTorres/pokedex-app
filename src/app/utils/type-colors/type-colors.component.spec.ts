import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeColorsComponent } from './type-colors.component';

describe('TypeColorsComponent', () => {
  let component: TypeColorsComponent;
  let fixture: ComponentFixture<TypeColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeColorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
