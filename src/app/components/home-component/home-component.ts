import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {Hero} from "../hero/hero";
import {ImageGallery} from "../image-gallery/image-gallery";
import type {GalleryImage} from "../image-gallery/image-gallery";

@Component({
  selector: 'app-home-component',
  imports: [RouterLink, ImageGallery, Hero],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  galleryImages: GalleryImage[] = [
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781467923/Jardin_2_vh8r0f.jpg', alt: 'Jardin 1', title: 'Jardín Fresco', location: '', description: 'Un espacio de tranquilidad y armonía con plantas cuidadosamente seleccionadas.'},
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781467923/Jardin_4_yjsgy9.jpg', alt: 'Jardin 2', title: 'Jardín Tropical', location: '', description: 'Un rincón exótico con plantas tropicales que aportan color y vitalidad.'},
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781467923/Jardin_5_k7sbr2.jpg', alt: 'Jardin 3', title: 'Jardín Perpetuo', location: '', description: 'Un diseño elegante y sencillo que destaca la belleza natural de las plantas.'},
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781467923/Jardin_3_jidcin.jpg', alt: 'Jardin 4', title: 'Jardín Minimalista', location: '', description: 'Un espacio de meditación y relajación con plantas que transmiten serenidad.'},
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781402996/Jardin_1_yjfesq.jpg', alt: 'Jardin 5', title: 'Jardín Tropical', location: '', description: 'Plantas ornamentales y diseños naturales. Ideales para decorar entradas, pasillos, terrazas y áreas verdes, aportando frescura, elegancia y un toque especial a cualquier ambiente.'},
  ];

  protected openWhatsApp(): void {
    const phoneNumber = '5219984990394';
    const message = encodeURIComponent(
      '¡Hola! Estoy interesado en sus plantas y servicios de jardinería.',
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  }
}
