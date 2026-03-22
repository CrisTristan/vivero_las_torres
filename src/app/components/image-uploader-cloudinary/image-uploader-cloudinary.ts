import { Component, inject, Input, signal } from '@angular/core';
import { sign } from 'crypto';
import { urlencoded } from 'express';
import {ImageUploaderController} from '../../controllers/image_uploader_controller';
import { ImageUploaderService } from '../../services/image-uploader-service';

@Component({
  selector: 'app-image-uploader-cloudinary',
  imports: [],
  templateUrl: './image-uploader-cloudinary.html',
  styleUrl: './image-uploader-cloudinary.css',
})
export class ImageUploaderCloudinary {


  public imageUrl = signal<string | null>(null); // Signal para almacenar la URL de la imagen subida
  public folder = signal<string>(''); // Carpeta predeterminada para subir las imágenes
  private imageUploaderService = inject(ImageUploaderService);

  @Input({ required: true }) currectCategory! : string; //este signal es para saber en que categoria se esta creando el producto, para asi subir la imagen a la carpeta correcta en cloudinary
  @Input({ required: true }) tipoProducto! : string; //este signal es para saber si el producto que se esta creando en la subcarpeta correcta dentro de la carpeta de la categoria en cloudinary, por ejemplo: ViveroLasTorres/plantas/interior o ViveroLasTorres/plantas/exterior


  async onCreateImageFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    console.log("Selected file:", file);
    
    const compressedImageUrl = await this.compressImageToDataUrl(file, 900, 900, 0.72);
    this.imageUrl.set(compressedImageUrl);

    this.imageUploaderService.setFileImage = file; //modificamos el servicio para almacenar el archivo seleccionado
  }

  openCreateFilePicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  private async compressImageToDataUrl(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number,
  ): Promise<string | null> {
    const imageDataUrl = await this.readFileAsDataUrl(file);

    if (!imageDataUrl) {
      return null;
    }

    const image = await this.loadImage(imageDataUrl);

    if (!image) {
      return null;
    }

    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', quality);
  }

  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  private loadImage(dataUrl: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });
  }
}
