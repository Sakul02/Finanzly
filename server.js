require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const PORT = 4000;

const DATA_FILE = path.join(__dirname, 'data.json');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware para entender datos JSON y servir archivos
app.use(express.json());

// Servir `login.html` como página principal en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// LOGIN
// ==========================================

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar que lleguen los datos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario por email
        const resultado = await pool.query(`
            SELECT
                id_usuario,
                nombre,
                apellido,
                email,
                password
            FROM public.usuarios
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
        `, [email]);

        // Usuario no encontrado
        if (resultado.rows.length === 0) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }

        const usuario = resultado.rows[0];

        // Verificar contraseña
        if (usuario.password !== password) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }

        // No devolver la contraseña al navegador
        delete usuario.password;

        res.json({
            mensaje: 'Login correcto',
            usuario: usuario
        });

    } catch (error) {
        console.error('❌ Error en login:', error);

        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// ==========================================
// REGISTRO DE USUARIO
// ==========================================

app.post('/api/registro', async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            password
        } = req.body;

        // Verificar datos obligatorios
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await pool.query(`
            SELECT id_usuario
            FROM public.usuarios
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
        `, [email]);

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({
                error: 'Ya existe un usuario con ese email'
            });
        }

        // Crear usuario
        const resultado = await pool.query(`
            INSERT INTO public.usuarios (
                nombre,
                apellido,
                email,
                password
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id_usuario,
                nombre,
                apellido,
                email
        `, [
            nombre.trim(),
            apellido.trim(),
            email.trim().toLowerCase(),
            password
        ]);

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);

        res.status(500).json({
            error: 'No se pudo crear el usuario'
        });
    }
});

// --- RUTAS DE LA API ---

// 1. Obtener todos los datos del archivo
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error al leer los datos generales" });
    }
});

// ==========================================
// SECCIÓN: CATEGORÍAS
// ==========================================

