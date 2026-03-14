import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocksDesigns } from './rocks-designs';

describe('RocksDesigns', () => {
  let component: RocksDesigns;
  let fixture: ComponentFixture<RocksDesigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RocksDesigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RocksDesigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
