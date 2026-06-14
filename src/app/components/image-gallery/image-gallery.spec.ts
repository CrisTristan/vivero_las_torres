import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGallery } from './image-gallery';

describe('ImageGallery', () => {
  let component: ImageGallery;
  let fixture: ComponentFixture<ImageGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and navigate through the supplied images', () => {
    component.images = [
      { src: '/images/garden-1.webp', alt: 'Jardín residencial' },
      { src: '/images/garden-2.webp', alt: 'Terraza con plantas' }
    ];

    component['openImage'](0);
    expect(component['activeImage']?.alt).toBe('Jardín residencial');

    component['showNext']();
    expect(component['activeImage']?.alt).toBe('Terraza con plantas');

    component['closeImage']();
    expect(component['activeImage']).toBeNull();
  });
});
