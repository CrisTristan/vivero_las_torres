import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { AboutOurServices } from '../about-our-services/about-our-services';

@Component({
  selector: 'app-home-component',
  imports: [Hero, AboutOurServices],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {

}
