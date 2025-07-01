import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDetailModalComponent } from './pokemon-detail-modal.component';

describe('PokemonDetailModalComponent', () => {
  let component: PokemonDetailModalComponent;
  let fixture: ComponentFixture<PokemonDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
