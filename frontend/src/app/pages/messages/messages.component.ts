import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  messages: any[] = [];
  isLoading = true;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.messageService.getMessages().subscribe({
      next: (res) => {
        this.messages = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
