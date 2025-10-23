import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar }  from '../../components/sidebar/sidebar';
import { Header }  from '../../components/header/header';
import { Footer }  from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';
import { ChatService } from '..//../../../core/services/chat.service';
@Component({
  selector: 'app-usuarioAnciano',
  standalone: true,
  imports: [CommonModule, Sidebar, Header, Footer, Chat],
  templateUrl: './usuarioAnciano.html',
})
export class UsuarioAnciano {
vitalSigns = [
    {
      title: 'Presión Arterial',
      value: '120/80',
      unit: 'mmHg',
      icon: 'fas fa-heartbeat',
      iconColor: 'text-red-600',
      colorClass: 'border-red-500',
    },
    {
      title: 'Frecuencia Cardíaca',
      value: '75',
      unit: 'bpm',
      icon: 'fas fa-heart',
      iconColor: 'text-pink-600',
      colorClass: 'border-pink-500',
    },
    {
      title: 'Temperatura',
      value: '36.5',
      unit: '°C',
      icon: 'fas fa-thermometer-half',
      iconColor: 'text-amber-600',
      colorClass: 'border-amber-500',
    },
    {
      title: 'Glucosa',
      value: '95',
      unit: 'mg/dL',
      icon: 'fas fa-tint',
      iconColor: 'text-blue-600',
      colorClass: 'border-blue-500',
    },
  ];
  constructor(private chatService: ChatService) {}
  toggleChat(): void {
    this.chatService.toggleChat();
  }
}