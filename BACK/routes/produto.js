/******************************************************************************
 * Objetivo: Rotas responsáveis pelas requisições de produtos
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const express  = require('express')
const cors     = require('cors')

const bodyParserJson = express.json()

const controllerProduto = require('../controller/produto/produto.js')
const { authMiddleware } = require('../controller/auth/jwt.js')

const router = express.Router()

router.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})


// ────────────────────────────────────────────────────────────────────────────
//  TODAS AS ROTAS DE PRODUTO SÃO PROTEGIDAS (RNF-002/2)
// ────────────────────────────────────────────────────────────────────────────

// GET /v1/IANES/produto
// Retorna todos os produtos com o nome da categoria
router.get('/', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerProduto.listarProdutos()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/produto/filtro?nome=bolo&codigo=10&categoria=2
// Busca com filtros dinâmicos (RF-011/3)
// Pelo menos um parâmetro deve ser informado
router.get('/filtro', cors(), authMiddleware, async function (request, response) {
    let filtros = request.query

    let resultado = await controllerProduto.buscarProdutosFiltro(filtros)

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/produto/proximo-codigo
// Retorna o próximo código identificador disponível (RF-005/2)
router.get('/proximo-codigo', cors(), authMiddleware, async function (request, response) {
    let resultado = await controllerProduto.proximoCodigo()

    response.status(resultado.status_code)
    response.json(resultado)
})


// GET /v1/IANES/produto/:id
router.get('/:id', cors(), authMiddleware, async function (request, response) {
    let idProduto = request.params.id

    let resultado = await controllerProduto.buscarProdutoId(idProduto)

    response.status(resultado.status_code)
    response.json(resultado)
})


// POST /v1/IANES/produto
// Body obrigatório: { nome_produto, id_categoria }
// Body opcional:   { codigo_identificador, sabor_massa, recheio, cobertura, detalhes, limite_minimo_alerta }
// Se codigo_identificador não for enviado, é gerado automaticamente
router.post('/', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let contentType = request.headers['content-type']

    let resultado = await controllerProduto.cadastrarProduto(dadosBody, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// PUT /v1/IANES/produto/:id
// Todos os campos são opcionais — atualização parcial
router.put('/:id', cors(), authMiddleware, bodyParserJson, async function (request, response) {
    let dadosBody   = request.body
    let idProduto   = request.params.id
    let contentType = request.headers['content-type']

    let resultado = await controllerProduto.atualizarProduto(dadosBody, idProduto, contentType)

    response.status(resultado.status_code)
    response.json(resultado)
})


// DELETE /v1/IANES/produto/:id
// ATENÇÃO: deleta o produto E todos os lotes vinculados (ON DELETE CASCADE)
// Movimentações com lotes desse produto serão bloqueadas pelo RESTRICT
router.delete('/:id', cors(), authMiddleware, async function (request, response) {
    let idProduto = request.params.id

    let resultado = await controllerProduto.excluirProduto(idProduto)

    response.status(resultado.status_code)
    response.json(resultado)
})


module.exports = router