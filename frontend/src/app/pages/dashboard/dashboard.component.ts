import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing.model';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ListingCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  myListings: Listing[] = [];
  isLoading = true;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.listingService.getMyListings().subscribe({
      next: (listings) => {
        this.myListings = listings;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
