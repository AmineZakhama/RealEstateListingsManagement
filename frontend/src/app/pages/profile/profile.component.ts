import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  formData = {
    name: '',
    phone: '',
    contactEmail: '',
    facebookLink: ''
  };
  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.formData = {
        name: user.name || '',
        phone: user.phone || '',
        contactEmail: user.contactEmail || '',
        facebookLink: user.facebookLink || ''
      };
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.updateProfile(this.formData).subscribe({
      next: (user: any) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'Profile updated successfully!',
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
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Error updating profile',
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
