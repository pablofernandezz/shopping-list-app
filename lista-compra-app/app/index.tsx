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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../utils/styles';
import { obtenerIcono, DICCIONARIO_EMOJIS } from '../utils/diccionario';

// --- CONFIGURACION DE RED ---
//URL local para desarrollo
//const API_URL = 'http://192.168.1.44:3000';
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
  // --- ESTADOS DE DATOS ---
  const [nombre, setNombre] = useState('');
  const [sugerencias, setSugerencias] = useState<string[]>([]); 
  const [cantidad, setCantidad] = useState<number>(1);
  const [comentario, setComentario] = useState('');
  const [lista, setLista] = useState<Articulo[]>([]); 
  
  const [editandoArticulo, setEditandoArticulo] = useState<Articulo | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  // --- ESTADOS DE SEGURIDAD ---
  const [claveAcceso, setClaveAcceso] = useState('');
  const [claveGuardada, setClaveGuardada] = useState<string | null>(null);
  const [verificandoAcceso, setVerificandoAcceso] = useState(true);

  // --- HELPER DE ALERTAS MULTIPLATAFORMA ---
  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // --- ARRANQUE Y WEBSOCKETS ---
  useEffect(() => {
    const arrancarApp = async () => {
      // 1. Comprobar si ya hay una clave guardada en el dispositivo
      const clave = await AsyncStorage.getItem('api_key_familia');
      if (clave) {
        setClaveGuardada(clave);
        await recargarDatos(clave); 
      }
      setVerificandoAcceso(false);
      setCargandoInicial(false);
    };

    arrancarApp();

    // 2. Conectar WebSockets
    const socket = io(API_URL);
    socket.on('actualizacionLista', () => {
      // Usamos un callback para tener siempre el valor más reciente de la clave
      setClaveGuardada((claveActual) => {
        if (claveActual) recargarDatos(claveActual);
        return claveActual;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- LOGICA DE AUTENTICACIÓN ---
  const iniciarSesion = async () => {
    if (claveAcceso.trim() === '') return;
    await AsyncStorage.setItem('api_key_familia', claveAcceso);
    setClaveGuardada(claveAcceso);
    recargarDatos(claveAcceso);
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('api_key_familia');
    setClaveGuardada(null);
    setClaveAcceso('');
    setLista([]);
  };

  // --- LOGICA DE RED (Peticiones al Backend) ---
  const recargarDatos = async (claveActual = claveGuardada) => {
    if (!claveActual) return;
    setRefrescando(true); 
    try {
      const respuesta = await fetch(`${API_URL}/articulos`, {
        headers: { 'x-api-key': claveActual }
      });

      if (respuesta.status === 401) {
        mostrarAlerta("Acceso denegado", "La contraseña es incorrecta o ha cambiado.");
        cerrarSesion();
        return;
      }

      const datosBBDD = await respuesta.json();
      setLista(datosBBDD); 
    } catch (error) {
      mostrarAlerta("Error de conexión", "Asegúrate de que tienes internet.");
    } finally {
      setRefrescando(false);
    }
  };

  const agregarOActualizarArticulo = async () => {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio === '' || !claveGuardada) return; 

    // Validación de duplicados en Frontend
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
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': claveGuardada
          },
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
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': claveGuardada 
          },
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

  const confirmarEliminacion = (articulo: Articulo) => {
    if (!claveGuardada) return;

    const borrarDeBD = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/articulos/${articulo.nombre}`, {
          method: 'DELETE',
          headers: { 'x-api-key': claveGuardada }
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

  const vaciarLista = async () => {
    if (!claveGuardada) return;

    const ejecutarVaciado = async () => {
      setRefrescando(true);
      try {
        for (const item of lista) {
          await fetch(`${API_URL}/articulos/${item.nombre}`, { 
            method: 'DELETE',
            headers: { 'x-api-key': claveGuardada }
          });
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

  // --- RENDERIZADO CONDICIONAL ---
  if (verificandoAcceso) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // PANTALLA DE ACCESO (Si no hay clave)
  if (!claveGuardada) {
    return (
      <KeyboardAvoidingView style={[styles.container, { justifyContent: 'center', padding: 20 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formulario}>
          <Text style={styles.titulo}>🔒 Acceso Familiar</Text>
          <TextInput
            style={[styles.inputPrincipal, { textAlign: 'center', marginBottom: 20 }]}
            placeholder="Introduce la contraseña"
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={claveAcceso}
            onChangeText={setClaveAcceso}
          />
          <TouchableOpacity style={styles.botonAnadir} onPress={iniciarSesion}>
            <Text style={styles.textoBotonAnadir}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // PANTALLA PRINCIPAL DE LA APLICACIÓN
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 20 }}>
          <Text style={styles.titulo}>📝 Lista de la Compra 🛒</Text>
        </View>

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
                  onRefresh={() => recargarDatos()} 
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

            <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
              <Text style={styles.textoBotonCerrarSesion}>🚪 Cerrar sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}