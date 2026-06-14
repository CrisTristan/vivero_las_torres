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
    {src: 'https://res.cloudinary.com/dns3p07as/image/upload/v1781402996/Jardin_1_yjfesq.jpg', alt: 'Jardin 1', title: 'Jardín Tropical', location: 'Galaxias del Sol', description: 'Un espacio de tranquilidad y armonía con plantas cuidadosamente seleccionadas.'},
    {src: 'https://i.pinimg.com/originals/ef/b2/96/efb296cda5b28641e48d06ea34ac3ad9.jpg', alt: 'Jardin 2', title: 'Jardín Tropical', location: 'Selva Encantada', description: 'Un rincón exótico con plantas tropicales que aportan color y vitalidad.'},
    {src: 'https://images.homify.com/v1438194588/p/photo/image/781299/P1020967.jpg', alt: 'Jardin 3', title: 'Jardín Minimalista', location: 'Ciudad Jardinera', description: 'Un diseño elegante y sencillo que destaca la belleza natural de las plantas.'}
  ];

  protected openWhatsApp(): void {
    const phoneNumber = '5219984990394';
    const message = encodeURIComponent(
      '¡Hola! Estoy interesado en sus plantas y servicios de jardinería.',
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  }
}
