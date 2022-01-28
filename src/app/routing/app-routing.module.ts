import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { InvalidRouteGuard } from './guards/invalid-route.guard';

import { MyOrdersComponent } from '../my-orders/my-orders.component';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { LoginComponent } from '../login/login.component';
import { LogoutComponent } from '../logout/logout.component';
import { AntiAuthGuard } from './guards/anti-auth.guard';
import { ProductsComponent } from '../products/products.component';
import { OrdersComponent } from '../orders/orders.component';
import { StoreComponent } from '../store/store.component';
import { ProductEditComponent } from '../product-edit/product-edit.component';

export const ROUTES = [
  { 
    path: '', 
    component: StoreComponent, 
    pathMatch: 'full',
    data: {
      menuItem: {
        text: 'Store',
        icon: 'store'
      }
    }
  },
  { 
    path: 'shopping-cart', 
    component: ShoppingCartComponent, 
    canActivate: [ AuthGuard ],
    data: {
      canActivateForMenu: [],
      menuItem: {
        text: 'Shopping Cart',
        icon: 'shopping_cart',
        shortcut: true
      }
    }
  },
  { 
    path: 'my-orders', 
    component: MyOrdersComponent,
    canActivate: [ AuthGuard ],
    data: {
      menuItem: {
        text: 'My Orders',
        icon: 'format_list_numbered'
      }
    }
  },
  {
    path: 'admin',
    canActivate: [],
    children: [
      {
        path: 'orders',
        component: OrdersComponent,
        data: {
          menuItem: {
            text: 'Orders',
            icon: 'library_books'
          }
        }
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            component: ProductsComponent,
            data: {
              menuItem: {
                text: 'Products',
                icon: 'storage'
              }
            }
          },
          {
            path: 'edit',
            component: ProductEditComponent
          }
        ]
      }
    ]
  },
  { 
    path: 'login', 
    component: LoginComponent,
    data: {
      canActivateForMenu: [ AntiAuthGuard ],
      menuItem: {
        text: 'Log In',
        icon: 'fingerprint',
        shortcut: true
      }
    }
  },
  {
    path: 'logout',
    component: LogoutComponent,
    data: {
      canActivateForMenu: [ AuthGuard ],
      menuItem: {
        text: 'Log Out',
        icon: 'exit_to_app'
      }
    }
  },
  { path: '**', component: StoreComponent, canActivate: [ InvalidRouteGuard ]}
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(ROUTES, { enableTracing: false })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}