// Obtener categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id_categoria,
                id_usuario,
                nombre,
                tipo,
                descripcion
            FROM public.categorias
            ORDER BY id_categoria ASC
        `);

        res.json(resultado.rows);

    } catch (error) {
        console.error("❌ Error al obtener categorías:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});



// ==========================================
// SECCIÓN: TRANSACCIONES
// ==========================================

// Obtener todas las transacciones
// Obtener todas las transacciones desde Supabase
app.get('/api/transacciones', async (req, res) => {
    try {
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: 'Falta el id_usuario'
            });
        }

        const resultado = await pool.query(`
            SELECT
                m.id_movimiento,
                m.id_usuario,
                m.id_categoria,
                m.id_meta,
                m.tipo,
                m.monto,
                m.detalle,
                m.detalle AS descripcion,
                m.fecha,
                c.nombre AS categoria
            FROM public.movimientos m
            LEFT JOIN public.categorias c
                ON m.id_categoria = c.id_categoria
            WHERE m.id_usuario = $1
            ORDER BY m.fecha DESC
        `, [id_usuario]);

        res.json(resultado.rows);

    } catch (error) {
        console.error("❌ ERROR COMPLETO AL OBTENER TRANSACCIONES:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});

async function revisarNotificacionesLimites(id_usuario) {

    try {

        // ==========================================
        // OBTENER TODOS LOS LÍMITES ACTIVOS
        // DEL USUARIO ACTUAL
        // ==========================================

        const limites = await pool.query(`
            SELECT
                l.id_limite,
                l.id_usuario,
                l.id_categoria,
                l.monto_limite,
                c.nombre AS categoria
            FROM public.limites l
            LEFT JOIN public.categorias c
                ON l.id_categoria = c.id_categoria
            WHERE l.id_usuario = $1
              AND l.activo = true
        `, [id_usuario]);


        // ==========================================
        // REVISAR CADA LÍMITE INDIVIDUALMENTE
        // ==========================================

        for (const limite of limites.rows) {

            console.log(
                "🔎 REVISANDO LÍMITE:",
                limite.categoria,
                "→",
                limite.monto_limite
            );

            // ==========================================
            // OBTENER GASTOS DEL MES ACTUAL
            // DE ESTA CATEGORÍA
            // ==========================================

            const gastos = await pool.query(`
                SELECT
                    COALESCE(SUM(monto), 0) AS total
                FROM public.movimientos
                WHERE id_usuario = $1
                  AND id_categoria = $2
                  AND tipo = 'GASTO'
                  AND DATE_TRUNC('month', fecha)
                      = DATE_TRUNC('month', CURRENT_DATE)
            `, [
                id_usuario,
                limite.id_categoria
            ]);


            const gastado =
                Number(gastos.rows[0].total);

            const montoLimite =
                Number(limite.monto_limite);


            if (montoLimite <= 0) {
                continue;
            }


            // ==========================================
            // CALCULAR PORCENTAJE UTILIZADO
            // ==========================================

            const porcentaje =
                (gastado / montoLimite) * 100;
                console.log(
                    "💰 GASTADO:",
                    gastado,
                    "| LÍMITE:",
                    montoLimite,
                    "| PORCENTAJE:",
                    porcentaje.toFixed(2) + "%"
                );

            let nivel = null;
            let titulo = null;
            let mensaje = null;


            // ==========================================
            // 🔴 100% O MÁS
            // ==========================================

            if (porcentaje >= 100) {

                nivel = '100';

                titulo =
                    `Límite de ${limite.categoria} superado`;

                mensaje =
                    `Has superado tu límite mensual de ${limite.categoria}.`;


            // ==========================================
            // 🟠 90%
            // ==========================================

            } else if (porcentaje >= 90) {

                nivel = '90';

                titulo =
                    `Límite de ${limite.categoria}`;

                mensaje =
                    `Has utilizado el 90% de tu límite mensual de ${limite.categoria}.`;


            // ==========================================
            // 🟡 75%
            // ==========================================

            } else if (porcentaje >= 75) {

                nivel = '75';

                titulo =
                    `Límite de ${limite.categoria}`;

                mensaje =
                    `Has utilizado más del 75% de tu límite mensual de ${limite.categoria}.`;
            }


            // ==========================================
            // NO ALCANZÓ NINGÚN NIVEL
            // ==========================================

            if (!nivel) {
                continue;
            }


            // ==========================================
            // EVITAR NOTIFICACIONES DUPLICADAS
            // ==========================================

            const existe = await pool.query(`
                SELECT id_notificacion
                FROM public.notificaciones
                WHERE id_usuario = $1
                  AND tipo = 'LIMITE'
                  AND titulo = $2
                  AND DATE_TRUNC('month', fecha_creacion)
                      = DATE_TRUNC('month', CURRENT_DATE)
                LIMIT 1
            `, [
                id_usuario,
                titulo
            ]);


            if (existe.rows.length > 0) {
                continue;
            }


            // ==========================================
            // CREAR NOTIFICACIÓN
            // ==========================================

            await pool.query(`
                INSERT INTO public.notificaciones (
                    id_usuario,
                    titulo,
                    mensaje,
                    tipo,
                    leida,
                    enviada,
                    fecha_creacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    'LIMITE',
                    false,
                    true,
                    NOW()
                )
            `, [
                id_usuario,
                titulo,
                mensaje
            ]);


            console.log(
                `🔔 Notificación creada → Usuario: ${id_usuario} | Categoría: ${limite.categoria} | Nivel: ${nivel}%`
            );
        }


    } catch (error) {

        console.error(
            "❌ Error al revisar notificaciones de límites:",
            error
        );

    }
}

// GUARDAR TRANACCIÓN
app.post('/api/transacciones', async (req, res) => {

    try {

        const {
            id_usuario,
            id_categoria,
            id_meta,
            tipo,
            monto,
            detalle,
            fecha
        } = req.body;


        // ==========================================
        // VALIDAR USUARIO
        // ==========================================

        if (!id_usuario) {

            return res.status(400).json({
                error: 'Falta el id_usuario'
            });

        }


        // ==========================================
        // GUARDAR TRANSACCIÓN
        // ==========================================

        const resultado = await pool.query(`
            INSERT INTO public.movimientos (
                id_usuario,
                id_categoria,
                id_meta,
                tipo,
                monto,
                detalle,
                fecha
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            id_usuario,
            id_categoria ?? null,
            id_meta ?? null,
            tipo,
            monto,
            detalle ?? null,
            fecha ?? new Date()
        ]);


        // ==========================================
        // REVISAR NOTIFICACIONES DE LÍMITES
        // ==========================================

        if (tipo === 'GASTO') {

            await revisarNotificacionesLimites(
                id_usuario
            );

        }


        // ==========================================
        // RESPONDER AL FRONTEND
        // ==========================================

        res.status(201).json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            "Error al guardar transacción:",
            error
        );

        res.status(500).json({
            error: "Error al guardar transacción"
        });

    }

});

// ==========================================
// LÍMITES
// ==========================================

