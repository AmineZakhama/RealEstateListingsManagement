import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListingListComponent } from './pages/listing-list/listing-list.component';
import { ListingDetailComponent } from './pages/listing-detail/listing-detail.component';
import { ListingFormComponent } from './pages/listing-form/listing-form.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'listings', component: ListingListComponent },
  { path: 'listings/new', component: ListingFormComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'listings/:id/edit', component: ListingFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
