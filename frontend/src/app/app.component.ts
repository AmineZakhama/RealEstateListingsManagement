import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private pollingSub?: Subscription;
  private authSub?: Subscription;

  constructor(private messageService: MessageService, private authService: AuthService) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        if (!this.pollingSub) {
          this.startPolling();
        }
      } else {
        if (this.pollingSub) {
          this.pollingSub.unsubscribe();
          this.pollingSub = undefined;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
    if (this.authSub) this.authSub.unsubscribe();
  }

  startPolling() {
    this.pollMessages(); // Check immediately
    this.pollingSub = interval(15000).subscribe(() => {
      this.pollMessages();
    });
  }

  pollMessages() {
    this.messageService.getUnreadCount().subscribe({
      next: (res) => {
        if (res.count > 0) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            showCloseButton: true,
            timer: 10000,
            timerProgressBar: true,
            customClass: {
              popup: 'rounded-xl shadow-lg border border-indigo-100',
              title: 'text-indigo-800 font-medium'
            }
          });
          Toast.fire({
            icon: 'info',
            title: `You have ${res.count} unread message(s)!`
          });
        }
      },
      error: () => {}
    });
  }
}
