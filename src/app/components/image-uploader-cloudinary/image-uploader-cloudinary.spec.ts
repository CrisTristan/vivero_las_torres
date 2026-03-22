import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploaderCloudinary } from './image-uploader-cloudinary';

describe('ImageUploaderCloudinary', () => {
  let component: ImageUploaderCloudinary;
  let fixture: ComponentFixture<ImageUploaderCloudinary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploaderCloudinary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploaderCloudinary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
