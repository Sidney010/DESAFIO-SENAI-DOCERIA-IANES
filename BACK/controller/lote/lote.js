/******************************************************************************
 * Objetivo: Controller responsável pela lógica de lotes de estoque
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const loteDAO          = require('../../model/DAO/lote.js')
const produtoDAO       = require('../../model/DAO/produto.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')


// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD (RF-009/3)
// ════════════════════════════════════════════════════════════════════════════

const dashboard = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        // Atualiza os status antes de retornar o dashboard
        // Garante que a resposta sempre reflete o dia atual (RNF-003/3)
        await loteDAO.setAtualizarStatusValidade()

        let resultDashboard = await loteDAO.getDashboardEstoque()

        if (resultDashboard !== false) {
            if (resultDashboard.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.dashboard = resultDashboard
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
//  LISTAGEM COMPLETA
// ════════════════════════════════════════════════════════════════════════════

const listarLotes = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultLotes = await loteDAO.getSelectAllLotes()

        if (resultLotes) {
            if (resultLotes.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.lotes = resultLotes
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

const buscarLoteId = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {
            let resultLote = await loteDAO.getSelectLoteById(Number(id))

            if (resultLote) {
                if (resultLote.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.lote = resultLote[0]
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
//  BUSCA POR STATUS (RF-011/3 e RF-012/3)
// ════════════════════════════════════════════════════════════════════════════

const buscarLotesPorStatus = async function (status) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        const statusValidos = ['No prazo', 'Alerta', 'Vencido']

        if (status && !statusValidos.includes(status)) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message +=
                ' [status inválido — use: "No prazo", "Alerta" ou "Vencido"]'
            return MESSAGES.ERROR_REQUIRED_FIELDS // 400
        }

        // Atualiza os status antes de filtrar
        await loteDAO.setAtualizarStatusValidade()

        let resultLotes = await loteDAO.getSelectLotesPorStatus(status || null)

        if (resultLotes !== false) {
            if (resultLotes.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.lotes = resultLotes
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
//  ALERTAS DE ESTOQUE BAIXO (RF-015/4)
// ════════════════════════════════════════════════════════════════════════════

const alertasEstoqueBaixo = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultAlertas = await loteDAO.getAlertasEstoqueBaixo()

        if (resultAlertas !== false) {
            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.alertas      = resultAlertas
            MESSAGES.HEADER.response.total_alertas = resultAlertas.length
            return MESSAGES.HEADER // 200 (mesmo sem alertas, retorna array vazio)
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  CADASTRAR LOTE (RF-007/3 e RF-008/3)
// ════════════════════════════════════════════════════════════════════════════

const cadastrarLote = async function (lote, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            let validar = await validarDadosLote(lote)
            if (validar) return validar // 400

            // Verifica se o produto existe
            let produtoExiste = await produtoDAO.getSelectProductById(lote.id_produto)
            if (!produtoExiste) {
                MESSAGES.ERROR_NOT_FOUND.message = 'Produto não encontrado!'
                return MESSAGES.ERROR_NOT_FOUND // 404
            }

            let resultLote = await loteDAO.setInsertLote(lote)

            if (resultLote) {
                let lastID = await loteDAO.getSelectLastID()

                if (lastID) {
                    // Busca o lote recém criado para retornar o status calculado pelo trigger
                    let loteCriado = await loteDAO.getSelectLoteById(lastID)

                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_CREATED_ITEM.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_CREATED_ITEM.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_CREATED_ITEM.message
                    MESSAGES.HEADER.response.lote = loteCriado ? loteCriado[0] : { id_lote: lastID }
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
//  ATUALIZAR LOTE
// ════════════════════════════════════════════════════════════════════════════

const atualizarLote = async function (lote, id, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            let validarID = await buscarLoteId(id)
            if (validarID.status_code !== 200) return validarID // 400 | 404 | 500

            // Validação parcial — só valida o que foi enviado
            if (lote.data_vencimento !== undefined) {
                let validarData = validarDataVencimento(lote.data_vencimento)
                if (validarData) return validarData // 400
            }

            if (lote.tipo_medida !== undefined) {
                let validarMedida = validarTipoMedida(lote.tipo_medida)
                if (validarMedida) return validarMedida // 400
            }

            lote.id_lote = Number(id)

            let resultLote = await loteDAO.setUpdateLote(lote)

            if (resultLote) {
                let loteAtualizado = await loteDAO.getSelectLoteById(Number(id))

                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_UPDATED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_UPDATED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_UPDATED_ITEM.message
                MESSAGES.HEADER.response.lote = loteAtualizado ? loteAtualizado[0] : { id_lote: Number(id) }
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
//  EXCLUIR LOTE
// ════════════════════════════════════════════════════════════════════════════

const excluirLote = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {

            let validarID = await buscarLoteId(id)
            if (validarID.status_code !== 200) return MESSAGES.ERROR_NOT_FOUND // 404

            let result = await loteDAO.setDeleteLote(Number(id))

            if (result) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_DELETED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_DELETED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_DELETED_ITEM.message
                delete MESSAGES.HEADER.response
                return MESSAGES.HEADER // 200
            } else {
                // Provavelmente há movimentações vinculadas (RESTRICT)
                MESSAGES.ERROR_INTERNAL_SERVER_MODEL.message =
                    'Não é possível excluir um lote com movimentações registradas!'
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

const validarDadosLote = async function (lote) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    // Produto: obrigatório
    if (!lote.id_produto || isNaN(lote.id_produto) || lote.id_produto <= 0) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [id_produto inválido ou não informado]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Data de fabricação: obrigatória
    if (!lote.data_fabricacao || isNaN(Date.parse(lote.data_fabricacao))) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [data_fabricacao inválida ou não informada]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Data de vencimento: obrigatória
    let validarVencimento = validarDataVencimento(lote.data_vencimento)
    if (validarVencimento) return validarVencimento

    // Fabricação não pode ser posterior ao vencimento
    if (new Date(lote.data_fabricacao) > new Date(lote.data_vencimento)) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [data_fabricacao não pode ser posterior à data_vencimento]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Tipo de medida: obrigatório
    let validarMedida = validarTipoMedida(lote.tipo_medida)
    if (validarMedida) return validarMedida

    // Quantidade: obrigatória e positiva
    if (!lote.quantidade || isNaN(lote.quantidade) || lote.quantidade <= 0) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [quantidade deve ser um número maior que zero]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    return false
}

const validarDataVencimento = function (data_vencimento) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    if (!data_vencimento || isNaN(Date.parse(data_vencimento))) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [data_vencimento inválida ou não informada]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    return false
}

const validarTipoMedida = function (tipo_medida) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    const tiposValidos = ['peso', 'porcao']

    if (!tipo_medida || !tiposValidos.includes(tipo_medida)) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [tipo_medida inválido — use "peso" ou "porcao"]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    return false
}


module.exports = {
    dashboard,
    listarLotes,
    buscarLoteId,
    buscarLotesPorStatus,
    alertasEstoqueBaixo,
    cadastrarLote,
    atualizarLote,
    excluirLote
}