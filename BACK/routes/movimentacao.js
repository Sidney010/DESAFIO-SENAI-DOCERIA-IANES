/******************************************************************************
 * Objetivo: Rotas responsáveis pelas requisições de movimentações de estoque
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const express  = require('express')
const cors     = require('cors')

const bodyParserJson = express.json()

const controllerMovimentacao = require('../controller/movimentacao/movimentacao.js')
const { authMiddleware }     = require('../controller/auth/jwt.js')

const router = express.Router()

router.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})


// ────────────────────────────────────────────────────────────────────────────
//  TODAS AS ROTAS SÃO PROTEGIDAS (RNF-002/2)
// ────────────────────────────────────────────────────────────────────────────

// GET /v1/IANES/movimentacao
// Retorna histórico completo com dados do lote, produto e usuário responsável
router.get('/', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerMovimentacao.listarMovimentacoes()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/movimentacao/:id
router.get('/:id', cors(), authMiddleware, async function (request, response) {
    let idMovimentacao = request.params.id

    let resultado = await controllerMovimentacao.buscarMovimentacaoId(idMovimentacao)

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/movimentacao/lote/:id_lote
// Retorna todo o histórico de movimentações de um lote específico
router.get('/lote/:id_lote', cors(), authMiddleware, async function (request, response) {
    let idLote = request.params.id_lote

    let resultado = await controllerMovimentacao.buscarMovimentacoesPorLote(idLote)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/movimentacao
// Body obrigatório: { tipo_movimentacao, motivo, quantidade, id_lote }
// tipo_movimentacao aceita: "Entrada" ou "Saída"
// id_usuario vem do token JWT — não precisa enviar no body
// Os triggers do banco cuidam de:
//   - Bloquear entrada em lote vencido
//   - Bloquear saída com saldo insuficiente
//   - Atualizar o estoque do lote automaticamente
router.post('/', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    // Extrai o id do usuário logado direto do token decodificado pelo middleware
    let id_usuario_token = request.usuarioId

    let resultado = await controllerMovimentacao.registrarMovimentacao(
        dadosBody,
        contentType,
        id_usuario_token
    )

    response.status(resultado.status_code)
    response.json(resultado)
})


module.exports = router