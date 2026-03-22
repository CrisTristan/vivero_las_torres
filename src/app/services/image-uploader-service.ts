import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageUploaderService {
    private fileImage: File | null = null;
    private imageUrl: string | null = null;
    private folder: string = '';

    // Muy importante para saber en que categoria se esta creando el producto, para asi subir la imagen a la carpeta correcta en cloudinary
    public currectCategoryOnPanelAdminProductos = signal<string>('');
    // public tipoProductoOnPanelAdminProductos = signal<string>('');//este signal es para saber si el producto que se esta creando en la subcarpeta correcta dentro de la carpeta de la categoria en cloudinary, por ejemplo: ViveroLasTorres/plantas/interior o ViveroLasTorres/plantas/exterior
    constructor() {}

    set setFileImage(file: File | null) {
        this.fileImage = file;
    }

    set setImageUrl(url: string | null) {
        this.imageUrl = url;
    }

    set setFolder(folder: string) {
        this.folder = folder;
    }

    get getFileImage(): File | null {
        return this.fileImage;
    }

    get getImageUrl(): string | null {
        return this.imageUrl;
    }

    get getFolder(): string {
        return this.folder;
    }

}
