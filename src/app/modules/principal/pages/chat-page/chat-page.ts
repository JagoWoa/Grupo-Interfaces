import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, Header, Footer, Chat],
  templateUrl: './chat-page.html',
  styleUrls: ['./chat-page.css']
})
export class ChatPage {
  constructor() {}
}
