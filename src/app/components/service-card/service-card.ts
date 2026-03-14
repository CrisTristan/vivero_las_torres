import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-card',
  imports: [],
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard {

   @Input() serviceIcon: HTMLElement = document.createElement('span');
  @Input() serviceName = '';
  @Input() serviceDescription = '';
  @Input() serviceFeatures: string[] = [];
  @Input() servicePrice=0;

  
}
