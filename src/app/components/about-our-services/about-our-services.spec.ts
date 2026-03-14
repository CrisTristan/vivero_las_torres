import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutOurServices } from './about-our-services';

describe('AboutOurServices', () => {
  let component: AboutOurServices;
  let fixture: ComponentFixture<AboutOurServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutOurServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutOurServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
