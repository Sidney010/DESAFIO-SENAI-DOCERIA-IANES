/******************************************************************************
 * Objetivo: Controller responsável pela lógica de categorias
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 2.0 — adicionado validação de nome único (RF-006/2)
 ******************************************************************************/

const categoriaDAO     = require('../../model/DAO/categoria.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')


// ════════════════════════════════════════════════════════════════════════════
//  LISTAGEM
// ════════════════════════════════════════════════════════════════════════════

const listarCategorias = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultCategorias = await categoriaDAO.getSelectAllCategories()

        if (resultCategorias) {
            if (resultCategorias.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.categorias = resultCategorias
                return MESSAGES.HEADER // 200
            } else {
                return MESSAGES.ERROR_NOT_FOUND // 404
            }
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  BUSCA POR ID
// ════════════════════════════════════════════════════════════════════════════

const buscarCategoriaId = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {
            let resultCategorias = await categoriaDAO.getSelectByIdCategorie(Number(id))

            if (resultCategorias) {
                if (resultCategorias.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.categoria = resultCategorias[0]
                    return MESSAGES.HEADER // 200
                } else {
                    return MESSAGES.ERROR_NOT_FOUND // 404
                }
            } else {
                return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
            }
        } else {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [ID incorreto]'
            return MESSAGES.ERROR_REQUIRED_FIELDS // 400
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  INSERIR
// ════════════════════════════════════════════════════════════════════════════

const inserirCategoria = async function (categoria, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            let validar = await validarDadosCategoria(categoria)
            if (validar) return validar // 400

            // RF-006/2 — nome único (case-insensitive)
            let nomeExiste = await categoriaDAO.getCheckNomeExists(categoria.nome_categoria)
            if (nomeExiste) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome_categoria já cadastrado]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            let resultCategorias = await categoriaDAO.setInsertCategories(categoria)

            if (resultCategorias) {
                let lastID = await categoriaDAO.getSelectLastID()

                if (lastID) {
                    categoria.id_categoria = lastID
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_CREATED_ITEM.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_CREATED_ITEM.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_CREATED_ITEM.message
                    MESSAGES.HEADER.response.categoria = categoria
                    return MESSAGES.HEADER // 201
                } else {
                    return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
                }
            } else {
                return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
            }
        } else {
            return MESSAGES.ERROR_CONTENT_TYPE // 415
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  ATUALIZAR
// ════════════════════════════════════════════════════════════════════════════

const atualizarCategoria = async function (categoria, id, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            let validar = await validarDadosCategoria(categoria)
            if (validar) return validar // 400

            let validarID = await buscarCategoriaId(id)
            if (validarID.status_code !== 200) return validarID // 400 | 404 | 500

            // RF-006/2 — verifica unicidade ignorando o próprio registro
            let nomeExiste = await categoriaDAO.getCheckNomeExists(categoria.nome_categoria, Number(id))
            if (nomeExiste) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome_categoria já cadastrado]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            categoria.id_categoria = Number(id)

            let resultCategorias = await categoriaDAO.setUpdateCategories(categoria)

            if (resultCategorias) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_UPDATED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_UPDATED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_UPDATED_ITEM.message
                MESSAGES.HEADER.response.categoria = categoria
                return MESSAGES.HEADER // 200
            } else {
                return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
            }
        } else {
            return MESSAGES.ERROR_CONTENT_TYPE // 415
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  EXCLUIR
// ════════════════════════════════════════════════════════════════════════════

const excluirCategoria = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {

            let validarID = await buscarCategoriaId(id)
            if (validarID.status_code !== 200) return MESSAGES.ERROR_NOT_FOUND // 404

            let resultCategorias = await categoriaDAO.setDeleteCategories(Number(id))

            if (resultCategorias) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_DELETED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_DELETED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_DELETED_ITEM.message
                delete MESSAGES.HEADER.response
                return MESSAGES.HEADER // 200
            } else {
                return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
            }
        } else {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [ID incorreto]'
            return MESSAGES.ERROR_REQUIRED_FIELDS // 400
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  VALIDAÇÃO INTERNA
// ════════════════════════════════════════════════════════════════════════════

// RF-006/2: mínimo 4 caracteres, máximo 100
const validarDadosCategoria = async function (categoria) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    if (
        !categoria.nome_categoria ||
        categoria.nome_categoria.trim().length < 4 ||
        categoria.nome_categoria.length > 100
    ) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome_categoria deve ter entre 4 e 100 caracteres]'
        return MESSAGES.ERROR_REQUIRED_FIELDS // 400
    }

    return false
}


module.exports = {
    listarCategorias,
    buscarCategoriaId,
    inserirCategoria,
    atualizarCategoria,
    excluirCategoria
}