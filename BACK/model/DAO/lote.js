/******************************************************************************
 * Objetivo: DAO responsável pela conexão de lotes
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)
const db = (trx) => trx || knexDatabase


// ── Retorna todos os lotes com dados do produto e categoria ───────────────────
const getSelectAllLotes = async function () {
    try {
        return await knexDatabase('tb_lote as l')
            .join('tb_produto as p',   'p.id_produto',   'l.id_produto')
            .join('tb_categoria as c', 'c.id_categoria', 'p.id_categoria')
            .select(
                'l.id_lote',
                'l.data_fabricacao',
                'l.data_vencimento',
                'l.tipo_medida',
                'l.quantidade_peso',
                'l.quantidade_porcoes',
                'l.status_validade',
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'c.nome_categoria'
            )
            .orderBy('l.data_vencimento', 'asc')
    } catch (error) {
        console.error('[DAO lote] getSelectAllLotes:', error.message)
        return false
    }
}


// ── Retorna lote por ID com dados do produto ──────────────────────────────────
const getSelectLoteById = async function (id_lote) {
    try {
        const result = await knexDatabase('tb_lote as l')
            .join('tb_produto as p',   'p.id_produto',   'l.id_produto')
            .join('tb_categoria as c', 'c.id_categoria', 'p.id_categoria')
            .select(
                'l.id_lote',
                'l.data_fabricacao',
                'l.data_vencimento',
                'l.tipo_medida',
                'l.quantidade_peso',
                'l.quantidade_porcoes',
                'l.status_validade',
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'c.nome_categoria'
            )
            .where('l.id_lote', id_lote)

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO lote] getSelectLoteById:', error.message)
        return false
    }
}


// ── Retorna lotes de um produto específico ────────────────────────────────────
const getSelectLotesByProduto = async function (id_produto) {
    try {
        const result = await knexDatabase('tb_lote')
            .where({ id_produto })
            .orderBy('data_vencimento', 'asc')

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO lote] getSelectLotesByProduto:', error.message)
        return false
    }
}


// ── Dashboard consolidado via Procedure (RF-009/3) ────────────────────────────
const getDashboardEstoque = async function () {
    try {
        const result = await knexDatabase.raw('CALL sp_dashboard_estoque()')
        return result[0][0]
    } catch (error) {
        console.error('[DAO lote] getDashboardEstoque:', error.message)
        return false
    }
}


// ── Lotes filtrados por status via Procedure (RF-011/3) ───────────────────────
const getSelectLotesPorStatus = async function (status) {
    try {
        const result = await knexDatabase.raw(
            'CALL sp_lotes_por_status(?)',
            [status || null]
        )
        return result[0][0]
    } catch (error) {
        console.error('[DAO lote] getSelectLotesPorStatus:', error.message)
        return false
    }
}


// ── Alertas de estoque baixo via Procedure (RF-015/4) ────────────────────────
const getAlertasEstoqueBaixo = async function () {
    try {
        const result = await knexDatabase.raw('CALL sp_alertas_estoque_baixo()')
        return result[0][0]
    } catch (error) {
        console.error('[DAO lote] getAlertasEstoqueBaixo:', error.message)
        return false
    }
}


// ── Retorna último ID inserido ────────────────────────────────────────────────
const getSelectLastID = async function () {
    try {
        const result = await knexDatabase('tb_lote')
            .select('id_lote')
            .orderBy('id_lote', 'desc')
            .first()

        return result ? result.id_lote : false
    } catch (error) {
        console.error('[DAO lote] getSelectLastID:', error.message)
        return false
    }
}


// ── Insere lote (status calculado automaticamente pelo trigger) ───────────────
const setInsertLote = async function (lote, trx = null) {
    try {
        const result = await db(trx)('tb_lote')
            .insert({
                data_fabricacao:  lote.data_fabricacao,
                data_vencimento:  lote.data_vencimento,
                tipo_medida:      lote.tipo_medida,
                quantidade_peso:  lote.tipo_medida === 'peso'   ? lote.quantidade : null,
                quantidade_porcoes: lote.tipo_medida === 'porcao' ? lote.quantidade : null,
                id_produto:       lote.id_produto
                // status_validade é definido pelo trigger no banco
            })

        return result[0]
    } catch (error) {
        console.error('[DAO lote] setInsertLote:', error.message)
        return false
    }
}


// ── Atualiza lote ─────────────────────────────────────────────────────────────
const setUpdateLote = async function (lote, trx = null) {
    try {
        const dados = {}

        if (lote.data_fabricacao !== undefined) dados.data_fabricacao = lote.data_fabricacao
        if (lote.data_vencimento !== undefined) dados.data_vencimento = lote.data_vencimento
        if (lote.tipo_medida     !== undefined) dados.tipo_medida     = lote.tipo_medida

        if (Object.keys(dados).length === 0) return true

        const result = await db(trx)('tb_lote')
            .where({ id_lote: lote.id_lote })
            .update(dados)

        return result > 0
    } catch (error) {
        console.error('[DAO lote] setUpdateLote:', error.message)
        return false
    }
}


// ── Deleta lote ───────────────────────────────────────────────────────────────
// ATENÇÃO: falhará silenciosamente se houver movimentações vinculadas (RESTRICT)
const setDeleteLote = async function (id_lote, trx = null) {
    try {
        const result = await db(trx)('tb_lote')
            .where({ id_lote })
            .del()

        return result > 0
    } catch (error) {
        console.error('[DAO lote] setDeleteLote:', error.message)
        return false
    }
}


// ── Atualiza status de validade de todos os lotes via Procedure ───────────────
const setAtualizarStatusValidade = async function () {
    try {
        await knexDatabase.raw('CALL sp_atualizar_status_validade()')
        return true
    } catch (error) {
        console.error('[DAO lote] setAtualizarStatusValidade:', error.message)
        return false
    }
}


module.exports = {
    getSelectAllLotes,
    getSelectLoteById,
    getSelectLotesByProduto,
    getDashboardEstoque,
    getSelectLotesPorStatus,
    getAlertasEstoqueBaixo,
    getSelectLastID,
    setInsertLote,
    setUpdateLote,
    setDeleteLote,
    setAtualizarStatusValidade
}