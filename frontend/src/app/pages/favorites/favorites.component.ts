import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Listing } from '../../models/listing.model';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, ListingCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  favorites: Listing[] = [];
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites = favs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
