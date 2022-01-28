import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../model/model';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent {

  products$: Observable<Product[]>;

  constructor(dbService: DatabaseService) {
    this.products$ = dbService.products$;
  }
}
