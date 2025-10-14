import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  estadisticas: any = {};
  consultasRecientes: any[] = [];
  cargando = true;

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.estadisticas = await this.adminService.obtenerEstadisticas();
      this.consultasRecientes = await this.adminService.obtenerConsultasRecientes(5);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      this.cargando = false;
    }
  }
}