// GUARDAR LÍMITE
app.post('/api/limites', async (req, res) => {
    try {
        const {
            id_usuario,
            id_categoria,
            monto_limite,
            periodo
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            INSERT INTO public.limites (
                id_usuario,
                id_categoria,
                monto_limite,
                periodo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            id_usuario,
            id_categoria ?? null,
            monto_limite,
            periodo
        ]);

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error("❌ Error al guardar límite:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});


// OBTENER LÍMITES
app.get('/api/limites', async (req, res) => {
    try {
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            SELECT
                l.id_limite,
                l.id_usuario,
                l.id_categoria,
                l.monto_limite,
                l.periodo,
                l.activo,
                c.nombre AS categoria
            FROM public.limites l
            LEFT JOIN public.categorias c
                ON l.id_categoria = c.id_categoria
            WHERE l.activo = true
              AND l.id_usuario = $1
            ORDER BY l.id_limite DESC
        `, [id_usuario]);

        console.log(
    "🔍 REVISANDO LÍMITES PARA USUARIO:",
    id_usuario
);

console.log(
    "📊 LÍMITES ENCONTRADOS:",
    limites.rows
);

        res.json(resultado.rows);

    } catch (error) {
        console.error("❌ Error al obtener límites:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});

// ELIMINAR LÍMITE
app.delete('/api/limites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            DELETE FROM public.limites
            WHERE id_limite = $1
              AND id_usuario = $2
            RETURNING *
        `, [id, id_usuario]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Límite no encontrado o no pertenece al usuario"
            });
        }

        res.json({
            mensaje: "Límite eliminado correctamente",
            limite: resultado.rows[0]
        });

    } catch (error) {
        console.error("❌ Error al eliminar límite:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});

// ELIMINAR TRANSACCIÓN
// ==========================================
// ELIMINAR TRANSACCIÓN
// ==========================================
app.delete('/api/transacciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.query;

        // Verificar usuario
        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            DELETE FROM public.movimientos
            WHERE id_movimiento = $1
              AND id_usuario = $2
            RETURNING *
        `, [
            id,
            id_usuario
        ]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Transacción no encontrada o no pertenece al usuario"
            });
        }

        res.json({
            mensaje: "Transacción eliminada correctamente",
            transaccion: resultado.rows[0]
        });

    } catch (error) {

        console.error(
            "❌ ERROR COMPLETO AL ELIMINAR:",
            error
        );

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});

// ==========================================
// SECCIÓN: METAS DE AHORRO (NUEVAS & ACTUALIZADAS)
// ==========================================

// Obtener todas las metas
app.get('/api/metas', async (req, res) => {
    try {
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: 'Falta el id_usuario'
            });
        }

        const resultado = await pool.query(`
            SELECT *
            FROM public.metas
            WHERE id_usuario = $1
            ORDER BY id_meta DESC
        `, [id_usuario]);

        res.json(resultado.rows);

    } catch (error) {
        console.error("❌ Error al obtener metas:", error);

        res.status(500).json({
            error: error.message,
            detalle: error.detail,
            codigo: error.code
        });
    }
});


// Guardar una nueva meta
app.post('/api/metas', async (req, res) => {
    try {
        const {
            id_usuario,
            nombre,
            monto_objetivo,
            monto_actual,
            meses_objetivo,
            fecha_fin,
            tipo_plazo
        } = req.body;

        const resultado = await pool.query(`
            INSERT INTO public.metas (
                id_usuario,
                nombre,
                monto_objetivo,
                monto_actual,
                meses_objetivo,
                fecha_fin,
                tipo_plazo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            id_usuario,
            nombre,
            monto_objetivo,
            monto_actual ?? 0,
            meses_objetivo ?? null,
            fecha_fin ?? null,
            tipo_plazo
        ]);

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error("Error al guardar meta:", error);
        res.status(500).json({
            error: "Error al guardar la meta"
        });
    }
});


// ==========================================
// ACTUALIZAR / MODIFICAR UNA META
// ==========================================
app.put('/api/metas/:id', async (req, res) => {
    try {
        const idBuscar = parseInt(req.params.id);
        const { id_usuario } = req.body;

        const {
            nombre,
            monto_objetivo,
            monto_actual,
            meses_objetivo,
            fecha_fin,
            tipo_plazo
        } = req.body;

        // Verificar usuario
        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            UPDATE public.metas
            SET
                nombre = $1,
                monto_objetivo = $2,
                monto_actual = $3,
                meses_objetivo = $4,
                fecha_fin = $5,
                tipo_plazo = $6
            WHERE id_meta = $7
              AND id_usuario = $8
            RETURNING *
        `, [
            nombre,
            monto_objetivo,
            monto_actual,
            meses_objetivo ?? null,
            fecha_fin ?? null,
            tipo_plazo,
            idBuscar,
            id_usuario
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Meta no encontrada o no pertenece al usuario"
            });
        }

        res.status(200).json(resultado.rows[0]);

    } catch (error) {

        console.error(
            "❌ Error al actualizar meta:",
            error
        );

        res.status(500).json({
            error: "Error interno al editar la meta"
        });
    }
});


// ==========================================
// ELIMINAR UNA META DE AHORRO
// ==========================================
app.delete('/api/metas/:id', async (req, res) => {
    try {
        const idBuscar = parseInt(req.params.id);
        const { id_usuario } = req.query;

        // Verificar usuario
        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            DELETE FROM public.metas
            WHERE id_meta = $1
              AND id_usuario = $2
            RETURNING *
        `, [
            idBuscar,
            id_usuario
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Meta no encontrada o no pertenece al usuario"
            });
        }

        res.status(200).json({
            mensaje: "Meta eliminada con éxito",
            meta: resultado.rows[0]
        });

    } catch (error) {

        console.error(
            "❌ Error al eliminar meta:",
            error
        );

        res.status(500).json({
            error: "Error interno al eliminar la meta"
        });
    }
});

