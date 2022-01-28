import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { AppRoutingModule } from './routing/app-routing.module';
import { NavComponent } from './nav/nav.component';
import { ShortcutNavDirective } from './directives/shortcut-nav.directive';
import { MenuService } from './services/menu.service';

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ProductsComponent } from './products/products.component';
import { OrdersComponent } from './orders/orders.component';
import { StoreComponent } from './store/store.component';
import { AuthService } from './services/auth.service';
import { DatabaseService } from './services/database.service';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from './services/spinner.service';
import { ProductUpdatesDialogComponent } from './product-updates-dialog/product-updates-dialog.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { MaterialComponentsModule } from './material-components.module';
import { CurrencyPipe } from '@angular/common';
import { NgxDataSourceModule } from 'ngx-data-source';
import { NgxDataSourceMaterialPluginsModule } from 'ngx-data-source-material-plugins';


@NgModule({
  declarations: [
    AppComponent,
    ShoppingCartComponent,
    MyOrdersComponent,
    NavComponent,
    ShortcutNavDirective,
    LoginComponent,
    LogoutComponent,
    ProductsComponent,
    OrdersComponent,
    StoreComponent,
    ProductEditComponent,
    ProductUpdatesDialogComponent,
    ProductCardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialComponentsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDataSourceModule,
    NgxDataSourceMaterialPluginsModule
  ],
  providers: [
    MenuService,
    AuthService,
    DatabaseService,
    SpinnerService,
    CurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
