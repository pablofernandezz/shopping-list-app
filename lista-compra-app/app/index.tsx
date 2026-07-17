import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';  
import io from 'socket.io-client';
import { styles } from '../utils/styles';
import { obtenerIcono, DICCIONARIO_EMOJIS } from '../utils/diccionario';

// --- CONFIGURACION DE RED ---
// URL pública
const API_URL = 'https://shopping-list-app-zm4g.onrender.com';

// --- INTERFAZ ---
interface Articulo {
  _id?: string;
  __v?: number;
  nombre: string;
  cantidad: number;
  comentario: string;
  comprado?: boolean;
}

export default function App() {
  const [nombre, setNombre] = useState('');
  const [sugerencias, setSugerencias] = useState<string[]>([]); 
  const [cantidad, setCantidad] = useState<number>(1);
  const [comentario, setComentario] = useState('');
  const [lista, setLista] = useState<Articulo[]>([]); 
  
  const [editandoArticulo, setEditandoArticulo] = useState<Articulo | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  // --- HELPER DE ALERTAS MULTIPLATAFORMA ---
  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // --- LOGICA DE RED (CONEXION AL BACKEND) ---

  // 1 cargar datos al iniciar la app y conectar WebSockets
  useEffect(() => {
    recargarDatos().finally(() => {
      setCargandoInicial(false);
    });

    // Conectar al servidor Socket.io
    const socket = io(API_URL);

    // Escuchar el evento emitido por el backend
    socket.on('actualizacionLista', () => {
      recargarDatos(); // Pide la lista fresca a MongoDB silenciosamente
    });

    // Limpiar la conexión si el componente se desmonta para liberar memoria
    return () => {
      socket.disconnect();
    };
  }, []);

  // Función GET: Obtener todos los artículos
  const recargarDatos = async () => {
    setRefrescando(true); 
    try {
      const respuesta = await fetch(`${API_URL}/articulos`);
      const datosBBDD = await respuesta.json();
      setLista(datosBBDD); 
    } catch (error) {
      mostrarAlerta("Error de conexión", "Asegúrate de que el servidor Node.js está encendido y conectado a la misma Wi-Fi.");
    } finally {
      setRefrescando(false);
    }
  };

  // Funciones POST y PUT: Añadir o Editar
  const agregarOActualizarArticulo = async () => {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio === '') return; 

    // VALIDACIÓN DE DUPLICADOS
    const articuloDuplicado = lista.find(
      (item) => item.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (articuloDuplicado && (!editandoArticulo || editandoArticulo.nombre.toLowerCase() !== nombreLimpio.toLowerCase())) {
      mostrarAlerta(
        "Artículo repetido 🚫",
        `"${nombreLimpio}" ya está en tu lista. Utiliza el botón del lápiz (✏️) en el artículo existente para cambiar su cantidad o añadir un comentario.`
      );
      return; 
    }

    try {
      if (editandoArticulo) {
        // PUT: Actualizar
        const respuesta = await fetch(`${API_URL}/articulos/${editandoArticulo.nombre}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nombre: nombreLimpio, 
            cantidad, 
            comentario,
            __v: editandoArticulo.__v 
          })
        });
        
        if (respuesta.status === 409) {
          mostrarAlerta(
            "¡Cuidado! Colisión detectada ⚠️", 
            "Alguien más acaba de modificar este artículo. La lista se actualizará para que veas los nuevos cambios."
          );
          recargarDatos(); 
          setEditandoArticulo(null);
          setNombre('');
          setCantidad(1);
          setComentario('');
          return;
        }

        if (respuesta.ok) {
          recargarDatos(); 
          setEditandoArticulo(null); 
        }
      } else {
        // POST: Añadir
        const respuesta = await fetch(`${API_URL}/articulos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombreLimpio, cantidad, comentario })
        });

        if (respuesta.status === 409) {
          mostrarAlerta("Ya existe", "Otro dispositivo acaba de añadir ese artículo.");
          recargarDatos();
          return;
        }

        if (respuesta.ok) {
          recargarDatos();
        }
      }

      setNombre('');
      setCantidad(1);
      setComentario('');
      setSugerencias([]); 
    } catch (error) {
      mostrarAlerta("Error", "Hubo un problema al guardar el artículo en la base de datos.");
    }
  };

  // Función DELETE: Borrar un artículo
  const confirmarEliminacion = (articulo: Articulo) => {
    const borrarDeBD = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/articulos/${articulo.nombre}`, {
          method: 'DELETE'
        });
        if (respuesta.ok) recargarDatos();
      } catch (error) {
        mostrarAlerta("Error", "No se pudo conectar con el servidor para borrar.");
      }
    };

    if (Platform.OS === 'web') {
      const confirmado = window.confirm(`¿Seguro que quieres eliminar ${articulo.nombre} de la lista?`);
      if (confirmado) borrarDeBD();
    } else {
      Alert.alert(
        "Eliminar artículo", 
        `¿Seguro que quieres eliminar ${articulo.nombre} de la lista?`, 
        [
          { text: "Cancelar", style: "cancel" }, 
          { text: "Eliminar", style: "destructive", onPress: borrarDeBD }
        ]
      );
    }
  };

  // Función para vaciar toda la lista iterando
  const vaciarLista = async () => {
    const ejecutarVaciado = async () => {
      setRefrescando(true);
      try {
        for (const item of lista) {
          await fetch(`${API_URL}/articulos/${item.nombre}`, { method: 'DELETE' });
        }
        recargarDatos();
      } catch (error) {
        mostrarAlerta("Error", "Falló el vaciado de la base de datos.");
      }
    };

    if (Platform.OS === 'web') {
      const confirmado = window.confirm("¿Seguro que has comprado todo y quieres limpiar la base de datos?");
      if (confirmado) ejecutarVaciado();
    } else {
      Alert.alert(
        "Vaciar Lista",
        "¿Seguro que has comprado todo y quieres limpiar la base de datos?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Vaciar", style: "destructive", onPress: ejecutarVaciado }
        ]
      );
    }
  };

  // --- LÓGICA DE AUTOCOMPLETADO Y UI ---
  const manejarTextoNombre = (texto: string) => {
    setNombre(texto);
    const t = texto.toLowerCase().trim();

    if (t.length > 0) {
      const coincidencias = Object.keys(DICCIONARIO_EMOJIS).filter(palabra =>
        palabra.startsWith(t)
      );
      setSugerencias(coincidencias.slice(0, 3));
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarSugerencia = (palabra: string) => {
    const palabraFormateada = palabra.charAt(0).toUpperCase() + palabra.slice(1);
    setNombre(palabraFormateada);
    setSugerencias([]); 
  };

  const iniciarEdicion = (articulo: Articulo) => {
    setNombre(articulo.nombre);
    setCantidad(articulo.cantidad);
    setComentario(articulo.comentario || '');
    setEditandoArticulo(articulo);
  };

  const incrementarCantidad = () => setCantidad(cantidad + 1);
  const decrementarCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1); 
  };

  const renderFondoRojoSwipe = () => (
    <View style={styles.fondoRojoSwipe}>
      <Text style={styles.textoBotonSwipe}>Soltar para borrar</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.titulo}>📝 Lista de la Compra 🛒</Text>

        {cargandoInicial ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Conectando con el servidor...</Text>
          </View>
        ) : (
          <>
            <View style={styles.formulario}>
              <View style={{ zIndex: 2 }}> 
                <TextInput
                  style={styles.inputPrincipal}
                  placeholder="¿Qué necesitas? (Ej. Manzanas)"
                  placeholderTextColor="#6B7280" 
                  value={nombre}
                  onChangeText={manejarTextoNombre} 
                />
                
                {sugerencias.length > 0 && (
                  <View style={styles.cajaSugerencias}>
                    {sugerencias.map((sug) => (
                      <TouchableOpacity 
                        key={sug} 
                        style={styles.itemSugerencia}
                        onPress={() => seleccionarSugerencia(sug)}
                      >
                        <Text style={styles.textoSugerencia}>
                          {DICCIONARIO_EMOJIS[sug]} {sug.charAt(0).toUpperCase() + sug.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={[styles.filaInputs, { zIndex: 1 }]}>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity onPress={decrementarCantidad} style={styles.stepperBoton}>
                    <Text style={styles.stepperTextoBoton}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValor}>{cantidad}</Text>
                  <TouchableOpacity onPress={incrementarCantidad} style={styles.stepperBoton}>
                    <Text style={styles.stepperTextoBoton}>+</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.inputComentario}
                  placeholder="Comentario (opcional)..."
                  placeholderTextColor="#6B7280" 
                  value={comentario}
                  onChangeText={setComentario}
                />
              </View>

              <TouchableOpacity 
                style={[styles.botonAnadir, editandoArticulo && styles.botonGuardarEdicion]} 
                onPress={agregarOActualizarArticulo}
              >
                <Text style={styles.textoBotonAnadir}>
                  {editandoArticulo ? 'Guardar cambios' : 'Añadir a la lista'}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              style={styles.lista}
              contentContainerStyle={{ flexGrow: 1 }} 
              data={lista} 
              keyExtractor={(item) => item._id || item.nombre} 
              refreshControl={
                <RefreshControl  
                  refreshing={refrescando} 
                  onRefresh={recargarDatos} 
                  colors={['#3B82F6']} 
                  tintColor="#3B82F6" 
                />
              }
              renderItem={({ item }) => (
                <Swipeable 
                  renderRightActions={renderFondoRojoSwipe}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'right') confirmarEliminacion(item);
                  }}
                >
                  <View style={styles.tarjetaArticulo}>
                    <View style={styles.infoArticulo}>
                      <Text style={styles.nombreArticulo}>
                        {obtenerIcono(item.nombre)} {item.nombre} (x{item.cantidad})
                      </Text>
                      {item.comentario !== '' && item.comentario !== undefined && (
                        <Text style={styles.comentarioArticulo}>{item.comentario}</Text>
                      )}
                    </View>

                    <View style={styles.accionesArticulo}>
                      <TouchableOpacity onPress={() => iniciarEdicion(item)} style={styles.botonAccion}>
                        <Text style={styles.textoEditar}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmarEliminacion(item)} style={styles.botonAccion}>
                        <Text style={styles.textoEliminar}>❌</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Swipeable>
              )}
            />

            {lista.length > 0 && (
              <TouchableOpacity style={styles.botonVaciar} onPress={vaciarLista}>
                <Text style={styles.textoBotonVaciar}>Compra Hecha (Vaciar lista)</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}