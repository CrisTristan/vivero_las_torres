import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  location?: string;
  description?: string;
}

@Component({
  selector: 'app-image-gallery',
  imports: [],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
})
export class ImageGallery {
  @Input() eyebrow = 'Proyectos realizados';
  @Input() title = 'Jardines que hablan por sí solos';
  @Input() description =
    'Una selección de espacios que hemos transformado con diseño, vegetación y atención a cada detalle.';
  @Input() images: GalleryImage[] = [];
  @Input() showCaptions = true;

  @Output() readonly imageSelected = new EventEmitter<GalleryImage>();

  protected selectedIndex: number | null = null;

  protected get activeImage(): GalleryImage | null {
    return this.selectedIndex === null ? null : (this.images[this.selectedIndex] ?? null);
  }

  protected openImage(index: number): void {
    const image = this.images[index];

    if (!image) {
      return;
    }

    this.selectedIndex = index;
    this.imageSelected.emit(image);
  }

  protected closeImage(): void {
    this.selectedIndex = null;
  }

  protected showPrevious(event?: Event): void {
    event?.stopPropagation();

    if (this.selectedIndex === null || this.images.length < 2) {
      return;
    }

    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
  }

  protected showNext(event?: Event): void {
    event?.stopPropagation();

    if (this.selectedIndex === null || this.images.length < 2) {
      return;
    }

    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
  }

  @HostListener('document:keydown', ['$event'])
  protected handleKeyboard(event: KeyboardEvent): void {
    if (this.selectedIndex === null) {
      return;
    }

    if (event.key === 'Escape') {
      this.closeImage();
    } else if (event.key === 'ArrowLeft') {
      this.showPrevious();
    } else if (event.key === 'ArrowRight') {
      this.showNext();
    }
  }
}
