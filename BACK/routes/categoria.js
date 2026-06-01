/******************************************************************************
 * Objetivo: Rotas responsáveis pelas requisições de categoria
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/
const express = require('express')
const cors = require('cors')

const bodyParserJson = express.json()


const controllerCategoria = require('../controller/categoria/categoria.js')

//configurção do cors 
const router = express.Router()
router.use((request, response, next ) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    next()
})




// retornar todos as categorias
router.get('/', cors(), async function (request, response){

  let categoria  = await controllerCategoria.listarCategorias()
    
    response.status(categoria.status_code)
    response.json(categoria)
})
module.exports = router 


// pegar categoria por id
router.get('/:id', cors(), async function (request, response){
    let idCategoria = request.params.id

    let categoria = await controllerCategoria.buscarCategoriaId(idCategoria)
    response.status(categoria.status_code)
    response.json(categoria)  


})


//inserir categoria
router.post('/', cors(), bodyParserJson, async function (request, response) {


    let dadosBody = request.body
    let contentType = request.headers['content-type']

    let categoria = await controllerCategoria.inserirCategoria(dadosBody, contentType)

    response.status(categoria.status_code)
    response.json(categoria)
})


router.put('/:id', cors(), bodyParserJson, async function(request, response) {
    let dadosBody = request.body
    
    let idCategoria = request.params.id

    let contentType = request.headers['content-type']

    let categoria = await controllerCategoria.atualizarCategoria(dadosBody, idCategoria, contentType)
    response.status(categoria.status_code)
    response.json(categoria)
})

router.delete('/:id', cors(), async function(request, response) {
    let idCategoria = request.params.id
    console.log(idCategoria)
    let categoria = await controllerCategoria.excluirCategoria(idCategoria)

    response.status(categoria.status_code)
    response.json(categoria)
})
