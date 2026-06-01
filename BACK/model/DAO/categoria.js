/******************************************************************************
 * Objetivo: DAO responsável pela conexão de categorias
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 2.0 — adicionado getCheckNomeExists para validar unicidade (RF-006/2)
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)
const db = (trx) => trx || knexDatabase


// ── Retorna todas as categorias ───────────────────────────────────────────────
const getSelectAllCategories = async function () {
    try {
        return await knexDatabase('tb_categoria')
            .orderBy('id_categoria', 'desc')
    } catch (error) {
        console.error('[DAO categoria] getSelectAllCategories:', error.message)
        return false
    }
}


// ── Retorna categoria por ID ──────────────────────────────────────────────────
const getSelectByIdCategorie = async function (id_categoria) {
    try {
        const result = await knexDatabase('tb_categoria')
            .where({ id_categoria })

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO categoria] getSelectByIdCategorie:', error.message)
        return false
    }
}


// ── Verifica se o nome já existe (RF-006/2 — nome único) ─────────────────────
// O segundo parâmetro (ignorar_id) é usado na atualização para não
// comparar o registro consigo mesmo
const getCheckNomeExists = async function (nome_categoria, ignorar_id = null) {
    try {
        let query = knexDatabase('tb_categoria')
            .whereRaw('LOWER(nome_categoria) = LOWER(?)', [nome_categoria])

        if (ignorar_id) {
            query = query.andWhereNot({ id_categoria: ignorar_id })
        }

        const result = await query.first()
        return !!result
    } catch (error) {
        console.error('[DAO categoria] getCheckNomeExists:', error.message)
        return false
    }
}


// ── Retorna último ID ─────────────────────────────────────────────────────────
const getSelectLastID = async function () {
    try {
        const result = await knexDatabase('tb_categoria')
            .select('id_categoria')
            .orderBy('id_categoria', 'desc')
            .first()

        return result ? result.id_categoria : false
    } catch (error) {
        console.error('[DAO categoria] getSelectLastID:', error.message)
        return false
    }
}


// ── Insere categoria ──────────────────────────────────────────────────────────
const setInsertCategories = async function (categoria, trx = null) {
    try {
        const result = await db(trx)('tb_categoria')
            .insert({ nome_categoria: categoria.nome_categoria })

        return result[0]
    } catch (error) {
        console.error('[DAO categoria] setInsertCategories:', error.message)
        return false
    }
}


// ── Atualiza categoria ────────────────────────────────────────────────────────
const setUpdateCategories = async function (categoria, trx = null) {
    try {
        const dados = {}

        if (categoria.nome_categoria !== undefined)
            dados.nome_categoria = categoria.nome_categoria

        if (Object.keys(dados).length === 0) return true

        const result = await db(trx)('tb_categoria')
            .where({ id_categoria: categoria.id_categoria })
            .update(dados)

        return result > 0
    } catch (error) {
        console.error('[DAO categoria] setUpdateCategories:', error.message)
        return false
    }
}


// ── Deleta categoria ──────────────────────────────────────────────────────────
const setDeleteCategories = async function (id_categoria, trx = null) {
    try {
        const result = await db(trx)('tb_categoria')
            .where({ id_categoria })
            .del()

        return result > 0
    } catch (error) {
        console.error('[DAO categoria] setDeleteCategories:', error.message)
        return false
    }
}


module.exports = {
    getSelectAllCategories,
    getSelectByIdCategorie,
    getCheckNomeExists,
    getSelectLastID,
    setInsertCategories,
    setUpdateCategories,
    setDeleteCategories
}