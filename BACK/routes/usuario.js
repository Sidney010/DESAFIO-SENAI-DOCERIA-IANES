/******************************************************************************
 * Objetivo: Rotas responsáveis pelas requisições de usuários
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const express  = require('express')
const cors     = require('cors')

const bodyParserJson = express.json()

const controllerUsuario = require('../controller/usuario/usuario.js')
const { authMiddleware } = require('../controller/auth/jwt.js')

const router = express.Router()

// Configuração de CORS no router
router.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})


// ────────────────────────────────────────────────────────────────────────────
//  ROTAS PÚBLICAS (sem autenticação)
// ────────────────────────────────────────────────────────────────────────────

// POST /v1/IANES/usuario/login
// Body: { email, senha }
router.post('/login', cors(), bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerUsuario.loginUsuario(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/usuario
// Body: { nome, email, senha }
router.post('/', cors(), bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerUsuario.cadastrarUsuario(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/usuario/recuperar-senha
// Body: { email }
router.post('/recuperar-senha', cors(), bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerUsuario.solicitarRecuperacaoSenha(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/usuario/redefinir-senha
// Body: { email, codigo, nova_senha }
router.post('/redefinir-senha', cors(), bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerUsuario.redefinirSenha(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// ────────────────────────────────────────────────────────────────────────────
//  ROTAS PROTEGIDAS (requerem Bearer Token — RNF-002/2)
// ────────────────────────────────────────────────────────────────────────────

// GET /v1/IANES/usuario
router.get('/', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerUsuario.listarUsuarios()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/usuario/:id
router.get('/:id', cors(), authMiddleware, async function (request, response) {
    let idUsuario = request.params.id

    let resultado = await controllerUsuario.buscarUsuarioId(idUsuario)

    response.status(resultado.status_code)
    response.json(resultado)
})


// PUT /v1/IANES/usuario/:id
// Body: { nome?, email?, senha? }  — todos opcionais (atualização parcial)
router.put('/:id', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let idUsuario   = request.params.id
    let contentType = request.headers['content-type']

    let resultado = await controllerUsuario.atualizarUsuario(dadosBody, idUsuario, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// DELETE /v1/IANES/usuario/:id  (soft delete — desativa o usuário)
router.delete('/:id', cors(), authMiddleware, async function (request, response) {
    let idUsuario = request.params.id

    let resultado = await controllerUsuario.desativarUsuario(idUsuario)

    response.status(resultado.status_code)
    response.json(resultado)
})


module.exports = router