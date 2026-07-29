import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSettings } from './collection-settings';

describe('CollectionSettings', () => {
  let component: CollectionSettings;
  let fixture: ComponentFixture<CollectionSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
