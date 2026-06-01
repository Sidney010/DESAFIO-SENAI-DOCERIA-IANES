/******************************************************************************
 * Objetivo: Controller responsável pela lógica de notificações
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const notificacaoDAO   = require('../../model/DAO/notificacao.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')


// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD DE NOTIFICAÇÕES (RF-013/4, RF-014/4, RF-015/4)
//  Retorna todos os alertas ativos consolidados e priorizados
// ════════════════════════════════════════════════════════════════════════════

const dashboardNotificacoes = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultNotificacoes = await notificacaoDAO.getNotificacoesDashboard()

        if (resultNotificacoes !== false) {

            // Separa as notificações por tipo para facilitar a renderização no front
            const vencidos     = resultNotificacoes.filter(n => n.status_validade === 'Vencido')
            const alertas      = resultNotificacoes.filter(n => n.status_validade === 'Alerta')
            const estoqueBaixo = resultNotificacoes.filter(n => n.tipo_notificacao === 'estoque_baixo')

            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.notificacoes = {
                // Contagem total para o badge do sino no front
                total_alertas: resultNotificacoes.length,
                resumo: {
                    vencidos:      vencidos.length,
                    alertas:       alertas.length,
                    estoque_baixo: estoqueBaixo.length
                },
                // Lista completa já ordenada por criticidade (procedure cuida disso)
                itens: resultNotificacoes
            }
            return MESSAGES.HEADER // 200

        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  NOTIFICAÇÕES DE VALIDADE (RF-013/4 e RF-014/4)
//  Retorna apenas lotes vencidos e em alerta
// ════════════════════════════════════════════════════════════════════════════

const notificacoesValidade = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultValidade = await notificacaoDAO.getNotificacoesValidade()

        if (resultValidade !== false) {
            if (resultValidade.length > 0) {

                const vencidos = resultValidade.filter(n => n.status_validade === 'Vencido')
                const alertas  = resultValidade.filter(n => n.status_validade === 'Alerta')

                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.validade = {
                    total:    resultValidade.length,
                    vencidos: vencidos,
                    alertas:  alertas
                }
                return MESSAGES.HEADER // 200

            } else {
                // Nenhum alerta de validade — retorna 200 com lista vazia
                // (não é um erro, é uma boa notícia para a doceria 🎉)
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = 'Nenhum alerta de validade no momento.'
                MESSAGES.HEADER.response.validade = {
                    total:    0,
                    vencidos: [],
                    alertas:  []
                }
                return MESSAGES.HEADER // 200
            }
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  NOTIFICAÇÕES DE ESTOQUE BAIXO (RF-015/4)
// ════════════════════════════════════════════════════════════════════════════

const notificacoesEstoqueBaixo = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultEstoque = await notificacaoDAO.getNotificacoesEstoqueBaixo()

        if (resultEstoque !== false) {
            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.estoque_baixo = {
                total: resultEstoque.length,
                itens: resultEstoque
            }
            return MESSAGES.HEADER // 200
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


// ════════════════════════════════════════════════════════════════════════════
//  CONTAGEM DE NOTIFICAÇÕES (para o badge do sino no front)
//  Rota leve — não retorna os itens, só os números
// ════════════════════════════════════════════════════════════════════════════

const contagemNotificacoes = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultContagem = await notificacaoDAO.getContagemNotificacoes()

        if (resultContagem !== false) {
            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.contagem = resultContagem
            return MESSAGES.HEADER // 200
        } else {
            return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


module.exports = {
    dashboardNotificacoes,
    notificacoesValidade,
    notificacoesEstoqueBaixo,
    contagemNotificacoes
}