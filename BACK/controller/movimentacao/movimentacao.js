/******************************************************************************
 * Objetivo: Controller responsável pela lógica de movimentações de estoque
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const movimentacaoDAO  = require('../../model/DAO/movimentacao.js')
const loteDAO          = require('../../model/DAO/lote.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')


// ════════════════════════════════════════════════════════════════════════════
//  LISTAGEM COMPLETA
// ════════════════════════════════════════════════════════════════════════════

const listarMovimentacoes = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultMovimentacoes = await movimentacaoDAO.getSelectAllMovimentacoes()

        if (resultMovimentacoes) {
            if (resultMovimentacoes.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.movimentacoes = resultMovimentacoes
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

const buscarMovimentacaoId = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {
            let resultMovimentacao = await movimentacaoDAO.getSelectMovimentacaoById(Number(id))

            if (resultMovimentacao) {
                if (resultMovimentacao.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.movimentacao = resultMovimentacao[0]
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
//  BUSCA POR LOTE
// ════════════════════════════════════════════════════════════════════════════

const buscarMovimentacoesPorLote = async function (id_lote) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id_lote) && id_lote != '' && id_lote != null && id_lote > 0) {
            let resultMovimentacoes = await movimentacaoDAO.getSelectMovimentacoesByLote(Number(id_lote))

            if (resultMovimentacoes) {
                if (resultMovimentacoes.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.movimentacoes = resultMovimentacoes
                    return MESSAGES.HEADER // 200
                } else {
                    return MESSAGES.ERROR_NOT_FOUND // 404
                }
            } else {
                return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
            }
        } else {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [ID do lote incorreto]'
            return MESSAGES.ERROR_REQUIRED_FIELDS // 400
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  REGISTRAR MOVIMENTAÇÃO (RF-010/3)
// Os triggers do banco garantem:
//   - Bloqueio de entrada em lote vencido
//   - Bloqueio de saída com saldo insuficiente
//   - Atualização automática do estoque do lote
// ════════════════════════════════════════════════════════════════════════════

const registrarMovimentacao = async function (movimentacao, contentType, id_usuario_token) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            let validar = await validarDadosMovimentacao(movimentacao)
            if (validar) return validar // 400

            // Verifica se o lote existe
            let loteExiste = await loteDAO.getSelectLoteById(movimentacao.id_lote)
            if (!loteExiste) {
                MESSAGES.ERROR_NOT_FOUND.message = 'Lote não encontrado!'
                return MESSAGES.ERROR_NOT_FOUND // 404
            }

            // O id_usuario vem do token JWT — não do body (segurança)
            movimentacao.id_usuario = id_usuario_token

            let resultMovimentacao = await movimentacaoDAO.setInsertMovimentacao(movimentacao)

            // Verifica se o banco retornou erro de trigger
            if (resultMovimentacao && resultMovimentacao.error) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message = resultMovimentacao.error
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            if (resultMovimentacao) {
                let lastID = await movimentacaoDAO.getSelectLastID()

                if (lastID) {
                    let movCriada = await movimentacaoDAO.getSelectMovimentacaoById(lastID)

                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_CREATED_ITEM.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_CREATED_ITEM.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_CREATED_ITEM.message
                    MESSAGES.HEADER.response.movimentacao = movCriada ? movCriada[0] : { id_movimentacao: lastID }
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
//  VALIDAÇÕES INTERNAS
// ════════════════════════════════════════════════════════════════════════════

const validarDadosMovimentacao = async function (movimentacao) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    // Tipo: obrigatório
    const tiposValidos = ['Entrada', 'Saída']
    if (!movimentacao.tipo_movimentacao || !tiposValidos.includes(movimentacao.tipo_movimentacao)) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [tipo_movimentacao inválido — use "Entrada" ou "Saída"]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Motivo: obrigatório
    if (!movimentacao.motivo || movimentacao.motivo.trim().length < 3) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [motivo é obrigatório e deve ter no mínimo 3 caracteres]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Quantidade: obrigatória e positiva
    if (!movimentacao.quantidade || isNaN(movimentacao.quantidade) || movimentacao.quantidade <= 0) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [quantidade deve ser um número maior que zero]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Lote: obrigatório
    if (!movimentacao.id_lote || isNaN(movimentacao.id_lote) || movimentacao.id_lote <= 0) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [id_lote inválido ou não informado]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    return false
}


module.exports = {
    listarMovimentacoes,
    buscarMovimentacaoId,
    buscarMovimentacoesPorLote,
    registrarMovimentacao
}