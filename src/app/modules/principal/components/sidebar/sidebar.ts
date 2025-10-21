import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html'
})
export class Sidebar {
    expandedItems: string[] = [];

  menuItems = [
    {
      title: 'Inicio',
      href: '/',
      icon: 'fas fa-home',
    },
    {
      title: 'Gestión de Registros',
      href: '/registro',
      icon: 'fas fa-clipboard-list',
      badge: 'Módulo 3',
    },
    {
      title: 'Salud',
      icon: 'fas fa-heartbeat',
      submenu: [
        { title: 'Signos Vitales', href: '/salud/signos', icon: 'fas fa-stethoscope' },
        { title: 'Historial Médico', href: '/salud/historial', icon: 'fas fa-notes-medical' },
      ],
    },
    {
      title: 'Recordatorios',
      href: '/recordatorios',
      icon: 'fas fa-bell',
    },
    {
      title: 'Ayuda',
      href: '/ayuda',
      icon: 'fas fa-question-circle',
      shortcut: 'F1',
    },
  ];

  toggleExpanded(title: string) {
    const index = this.expandedItems.indexOf(title);
    if (index > -1) {
      this.expandedItems.splice(index, 1);
    } else {
      this.expandedItems.push(title);
    }
  }

  isExpanded(title: string): boolean {
    return this.expandedItems.includes(title);
  }
}
