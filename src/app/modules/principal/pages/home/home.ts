import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar }  from '../../components/sidebar/sidebar';
@Component({
  selector: 'app-home',
  imports: [CommonModule, Sidebar],
  templateUrl: './home.html',
})
export class Home {
vitalSigns = [
    {
      title: 'Presión Arterial',
      value: '120/80',
      unit: 'mmHg',
      icon: 'fas fa-heartbeat',
      iconColor: 'text-rose-500',
      colorClass: 'border-rose-400',
    },
    {
      title: 'Frecuencia Cardíaca',
      value: '75',
      unit: 'bpm',
      icon: 'fas fa-heart',
      iconColor: 'text-red-500',
      colorClass: 'border-red-400',
    },
    {
      title: 'Temperatura',
      value: '36.5',
      unit: '°C',
      icon: 'fas fa-thermometer-half',
      iconColor: 'text-orange-500',
      colorClass: 'border-orange-400',
    },
    {
      title: 'Glucosa',
      value: '95',
      unit: 'mg/dL',
      icon: 'fas fa-tint',
      iconColor: 'text-teal-500',
      colorClass: 'border-teal-400',
    },
  ];
}
