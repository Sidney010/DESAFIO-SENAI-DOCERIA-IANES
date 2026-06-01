/******************************************************************************
 * Objetivo: DAO responsável pela conexão de notificações
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)


// ── Retorna todas as notificações ativas via Procedure ────────────────────────
// Consolida: vencidos + alertas de validade + estoque baixo
const getNotificacoesDashboard = async function () {
    try {
        const result = await knexDatabase.raw('CALL sp_notificacoes_dashboard()')
        return result[0][0]
    } catch (error) {
        console.error('[DAO notificacao] getNotificacoesDashboard:', error.message)
        return false
    }
}


// ── Retorna apenas notificações de validade (Vencido e Alerta) ────────────────
const getNotificacoesValidade = async function () {
    try {
        return await knexDatabase('tb_lote as l')
            .join('tb_produto as p',   'p.id_produto',   'l.id_produto')
            .join('tb_categoria as c', 'c.id_categoria', 'p.id_categoria')
            .select(
                'l.id_lote',
                'l.data_vencimento',
                'l.status_validade',
                'l.tipo_medida',
                'l.quantidade_peso',
                'l.quantidade_porcoes',
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'c.nome_categoria',
                knexDatabase.raw('DATEDIFF(l.data_vencimento, CURDATE()) AS dias_para_vencer')
            )
            .whereIn('l.status_validade', ['Vencido', 'Alerta'])
            .orderBy('l.data_vencimento', 'asc')
    } catch (error) {
        console.error('[DAO notificacao] getNotificacoesValidade:', error.message)
        return false
    }
}


// ── Retorna apenas notificações de estoque baixo ──────────────────────────────
const getNotificacoesEstoqueBaixo = async function () {
    try {
        const result = await knexDatabase.raw('CALL sp_alertas_estoque_baixo()')
        return result[0][0]
    } catch (error) {
        console.error('[DAO notificacao] getNotificacoesEstoqueBaixo:', error.message)
        return false
    }
}


// ── Retorna contagem de notificações por prioridade (para badge no front) ─────
const getContagemNotificacoes = async function () {
    try {
        const alta = await knexDatabase('tb_lote')
            .where({ status_validade: 'Vencido' })
            .count('id_lote as total')
            .first()

        const media = await knexDatabase('tb_lote')
            .where({ status_validade: 'Alerta' })
            .count('id_lote as total')
            .first()

        const baixa = await knexDatabase('tb_produto as p')
            .leftJoin('tb_lote as l', 'l.id_produto', 'p.id_produto')
            .where('p.limite_minimo_alerta', '>', 0)
            .groupBy('p.id_produto', 'p.limite_minimo_alerta')
            .havingRaw(`
                COALESCE(SUM(
                    CASE
                        WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
                        WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
                        ELSE 0
                    END
                ), 0) <= p.limite_minimo_alerta
            `)
            .count('p.id_produto as total')

        return {
            alta:  Number(alta.total),
            media: Number(media.total),
            baixa: baixa.length,
            total: Number(alta.total) + Number(media.total) + baixa.length
        }
    } catch (error) {
        console.error('[DAO notificacao] getContagemNotificacoes:', error.message)
        return false
    }
}


module.exports = {
    getNotificacoesDashboard,
    getNotificacoesValidade,
    getNotificacoesEstoqueBaixo,
    getContagemNotificacoes
}