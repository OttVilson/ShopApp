import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {

  constructor(private db: AngularFirestore, private router: Router) { }

  onClick() {
    this.router.navigate(['admin', 'products', 'edit'], { queryParams: { id: 'UroqnkWOMfT80Cqioc0V' }});
    // this.db.collection('products').add({
    //   item: 'item',
    //   dela: 'asda'
    // });
  }

  onButton() {
    let items = this.db.collection('products').valueChanges();
    items.subscribe(
      res => console.log(res)
    )
  }

}