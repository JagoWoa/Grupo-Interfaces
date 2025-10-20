import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html'
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  
  institutionalInfo = [
    { 
      title: 'Acerca de Nosotros', 
      links: [
        { name: 'Nuestra Historia', href: '/institucional/historia' },
        { name: 'Misión y Visión', href: '/institucional/mision' },
        { name: 'Equipo Médico', href: '/institucional/equipo' },
        { name: 'Certificaciones', href: '/institucional/certificaciones' }
      ]
    }
  ];

  supportInfo = [
    {
      title: 'Soporte y Contacto',
      links: [
        { name: 'Centro de Ayuda', href: '/soporte/ayuda', icon: 'fas fa-life-ring' },
        { name: 'Contactar Soporte', href: '/soporte/contacto', icon: 'fas fa-headset' },
        { name: 'Preguntas Frecuentes', href: '/soporte/faq', icon: 'fas fa-question-circle' },
        { name: 'Chat en Vivo', href: '/soporte/chat', icon: 'fas fa-comments' }
      ]
    }
  ];

  legalInfo = [
    {
      title: 'Políticas y Términos',
      links: [
        { name: 'Términos de Uso', href: '/legal/terminos' },
        { name: 'Política de Privacidad', href: '/legal/privacidad' },
        { name: 'Política de Cookies', href: '/legal/cookies' },
        { name: 'Aviso Legal', href: '/legal/aviso' }
      ]
    }
  ];

  otherLinks = [
    {
      title: 'Recursos',
      links: [
        { name: 'Blog de Salud', href: '/recursos/blog', icon: 'fas fa-newspaper' },
        { name: 'Guías Médicas', href: '/recursos/guias', icon: 'fas fa-book-medical' },
        { name: 'Webinars', href: '/recursos/webinars', icon: 'fas fa-video' },
        { name: 'Actualizaciones', href: '/recursos/actualizaciones', icon: 'fas fa-bell' }
      ]
    }
  ];

  socialMedia = [
    { name: 'Facebook', icon: 'fab fa-facebook-f', href: 'https://facebook.com', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: 'fab fa-twitter', href: 'https://twitter.com', color: 'hover:text-sky-500' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: 'https://linkedin.com', color: 'hover:text-blue-700' },
    { name: 'Instagram', icon: 'fab fa-instagram', href: 'https://instagram.com', color: 'hover:text-pink-600' },
    { name: 'YouTube', icon: 'fab fa-youtube', href: 'https://youtube.com', color: 'hover:text-red-600' }
  ];

  contactInfo = {
    phone: '+34 900 123 456',
    email: 'contacto@saludplus.com',
    address: 'Av. Salud 123, Madrid, España',
    emergency: '112'
  };
}
