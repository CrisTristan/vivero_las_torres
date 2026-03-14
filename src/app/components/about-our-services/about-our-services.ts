import { Component, Input } from '@angular/core';
import { ServiceCard } from '../service-card/service-card';
@Component({
  selector: 'app-about-our-services',
  imports: [ServiceCard],
  templateUrl: './about-our-services.html',
  styleUrl: './about-our-services.css',
})
export class AboutOurServices {

  handleWhatsAppClick() {
    const phoneNumber = '5219984990394'; // Reemplaza con tu número de teléfono
    const message = encodeURIComponent('¡Hola! Estoy interesado en sus servicios de jardinería.'); // Mensaje predefinido
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
}
