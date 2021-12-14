import { Component, Input } from '@angular/core';
import { Product } from '../model/model';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {

  @Input() product: Partial<Product> = {}; 

}
