import { Routes } from '@angular/router';
import { ProductCatalog } from './components/product-catalog/product-catalog';
import { HomeComponent } from './components/home-component/home-component';
import { ChatBot } from './components/chat-bot/chat-bot';
import { PlantDesignDashboard } from './pages/plant-design-dashboard/plant-design-dashboard';
import { ShoppingCartPage } from './pages/shopping-cart-page/shopping-cart-page';
import { ProductDetailsPage } from './pages/product-details-page/product-details-page';
import { PaymentComponent } from './components/payment-component/payment-component';
import { SuccessPaymentPage } from './pages/success-payment-page/success-payment-page';
import { LogInPage } from './pages/log-in-page/log-in-page';
import { RegisterPage } from './pages/register-page/register-page';
import {authGuard} from "./Guards/auth-guard";
import {UserAccountPage} from "./pages/user-account-page/user-account-page";

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Inicio',
    },
    {
        path: 'productCatalog',
        component: ProductCatalog,
        title: 'Catálogo de Productos',
    },
    {
        path: 'chatBot',
        component: ChatBot,
        title: 'Chat Bot',
    },
    {
        path: 'plantDesignDashboard',
        component: PlantDesignDashboard,
        title: 'Arreglo Personalizado',
        canActivate: [authGuard]
    },
    {
        path: 'shoppingCart',
        component: ShoppingCartPage,
        title: 'Carrito de Compras',
        canActivate: [authGuard]
    },
    {
        path: 'product-details',
        component: ProductDetailsPage,
        title: 'Detalles del Producto',
    },
    {
        path: 'payment',
        component: PaymentComponent,
        title: 'Pago',
        canActivate: [authGuard]
    },
    {
        path: 'success-payment',
        component: SuccessPaymentPage,
        title: 'Pago Exitoso',
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: LogInPage,
        title: 'Iniciar Sesión',
    },
    {
        path: 'register',
        component: RegisterPage,
        title: 'Registrarse',
    },
    {
        path: 'userAccount',
        component: UserAccountPage,
        title: 'Mi Cuenta',
        canActivate: [authGuard]
    }
];
