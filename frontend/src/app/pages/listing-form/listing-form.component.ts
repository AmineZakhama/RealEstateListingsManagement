import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ListingService } from '../../services/listing.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.css'
})
export class ListingFormComponent implements OnInit {
  isEditMode = false;
  listingId: string | null = null;
  categories: Category[] = [];
  
  formData = {
    title: '',
    description: '',
    price: null as number | null,
    city: '',
    address: '',
    category: '',
    features: {
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0
    }
  };

  existingImages: string[] = [];
  removedImages: string[] = [];
  
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  
  isLoading = false;

  constructor(
    private listingService: ListingService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkProfileCompletion();
    
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
    
    this.listingId = this.route.snapshot.paramMap.get('id');
    if (this.listingId) {
      this.isEditMode = true;
      this.listingService.getListing(this.listingId).subscribe(listing => {
        this.formData = {
          title: listing.title,
          description: listing.description,
          price: listing.price as any,
          city: listing.city,
          address: listing.address || '',
          category: typeof listing.category === 'string' ? listing.category : listing.category._id,
          features: {
            bedrooms: listing.features?.bedrooms || 0,
            bathrooms: listing.features?.bathrooms || 0,
            squareFeet: listing.features?.squareFeet || 0
          }
        };
        this.existingImages = listing.images || [];
      });
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles.push(...files);
      
      // Generate previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeNewFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  removeExistingImage(img: string) {
    this.removedImages.push(img);
    this.existingImages = this.existingImages.filter(i => i !== img);
  }

  onSubmit() {
    // Validation
    if (!this.isEditMode && this.selectedFiles.length === 0) {
      Swal.fire('Validation Error', 'Please upload at least one image.', 'warning');
      return;
    }
    if (this.isEditMode && this.existingImages.length === 0 && this.selectedFiles.length === 0) {
      Swal.fire('Validation Error', 'You must have at least one image for the announce.', 'warning');
      return;
    }

    this.isLoading = true;

    const submissionData = new FormData();
    submissionData.append('title', this.formData.title);
    submissionData.append('description', this.formData.description);
    submissionData.append('price', this.formData.price?.toString() || '0');
    submissionData.append('city', this.formData.city);
    submissionData.append('address', this.formData.address);
    submissionData.append('category', this.formData.category);
    submissionData.append('features', JSON.stringify(this.formData.features));

    if (this.removedImages.length > 0) {
      submissionData.append('removedImages', JSON.stringify(this.removedImages));
    }

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        submissionData.append('images', file);
      });
    }

    if (this.isEditMode && this.listingId) {
      this.listingService.updateListing(this.listingId, submissionData).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success',
            text: 'Announce updated successfully',
            icon: 'success',
            customClass: {
              popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
              title: 'text-2xl font-bold text-gray-900',
              confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
            },
            buttonsStyling: false
          }).then(() => {
            this.router.navigate(['/listings', this.listingId]);
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Error updating announce',
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
    } else {
      this.listingService.createListing(submissionData).subscribe({
        next: (listing) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success',
            text: 'Announce created successfully',
            icon: 'success',
            customClass: {
              popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
              title: 'text-2xl font-bold text-gray-900',
              confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
            },
            buttonsStyling: false
          }).then(() => {
            this.router.navigate(['/listings', listing._id]);
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Error creating announce',
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

  async checkProfileCompletion() {
    if (this.isEditMode) return;
    
    const user = this.authService.currentUserValue;
    if (user && !user.phone) {
      const { value: formValues } = await Swal.fire({
        title: 'Complete Your Profile',
        text: 'You need to complete your contact information before creating an announce.',
        html: `
          <div class="space-y-4 mt-4">
            <input id="swal-profile-phone" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Phone Number (Required)">
            <input id="swal-profile-email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Contact Email (Optional)">
            <input id="swal-profile-fb" type="url" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Facebook Link (Optional)">
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
        confirmButtonText: 'Save & Continue',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
        preConfirm: () => {
          const phone = (document.getElementById('swal-profile-phone') as HTMLInputElement).value;
          const email = (document.getElementById('swal-profile-email') as HTMLInputElement).value;
          const fb = (document.getElementById('swal-profile-fb') as HTMLInputElement).value;

          if (!phone) {
            Swal.showValidationMessage('Phone number is required');
          }
          return { phone, contactEmail: email, facebookLink: fb };
        }
      });

      if (formValues) {
        this.authService.updateProfile(formValues).subscribe({
          next: () => {
            Swal.fire({
              title: 'Saved!',
              text: 'Your profile is updated. You can now create an announce.',
              icon: 'success',
              customClass: {
                popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
                title: 'text-2xl font-bold text-gray-900',
                confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
              },
              buttonsStyling: false
            });
          },
          error: (err: any) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'Error saving profile',
              icon: 'error',
              customClass: {
                popup: 'rounded-3xl p-6 shadow-2xl border border-gray-100',
                title: 'text-2xl font-bold text-gray-900',
                confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition-colors shadow-md'
              },
              buttonsStyling: false
            }).then(() => this.router.navigate(['/listings']));
          }
        });
      } else {
        // User cancelled
        this.router.navigate(['/listings']);
      }
    }
  }
}
