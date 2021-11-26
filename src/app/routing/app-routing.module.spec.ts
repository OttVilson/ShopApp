import { HomeComponent } from '../home/home.component';
import { MyOrdersComponent } from '../my-orders/my-orders.component';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { ROUTES } from './app-routing.module';

describe('Routing module', () => {

    it('should have HomeComponent assigned to empty path', () => {
        expect(ROUTES).withContext('Tere Tere').toContain({ path: 'sdf', component: HomeComponent });
    })

    it('should have MyOrdersComponent assigned to the path /my-orders', () => {
        expect(ROUTES).toContain({ path: 'my-orders', component: MyOrdersComponent });
    })

    it('should have ShoppingCartComponent assigned to the path /shopping-cart', () => {
        expect(ROUTES).toContain({ path: 'shopping-cart', component: ShoppingCartComponent });
    })

    it('should redirect all other paths to empty path, i.e., home component', () => {
        expect(ROUTES).toContain({ path: '**', redirectTo: '' });
    })
})