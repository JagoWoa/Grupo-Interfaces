import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RegistroService, RegistroMaestro } from '../../services/registro.service';

@Component({
  selector: 'app-registro-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registro-form.component.html',
  styleUrls: ['./registro-form.component.css']
})
export class RegistroFormComponent implements OnInit {
  registroForm!: FormGroup;
  registros = signal<RegistroMaestro[]>([]);
  registrosFiltrados = signal<RegistroMaestro[]>([]);
  categorias = signal<string[]>([]);
  
  // Estados del componente
  modoEdicion = signal(false);
  registroSeleccionado = signal<RegistroMaestro | null>(null);
  cargando = signal(false);
  mostrarNotificacion = signal(false);
  mensajeNotificacion = signal('');
  tipoNotificacion = signal<'success' | 'error' | 'info'>('info');
  
  // Autocompletado
  sugerenciasNombre = signal<string[]>([]);
  mostrarSugerencias = signal(false);
  
  // Filtros
  filtroTexto = signal('');
  filtroCategoria = signal('');
  filtroEstado = signal<boolean | null>(null);

  // Usuario mock - en producción vendría del módulo 2 (autenticación)
  private usuarioActual = 'usuario-demo-123';

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarRegistros();
    this.cargarCategorias();
  }

  /**
   * Inicializar formulario con validaciones
   */
  private inicializarFormulario(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      categoria: ['', [Validators.required]],
      estado: [true]
    });

    // Autocompletado en el campo nombre
    this.registroForm.get('nombre')?.valueChanges.subscribe(valor => {
      if (valor && valor.length >= 2) {
        this.buscarAutocompletado(valor);
      } else {
        this.sugerenciasNombre.set([]);
        this.mostrarSugerencias.set(false);
      }
    });
  }

  /**
   * Cargar todos los registros
   */
  cargarRegistros(): void {
    this.cargando.set(true);
    this.registroService.getRegistros().subscribe({
      next: (data) => {
        this.registros.set(data);
        this.aplicarFiltros();
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar registros:', error);
        this.mostrarMensaje('Error al cargar los registros', 'error');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Cargar categorías disponibles
   */
  cargarCategorias(): void {
    this.registroService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  /**
   * Buscar sugerencias para autocompletado
   */
  buscarAutocompletado(termino: string): void {
    this.registroService.buscarAutocompletado(termino, 'nombre').subscribe({
      next: (sugerencias) => {
        this.sugerenciasNombre.set(sugerencias);
        this.mostrarSugerencias.set(sugerencias.length > 0);
      },
      error: (error) => {
        console.error('Error en autocompletado:', error);
      }
    });
  }

  /**
   * Seleccionar sugerencia de autocompletado
   */
  seleccionarSugerencia(sugerencia: string): void {
    this.registroForm.patchValue({ nombre: sugerencia });
    this.mostrarSugerencias.set(false);
  }

  /**
   * Crear nuevo registro
   */
  nuevoRegistro(): void {
    this.modoEdicion.set(false);
    this.registroSeleccionado.set(null);
    this.registroForm.reset({ estado: true });
  }

  /**
   * Guardar registro (crear o actualizar)
   */
  guardarRegistro(): void {
    if (this.registroForm.invalid) {
      this.mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando.set(true);
    const datosFormulario = this.registroForm.value;

    if (this.modoEdicion() && this.registroSeleccionado()) {
      // Actualizar
      const id = this.registroSeleccionado()!.id!;
      this.registroService.actualizarRegistro(id, datosFormulario, this.usuarioActual).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mostrarMensaje('Registro actualizado exitosamente', 'success');
            this.cargarRegistros();
            this.nuevoRegistro();
          } else {
            this.mostrarMensaje('Error al actualizar el registro', 'error');
          }
          this.cargando.set(false);
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.mostrarMensaje('Error al actualizar el registro', 'error');
          this.cargando.set(false);
        }
      });
    } else {
      // Crear
      this.registroService.crearRegistro(datosFormulario, this.usuarioActual).subscribe({
        next: (resultado) => {
          if (resultado) {
            this.mostrarMensaje('Registro creado exitosamente', 'success');
            this.cargarRegistros();
            this.nuevoRegistro();
          } else {
            this.mostrarMensaje('Error al crear el registro', 'error');
          }
          this.cargando.set(false);
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.mostrarMensaje('Error al crear el registro', 'error');
          this.cargando.set(false);
        }
      });
    }
  }

  /**
   * Editar registro existente
   */
  editarRegistro(registro: RegistroMaestro): void {
    this.modoEdicion.set(true);
    this.registroSeleccionado.set(registro);
    this.registroForm.patchValue({
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      categoria: registro.categoria,
      estado: registro.estado
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Eliminar registro
   */
  eliminarRegistro(registro: RegistroMaestro): void {
    if (!confirm(`¿Está seguro de eliminar el registro "${registro.nombre}"?`)) {
      return;
    }

    this.cargando.set(true);
    this.registroService.eliminarRegistro(registro.id!, this.usuarioActual).subscribe({
      next: (resultado) => {
        if (resultado) {
          this.mostrarMensaje('Registro eliminado exitosamente', 'success');
          this.cargarRegistros();
          if (this.registroSeleccionado()?.id === registro.id) {
            this.nuevoRegistro();
          }
        } else {
          this.mostrarMensaje('Error al eliminar el registro', 'error');
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.mostrarMensaje('Error al eliminar el registro', 'error');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Aplicar filtros a la tabla
   */
  aplicarFiltros(): void {
    let filtrados = [...this.registros()];

    // Filtro por texto (nombre o descripción)
    const texto = this.filtroTexto().toLowerCase();
    if (texto) {
      filtrados = filtrados.filter(r =>
        r.nombre.toLowerCase().includes(texto) ||
        r.descripcion.toLowerCase().includes(texto)
      );
    }

    // Filtro por categoría
    if (this.filtroCategoria()) {
      filtrados = filtrados.filter(r => r.categoria === this.filtroCategoria());
    }

    // Filtro por estado
    if (this.filtroEstado() !== null) {
      filtrados = filtrados.filter(r => r.estado === this.filtroEstado());
    }

    this.registrosFiltrados.set(filtrados);
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroCategoria.set('');
    this.filtroEstado.set(null);
    this.aplicarFiltros();
  }

  /**
   * Limpiar formulario
   */
  limpiarFormulario(): void {
    this.nuevoRegistro();
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.registroForm.controls).forEach(key => {
      this.registroForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Mostrar notificación
   */
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensajeNotificacion.set(mensaje);
    this.tipoNotificacion.set(tipo);
    this.mostrarNotificacion.set(true);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.mostrarNotificacion.set(false);
    }, 5000);
  }

  /**
   * Cerrar notificación manualmente
   */
  cerrarNotificacion(): void {
    this.mostrarNotificacion.set(false);
  }

  /**
   * Obtener clase CSS del campo según su estado
   */
  getCampoClase(nombreCampo: string): string {
    const campo = this.registroForm.get(nombreCampo);
    if (campo?.invalid && campo?.touched) {
      return 'input-error';
    }
    if (campo?.valid && campo?.touched) {
      return 'input-success';
    }
    return '';
  }

  /**
   * Verificar si un campo tiene error
   */
  tieneError(nombreCampo: string): boolean {
    const campo = this.registroForm.get(nombreCampo);
    return !!(campo?.invalid && campo?.touched);
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getMensajeError(nombreCampo: string): string {
    const campo = this.registroForm.get(nombreCampo);
    if (campo?.errors) {
      if (campo.errors['required']) return 'Este campo es requerido';
      if (campo.errors['minlength']) {
        return `Mínimo ${campo.errors['minlength'].requiredLength} caracteres`;
      }
      if (campo.errors['maxlength']) {
        return `Máximo ${campo.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  /**
   * Navegación por teclado en el formulario
   */
  onKeyDown(event: KeyboardEvent, accion?: string): void {
    // Ctrl + S: Guardar
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      this.guardarRegistro();
    }
    // Ctrl + N: Nuevo
    if (event.ctrlKey && (event.key === 'n' || event.key === 'N')) {
      event.preventDefault();
      this.nuevoRegistro();
    }
    // Escape: Limpiar
    if (event.key === 'Escape') {
      this.limpiarFormulario();
    }
  }

  // Escuchar teclas a nivel de ventana para asegurar que los atajos funcionen
  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    this.onKeyDown(event);
  }
}
