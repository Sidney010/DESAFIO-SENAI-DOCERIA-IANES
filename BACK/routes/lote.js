/******************************************************************************
 * Objetivo: Rotas responsáveis pelas requisições de lotes de estoque
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const express  = require('express')
const cors     = require('cors')

const bodyParserJson = express.json()

const controllerLote = require('../controller/lote/lote.js')
const { authMiddleware } = require('../controller/auth/jwt.js')

const router = express.Router()

router.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})


// ────────────────────────────────────────────────────────────────────────────
//  TODAS AS ROTAS SÃO PROTEGIDAS (RNF-002/2)
// ────────────────────────────────────────────────────────────────────────────

// GET /v1/IANES/lote/dashboard
// Retorna visão consolidada do estoque com status crítico e flag de estoque baixo
// Atualiza os status antes de retornar (RNF-003/3)
router.get('/dashboard', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerLote.dashboard()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/lote/alertas
// Retorna produtos com estoque abaixo do limite mínimo (RF-015/4)
router.get('/alertas', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerLote.alertasEstoqueBaixo()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/lote/status?valor=Vencido
// Filtra lotes por status: "No prazo", "Alerta" ou "Vencido" (RF-011/3)
// Se valor não for informado, retorna todos os lotes
router.get('/status', cors(), authMiddleware, async function (request, response) {
    let status = request.query.valor

    let resultado = await controllerLote.buscarLotesPorStatus(status)

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/lote
// Retorna todos os lotes com dados do produto e categoria
router.get('/', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerLote.listarLotes()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/lote/:id
router.get('/:id', cors(), authMiddleware, async function (request, response) {
    let idLote = request.params.id

    let resultado = await controllerLote.buscarLoteId(idLote)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/lote
// Body obrigatório: { id_produto, data_fabricacao, data_vencimento, tipo_medida, quantidade }
// tipo_medida aceita: "peso" ou "porcao"
// status_validade é calculado automaticamente pelo trigger
router.post('/', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerLote.cadastrarLote(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// PUT /v1/IANES/lote/:id
// Campos atualizáveis: data_fabricacao, data_vencimento, tipo_medida
// status_validade é recalculado automaticamente pelo trigger após atualizar data_vencimento
router.put('/:id', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let idLote      = request.params.id
    let contentType = request.headers['content-type']

    let resultado = await controllerLote.atualizarLote(dadosBody, idLote, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// DELETE /v1/IANES/lote/:id
// ATENÇÃO: falha se houver movimentações vinculadas ao lote (FK RESTRICT)
router.delete('/:id', cors(), authMiddleware, async function (request, response) {
    let idLote = request.params.id

    let resultado = await controllerLote.excluirLote(idLote)

    response.status(resultado.status_code)
    response.json(resultado)
})


module.exports = router