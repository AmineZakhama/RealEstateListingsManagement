import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ListingService } from '../../services/listing.service';
import { CategoryService } from '../../services/category.service';
import { Listing } from '../../models/listing.model';
import { Category } from '../../models/category.model';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ListingCardComponent],
  templateUrl: './listing-list.component.html',
  styleUrl: './listing-list.component.css'
})
export class ListingListComponent implements OnInit, OnDestroy {
  listings: Listing[] = [];
  categories: Category[] = [];
  
  // Filters
  keyword = '';
  city = '';
  categoryId = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sort = 'createdAt_desc';
  
  // Pagination
  page = 1;
  pages = 1;
  total = 0;
  
  isLoading = false;

  private searchSubject = new Subject<void>();
  private searchSubscription!: Subscription;

  constructor(
    private listingService: ListingService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadListings();

    // Debounce real-time search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.page = 1;
      this.loadListings();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  loadListings() {
    this.isLoading = true;
    const params: any = {
      page: this.page,
      limit: 9,
      sort: this.sort
    };
    if (this.keyword) params.keyword = this.keyword;
    if (this.city) params.city = this.city;
    if (this.categoryId) params.category = this.categoryId;
    if (this.minPrice) params.minPrice = this.minPrice;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    
    // Exclude own listings
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user._id) {
      params.excludeAgent = user._id;
    }

    this.listingService.getListings(params).subscribe({
      next: (res) => {
        this.listings = res.listings;
        this.page = res.page;
        this.pages = res.pages;
        this.total = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.searchSubject.next();
  }

  onSelectChange() {
    this.page = 1;
    this.loadListings();
  }

  resetFilters() {
    this.keyword = '';
    this.city = '';
    this.categoryId = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sort = 'createdAt_desc';
    this.page = 1;
    this.loadListings();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.pages) {
      this.page = newPage;
      this.loadListings();
    }
  }

  get visiblePages(): number[] {
    const maxVisible = 3;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(this.pages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    const visible = [];
    for (let i = start; i <= end; i++) visible.push(i);
    return visible;
  }
}
