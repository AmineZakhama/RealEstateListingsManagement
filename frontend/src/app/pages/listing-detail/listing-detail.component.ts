import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Listing } from '../../models/listing.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.css'
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  isLoading = true;
  error = '';
  currentUser: User | null = null;
  mainImage = '';
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    public authService: AuthService,
    private messageService: MessageService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.checkFavorite();
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.listingService.getListing(id).subscribe({
        next: (res) => {
          this.listing = res;
          if (this.listing.images && this.listing.images.length > 0) {
            this.mainImage = `http://localhost:5000${this.listing.images[0]}`;
          } else {
            this.mainImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
          }
          this.checkFavorite();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Announce not found';
          this.isLoading = false;
        }
      });
    }
  }

  checkFavorite() {
    if (this.currentUser && this.currentUser.favorites && this.listing) {
      this.isFavorite = this.currentUser.favorites.some((f: any) => {
        if (typeof f === 'string') return f === this.listing?._id;
        return f._id === this.listing?._id;
      });
    } else {
      this.isFavorite = false;
    }
  }

  toggleFavorite() {
    if (!this.currentUser) {
      Swal.fire({
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
      return;
    }
    if (this.listing) {
      this.authService.toggleFavorite(this.listing._id!).subscribe();
    }
  }

  setMainImage(img: string) {
    this.mainImage = `http://localhost:5000${img}`;
  }

  getImageUrl(img: string): string {
    return `http://localhost:5000${img}`;
  }

  get isOwner(): boolean {
    if (!this.currentUser || !this.listing || typeof this.listing.agent === 'string') return false;
    return this.currentUser._id === this.listing.agent._id || this.currentUser.role === 'admin';
  }

  deleteListing() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      customClass: {
        popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
        title: 'text-2xl font-bold text-gray-900',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md',
        cancelButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-medium transition-colors',
        actions: 'gap-4 w-full mt-6 flex justify-center'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        const id = this.listing?._id;
        if (id) {
          this.listingService.deleteListing(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your announce has been deleted.',
                icon: 'success',
                customClass: {
                  popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
                  title: 'text-2xl font-bold text-gray-900',
                  confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
                },
                buttonsStyling: false
              });
              this.router.navigate(['/listings']);
            },
            error: (err) => {
              Swal.fire({
                title: 'Error',
                text: err.error?.message || 'Error deleting',
                icon: 'error',
                customClass: {
                  popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
                  title: 'text-2xl font-bold text-gray-900',
                  confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
                },
                buttonsStyling: false
              });
            }
          });
        }
      }
    });
  }

  async openContactModal() {
    if (!this.listing) return;

    const { value: formValues } = await Swal.fire({
      title: 'Contact Publisher',
      html: `
        <div class="space-y-4 mt-4">
          <input id="swal-input-name" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Your Name">
          <input id="swal-input-email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Your Email">
          <input id="swal-input-phone" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Your Phone Number">
          <textarea id="swal-input-msg" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none" placeholder="I am interested in this property..."></textarea>
        </div>
      `,
      customClass: {
        container: 'backdrop-blur-sm',
        popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
        title: 'text-2xl font-bold text-gray-900',
        confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md',
        cancelButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-medium transition-colors',
        actions: 'gap-4 w-full mt-6 flex justify-center'
      },
      buttonsStyling: false,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Send Message',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-input-phone') as HTMLInputElement).value;
        const msg = (document.getElementById('swal-input-msg') as HTMLTextAreaElement).value;

        if (!name || !email || !phone || !msg) {
          Swal.showValidationMessage('Please fill out all fields');
        }
        return { senderName: name, senderEmail: email, senderPhone: phone, messageText: msg };
      }
    });

    if (formValues) {
      this.messageService.sendMessage({
        listingId: this.listing._id,
        ...formValues
      }).subscribe({
        next: () => Swal.fire('Sent!', 'Your message has been sent to the publisher.', 'success'),
        error: (err) => Swal.fire('Error', err.error?.message || 'Failed to send', 'error')
      });
    }
  }
}
