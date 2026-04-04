import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ClientsComponent } from './clients/clients.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/clients', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/clients' }
];
