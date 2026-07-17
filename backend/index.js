require('dotenv').config(); //carga las variables del archivo .env
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1 conectar cn  la base de datos
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => console.log('¡Conectado a la base de datos MongoDB!'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// 2 definicion esquema y modelo
const articuloSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true }, // unique evita duplicados a nivel de BD
  cantidad: { type: Number, default: 1 },
  comprado: { type: Boolean, default: false },
  comentario: { type: String, default: "" }
}, { optimisticConcurrency: true });

// articulo se crea a partir del esquema de arriba
const Articulo = mongoose.model('Articulo', articuloSchema);

// GET: leer todos los ariculos
app.get('/articulos', async (req, res) => {
    try {
        // .find() sin parametros busca TODO en la colección
        const articulos = await Articulo.find();
        res.json(articulos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los artículos de la base de datos" });
    }
});

// POST: añadir un nuevo articulo
app.post('/articulos', async (req, res) => {
    try {
        // 1 creear el objeto usando el Molde (Schema) de antes
        const nuevoArticulo = new Articulo(req.body);

        // 2 guardar en MongoDB (await porque tarda un poco)
        await nuevoArticulo.save();

        res.status(201).json({ mensaje: "Artículo añadido a MongoDB", articulo: nuevoArticulo });
    } catch (error) {
        // código 11000 = violación de índice único (dos dispositivos añadiendo el mismo nombre a la vez)
        if (error.code === 11000) {
            return res.status(409).json({ error: "Ya existe un artículo con ese nombre." });
        }
        res.status(400).json({ error: "Error al guardar el artículo. Comprueba el formato." });
    }
});

// PUT: actualizar un articulo (buscando por nombre)
app.put('/articulos/:nombre', async (req, res) => {
    try {
        const articulo = await Articulo.findOne({ nombre: req.params.nombre });

        if (!articulo) {
            return res.status(404).json({ error: "Artículo no encontrado en la base de datos" });
        }

        // el cliente envia una versión (__v) distinta a la que hay en la BD, algn lo modifico antes
        if (req.body.__v !== undefined && articulo.__v !== req.body.__v) {
            return res.status(409).json({ error: "Conflicto de versiones. El artículo fue modificado por otra persona." });
        }

        // actualizacion de datos
        if (req.body.nombre !== undefined) articulo.nombre = req.body.nombre;
        articulo.cantidad = req.body.cantidad;
        articulo.comentario = req.body.comentario;

        // hacer .save(), Mongoose incrementa el __v
        await articulo.save();

        res.json({ mensaje: "Artículo actualizado", articulo: articulo });

    } catch (error) {
        // Mongoose lanza un VersionError si detecta colisión internamente
        if (error.name === 'VersionError') {
            return res.status(409).json({ error: "Conflicto de versiones. El artículo fue modificado por otra persona." });
        }
        // código 11000 = si el nuevo nombre ya lo tiene otro artículo
        if (error.code === 11000) {
            return res.status(409).json({ error: "Ya existe otro artículo con ese nombre." });
        }
        res.status(500).json({ error: "Error interno al actualizar" });
    }
});

// DELETE: borrar un articulo (buscando por nombre)
app.delete('/articulos/:nombre', async (req, res) => {
    try {
        // findOneAndDelete hace exactamente lo que su nombre indica, just learn english ;)
        const articuloBorrado = await Articulo.findOneAndDelete({ nombre: req.params.nombre });

        if (articuloBorrado) {
            res.json({ mensaje: `El artículo ${req.params.nombre} ha sido eliminado para siempre` });
        } else {
            res.status(404).json({ error: "Artículo no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno al borrar" });
    }
});


// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});