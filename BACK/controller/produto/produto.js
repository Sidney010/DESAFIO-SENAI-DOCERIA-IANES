/******************************************************************************
 * Objetivo: Controller responsável pela lógica de produtos
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const produtoDAO       = require('../../model/DAO/produto.js')
const categoriaDAO     = require('../../model/DAO/categoria.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')


// ════════════════════════════════════════════════════════════════════════════
//  LISTAGEM COMPLETA
// ════════════════════════════════════════════════════════════════════════════

const listarProdutos = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultProdutos = await produtoDAO.getSelectAllProducts()

        if (resultProdutos) {
            if (resultProdutos.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.produtos = resultProdutos
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

const buscarProdutoId = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {
            let resultProduto = await produtoDAO.getSelectProductById(Number(id))

            if (resultProduto) {
                if (resultProduto.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.produto = resultProduto[0]
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
//  BUSCA COM FILTROS (RF-011/3)
// ════════════════════════════════════════════════════════════════════════════

const buscarProdutosFiltro = async function (filtros) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        // Extrai e sanitiza os filtros da query string
        const nome      = filtros.nome      ? String(filtros.nome).trim()      : null
        const codigo    = filtros.codigo    ? Number(filtros.codigo)            : null
        const categoria = filtros.categoria ? Number(filtros.categoria)         : null

        // Valida que pelo menos um filtro foi enviado
        if (!nome && !codigo && !categoria) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [informe ao menos um filtro: nome, codigo ou categoria]'
            return MESSAGES.ERROR_REQUIRED_FIELDS // 400
        }

        let resultProdutos = await produtoDAO.getSearchProducts(nome, codigo, categoria)

        if (resultProdutos !== false) {
            if (resultProdutos.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.produtos = resultProdutos
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
//  PRÓXIMO CÓDIGO DISPONÍVEL
// ════════════════════════════════════════════════════════════════════════════

const proximoCodigo = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let proximo = await produtoDAO.getNextCodigo()

        if (proximo) {
            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.proximo_codigo = proximo
            return MESSAGES.HEADER // 200
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  CADASTRAR
// ════════════════════════════════════════════════════════════════════════════

const cadastrarProduto = async function (produto, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            // Valida campos obrigatórios
            let validar = await validarDadosProduto(produto)
            if (validar) return validar // 400

            // Verifica se a categoria existe
            let categoriaExiste = await categoriaDAO.getSelectByIdCategorie(produto.id_categoria)
            if (!categoriaExiste) {
                MESSAGES.ERROR_NOT_FOUND.message = 'Categoria não encontrada!'
                return MESSAGES.ERROR_NOT_FOUND // 404
            }

            // Verifica unicidade do código identificador (RF-005/2)
            // Se não veio código, usa o próximo disponível automaticamente
            if (!produto.codigo_identificador) {
                produto.codigo_identificador = await produtoDAO.getNextCodigo()
            } else {
                let codigoExiste = await produtoDAO.getCheckCodigoExists(produto.codigo_identificador)
                if (codigoExiste) {
                    MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [codigo_identificador já está em uso]'
                    return MESSAGES.ERROR_REQUIRED_FIELDS // 400
                }
            }

            let resultProduto = await produtoDAO.setInsertProduct(produto)

            if (resultProduto) {
                let lastID = await produtoDAO.getSelectLastID()

                if (lastID) {
                    produto.id_produto = lastID
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_CREATED_ITEM.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_CREATED_ITEM.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_CREATED_ITEM.message
                    MESSAGES.HEADER.response.produto = produto
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

const atualizarProduto = async function (produto, id, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            // Valida somente os campos que chegaram
            let validar = await validarDadosProdutoAtualizacao(produto)
            if (validar) return validar // 400

            // Verifica se o produto existe
            let validarID = await buscarProdutoId(id)
            if (validarID.status_code !== 200) return validarID // 400 | 404 | 500

            // Se trocou a categoria, verifica se a nova existe
            if (produto.id_categoria) {
                let categoriaExiste = await categoriaDAO.getSelectByIdCategorie(produto.id_categoria)
                if (!categoriaExiste) {
                    MESSAGES.ERROR_NOT_FOUND.message = 'Categoria não encontrada!'
                    return MESSAGES.ERROR_NOT_FOUND // 404
                }
            }

            // Se trocou o código, verifica unicidade ignorando o próprio produto
            if (produto.codigo_identificador) {
                let codigoExiste = await produtoDAO.getCheckCodigoExists(
                    produto.codigo_identificador,
                    Number(id)
                )
                if (codigoExiste) {
                    MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [codigo_identificador já está em uso]'
                    return MESSAGES.ERROR_REQUIRED_FIELDS // 400
                }
            }

            produto.id_produto = Number(id)

            let resultProduto = await produtoDAO.setUpdateProduct(produto)

            if (resultProduto) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_UPDATED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_UPDATED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_UPDATED_ITEM.message
                MESSAGES.HEADER.response.produto = produto
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

const excluirProduto = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {

            let validarID = await buscarProdutoId(id)
            if (validarID.status_code !== 200) return MESSAGES.ERROR_NOT_FOUND // 404

            let resultProduto = await produtoDAO.setDeleteProduct(Number(id))

            if (resultProduto) {
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
//  VALIDAÇÕES INTERNAS
// ════════════════════════════════════════════════════════════════════════════

// Valida cadastro completo (RF-005/2)
const validarDadosProduto = async function (produto) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    // Nome: obrigatório, mínimo 4 caracteres
    if (!produto.nome_produto || produto.nome_produto.trim().length < 4 || produto.nome_produto.length > 150) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome_produto deve ter entre 4 e 150 caracteres]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Categoria: obrigatória
    if (!produto.id_categoria || isNaN(produto.id_categoria) || produto.id_categoria <= 0) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [id_categoria inválido ou não informado]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Limite mínimo: se informado, deve ser número não negativo
    if (produto.limite_minimo_alerta !== undefined) {
        if (isNaN(produto.limite_minimo_alerta) || produto.limite_minimo_alerta < 0) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [limite_minimo_alerta deve ser um número maior ou igual a zero]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    return false
}

// Valida atualização parcial — só valida o que veio no body
const validarDadosProdutoAtualizacao = async function (produto) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    if (produto.nome_produto !== undefined) {
        if (produto.nome_produto.trim().length < 4 || produto.nome_produto.length > 150) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome_produto deve ter entre 4 e 150 caracteres]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    if (produto.id_categoria !== undefined) {
        if (isNaN(produto.id_categoria) || produto.id_categoria <= 0) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [id_categoria inválido]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    if (produto.limite_minimo_alerta !== undefined) {
        if (isNaN(produto.limite_minimo_alerta) || produto.limite_minimo_alerta < 0) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [limite_minimo_alerta deve ser maior ou igual a zero]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    return false
}


module.exports = {
    listarProdutos,
    buscarProdutoId,
    buscarProdutosFiltro,
    proximoCodigo,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
}