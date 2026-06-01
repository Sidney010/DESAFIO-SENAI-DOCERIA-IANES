/******************************************************************************
 * Objetivo: Arquivo responsável pelas requisições da API do projeto IANES
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 3.0 — adicionadas rotas de lote e movimentação
 ******************************************************************************/

require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const PORT = process.env.PORT || 8080

const app = express()

// ── Middlewares globais ───────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (request.method === 'OPTIONS') {
        return response.sendStatus(204)
    }

    next()
})

// ── Importação das rotas ──────────────────────────────────────────────────────
const categoriaRoutes    = require('./routes/categoria')
const usuarioRoutes      = require('./routes/usuario')
const produtoRoutes      = require('./routes/produto')
const loteRoutes         = require('./routes/lote')
const movimentacaoRoutes = require('./routes/movimentacao')

// ── Registro das rotas ────────────────────────────────────────────────────────
app.use('/v1/IANES/categoria',    categoriaRoutes)
app.use('/v1/IANES/usuario',      usuarioRoutes)
app.use('/v1/IANES/produto',      produtoRoutes)
app.use('/v1/IANES/lote',         loteRoutes)
app.use('/v1/IANES/movimentacao', movimentacaoRoutes)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, function () {
    console.log(`API aguardando requisições na porta ${PORT} ;)`)
})