// ==========================================
// ENCENDIDO DEL SERVIDOR
// ==========================================
pool.query('SELECT NOW()')
    .then(result => {
        console.log('✅ Conexión a Supabase exitosa');
        console.log('🕒 Hora de la base de datos:', result.rows[0].now);
    })
    .catch(error => {
        console.error('❌ Error conectando a Supabase:', error.message);
    });
    // ==========================================
    // NOTIFICACIONES
    // ==========================================

    // OBTENER NOTIFICACIONES DEL USUARIO
    app.get('/api/notificaciones', async (req, res) => {
    try {
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            SELECT
                id_notificacion,
                id_usuario,
                titulo,
                mensaje,
                tipo,
                leida,
                enviada,
                fecha_creacion
            FROM public.notificaciones
            WHERE id_usuario = $1
            ORDER BY fecha_creacion DESC
        `, [id_usuario]);

        res.json(resultado.rows);

    } catch (error) {
        console.error(
            "❌ Error al obtener notificaciones:",
            error
        );

        res.status(500).json({
            error: "Error al obtener notificaciones"
        });
    }
    });


    // CREAR NOTIFICACIÓN
    app.post('/api/notificaciones', async (req, res) => {
    try {
        const {
            id_usuario,
            titulo,
            mensaje,
            tipo
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        if (!titulo || !mensaje || !tipo) {
            return res.status(400).json({
                error: "Faltan datos de la notificación"
            });
        }

        const resultado = await pool.query(`
            INSERT INTO public.notificaciones (
                id_usuario,
                titulo,
                mensaje,
                tipo,
                leida,
                enviada,
                fecha_creacion
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                false,
                true,
                NOW()
            )
            RETURNING *
        `, [
            id_usuario,
            titulo,
            mensaje,
            tipo
        ]);

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error(
            "❌ Error al crear notificación:",
            error
        );

        res.status(500).json({
            error: "Error al crear notificación"
        });
    }
    });


    // MARCAR NOTIFICACIÓN COMO LEÍDA
    app.put('/api/notificaciones/:id/leida', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            UPDATE public.notificaciones
            SET leida = true
            WHERE id_notificacion = $1
              AND id_usuario = $2
            RETURNING *
        `, [
            id,
            id_usuario
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Notificación no encontrada o no pertenece al usuario"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(
            "❌ Error al marcar notificación:",
            error
        );

        res.status(500).json({
            error: "Error al marcar notificación"
        });
    }
    });


    // ELIMINAR NOTIFICACIÓN
    app.delete('/api/notificaciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.query;

        if (!id_usuario) {
            return res.status(400).json({
                error: "Falta el id_usuario"
            });
        }

        const resultado = await pool.query(`
            DELETE FROM public.notificaciones
            WHERE id_notificacion = $1
              AND id_usuario = $2
            RETURNING *
        `, [
            id,
            id_usuario
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Notificación no encontrada o no pertenece al usuario"
            });
        }

        res.json({
            mensaje: "Notificación eliminada correctamente",
            notificacion: resultado.rows[0]
        });

    } catch (error) {
        console.error(
            "❌ Error al eliminar notificación:",
            error
        );

        res.status(500).json({
            error: "Error al eliminar notificación"
        });
    }
    });

    app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});