import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDetails } from './pokemon-details';

describe('PokemonDetails', () => {
  let component: PokemonDetails;
  let fixture: ComponentFixture<PokemonDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
