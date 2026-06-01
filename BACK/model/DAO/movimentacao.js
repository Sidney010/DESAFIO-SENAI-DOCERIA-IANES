/******************************************************************************
 * Objetivo: DAO responsável pela conexão de movimentações de estoque
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)
const db = (trx) => trx || knexDatabase


// ── Retorna todas as movimentações com dados do lote, produto e usuário ───────
const getSelectAllMovimentacoes = async function () {
    try {
        return await knexDatabase('tb_movimentacao as m')
            .join('tb_lote as l',     'l.id_lote',     'm.id_lote')
            .join('tb_produto as p',  'p.id_produto',  'l.id_produto')
            .join('tb_usuario as u',  'u.id_usuario',  'm.id_usuario')
            .select(
                'm.id_movimentacao',
                'm.tipo_movimentacao',
                'm.motivo',
                'm.quantidade',
                'm.data_hora',
                'l.id_lote',
                'l.data_vencimento',
                'l.status_validade',
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'u.id_usuario',
                'u.nome as nome_usuario'
            )
            .orderBy('m.data_hora', 'desc')
    } catch (error) {
        console.error('[DAO movimentacao] getSelectAllMovimentacoes:', error.message)
        return false
    }
}


// ── Retorna movimentação por ID ───────────────────────────────────────────────
const getSelectMovimentacaoById = async function (id_movimentacao) {
    try {
        const result = await knexDatabase('tb_movimentacao as m')
            .join('tb_lote as l',    'l.id_lote',    'm.id_lote')
            .join('tb_produto as p', 'p.id_produto', 'l.id_produto')
            .join('tb_usuario as u', 'u.id_usuario', 'm.id_usuario')
            .select(
                'm.id_movimentacao',
                'm.tipo_movimentacao',
                'm.motivo',
                'm.quantidade',
                'm.data_hora',
                'l.id_lote',
                'l.data_vencimento',
                'l.status_validade',
                'p.id_produto',
                'p.nome_produto',
                'u.id_usuario',
                'u.nome as nome_usuario'
            )
            .where('m.id_movimentacao', id_movimentacao)

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO movimentacao] getSelectMovimentacaoById:', error.message)
        return false
    }
}


// ── Retorna movimentações de um lote específico ───────────────────────────────
const getSelectMovimentacoesByLote = async function (id_lote) {
    try {
        const result = await knexDatabase('tb_movimentacao as m')
            .join('tb_usuario as u', 'u.id_usuario', 'm.id_usuario')
            .select(
                'm.id_movimentacao',
                'm.tipo_movimentacao',
                'm.motivo',
                'm.quantidade',
                'm.data_hora',
                'u.nome as nome_usuario'
            )
            .where('m.id_lote', id_lote)
            .orderBy('m.data_hora', 'desc')

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO movimentacao] getSelectMovimentacoesByLote:', error.message)
        return false
    }
}


// ── Retorna último ID inserido ────────────────────────────────────────────────
const getSelectLastID = async function () {
    try {
        const result = await knexDatabase('tb_movimentacao')
            .select('id_movimentacao')
            .orderBy('id_movimentacao', 'desc')
            .first()

        return result ? result.id_movimentacao : false
    } catch (error) {
        console.error('[DAO movimentacao] getSelectLastID:', error.message)
        return false
    }
}


// ── Insere movimentação ───────────────────────────────────────────────────────
// Os triggers no banco cuidam de:
//   1. Bloquear entrada em lote vencido
//   2. Bloquear saída com saldo insuficiente
//   3. Atualizar quantidade do lote automaticamente
const setInsertMovimentacao = async function (movimentacao, trx = null) {
    try {
        const result = await db(trx)('tb_movimentacao')
            .insert({
                tipo_movimentacao: movimentacao.tipo_movimentacao,
                motivo:            movimentacao.motivo,
                quantidade:        movimentacao.quantidade,
                id_lote:           movimentacao.id_lote,
                id_usuario:        movimentacao.id_usuario
                // data_hora é preenchida automaticamente pelo DEFAULT CURRENT_TIMESTAMP
            })

        return result[0]
    } catch (error) {
        console.error('[DAO movimentacao] setInsertMovimentacao:', error.message)
        // Repassa o erro do trigger para o controller tratar a mensagem corretamente
        return { error: error.message }
    }
}


module.exports = {
    getSelectAllMovimentacoes,
    getSelectMovimentacaoById,
    getSelectMovimentacoesByLote,
    getSelectLastID,
    setInsertMovimentacao
}