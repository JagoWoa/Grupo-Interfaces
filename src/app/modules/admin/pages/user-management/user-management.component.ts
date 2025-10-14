import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { Usuario } from '../../../../interfaces/usuario';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      this.usuarios = await this.adminService.obtenerUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cambiarRol(usuario: Usuario, nuevoRol: Usuario['rol']) {
    try {
      await this.adminService.cambiarRol(usuario.id, nuevoRol);
      usuario.rol = nuevoRol;
    } catch (error) {
      console.error('Error al cambiar rol:', error);
    }
  }

  async toggleEstado(usuario: Usuario) {
    try {
      const nuevoEstado = !usuario.activo;
      await this.adminService.toggleEstadoUsuario(usuario.id, nuevoEstado);
      usuario.activo = nuevoEstado;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  async eliminarUsuario(usuario: Usuario) {
    if (!confirm(`¿Estás seguro de eliminar a ${usuario.nombre}?`)) return;

    try {
      await this.adminService.eliminarUsuario(usuario.id);
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }
}
