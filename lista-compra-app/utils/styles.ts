import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
    paddingTop: 60, 
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, 
    marginBottom: 20,
  },
  inputPrincipal: {
    borderWidth: 1,
    borderColor: '#dbd1d1ff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
    color: '#1F2937', 
  },
  filaInputs: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    width: '30%',
  },
  stepperBoton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stepperTextoBoton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  stepperValor: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputComentario: {
    borderWidth: 1,
    borderColor: '#cec3c3ff',
    padding: 12,
    borderRadius: 8,
    width: '65%', 
    color: '#1F2937',
  },
  botonAnadir: {
    backgroundColor: '#3B82F6', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonGuardarEdicion: {
    backgroundColor: '#F59E0B', 
  },
  textoBotonAnadir: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lista: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tarjetaArticulo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#3B82F6', 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoArticulo: {
    flex: 1, 
    paddingRight: 10,
  },
  nombreArticulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  comentarioArticulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  accionesArticulo: {
    flexDirection: 'row',
  },
  botonAccion: {
    padding: 8,
    marginLeft: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  textoEditar: {
    fontSize: 16,
  },
  textoEliminar: {
    fontSize: 16,
  },
  fondoRojoSwipe: {
    backgroundColor: '#EF4444', 
    justifyContent: 'center',
    alignItems: 'flex-end', 
    paddingRight: 20, 
    flex: 1, 
    marginBottom: 10,
    borderRadius: 8,
  },
  textoBotonSwipe: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonVaciar: {
    backgroundColor: '#10B981', 
    padding: 20,
    alignItems: 'center',
    margin: 15,
    borderRadius: 10,
  },
  textoBotonVaciar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // --- Estilos del Autocompletado ---
  cajaSugerencias: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: -5, // pegarlo  al input
    marginBottom: 10,
    // Sombra para que "flote" por encima del resto
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  itemSugerencia: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  textoSugerencia: {
    fontSize: 16,
    color: '#1F2937',
  },

  // --- Estilos del botón Cerrar Sesión ---
  botonCerrarSesion: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 8,
  },
  textoBotonCerrarSesion: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
});