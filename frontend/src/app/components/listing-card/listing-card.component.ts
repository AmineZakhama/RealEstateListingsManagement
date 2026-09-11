import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Listing } from '../../models/listing.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.css'
})
export class ListingCardComponent implements OnInit {
  @Input() listing!: Listing;
  firstImage: string = '';
  isFavorite: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.listing && this.listing.images && this.listing.images.length > 0) {
      this.firstImage = `http://localhost:5000${this.listing.images[0]}`;
    } else {
      this.firstImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
    }

    this.authService.currentUser$.subscribe(user => {
      if (user && user.favorites) {
        // user.favorites could be an array of strings or objects. 
        this.isFavorite = user.favorites.some((f: any) => {
          if (typeof f === 'string') return f === this.listing._id;
          return f._id === this.listing._id;
        });
      } else {
        this.isFavorite = false;
      }
    });
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.currentUserValue) {
      import('sweetalert2').then(m => {
        m.default.fire({
          title: 'Oops...',
          text: 'Please log in to save favorites!',
          icon: 'info',
          customClass: {
            popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
            title: 'text-2xl font-bold text-gray-900',
            confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
          },
          buttonsStyling: false
        });
      });
      return;
    }
    this.authService.toggleFavorite(this.listing._id!).subscribe();
  }
}
