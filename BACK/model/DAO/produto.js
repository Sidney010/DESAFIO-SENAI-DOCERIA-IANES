/******************************************************************************
 * Objetivo: DAO responsável pela conexão de produtos
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)
const db = (trx) => trx || knexDatabase


// ── Retorna todos os produtos com nome da categoria ───────────────────────────
const getSelectAllProducts = async function () {
    try {
        return await knexDatabase('tb_produto as p')
            .join('tb_categoria as c', 'c.id_categoria', 'p.id_categoria')
            .select(
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'p.sabor_massa',
                'p.recheio',
                'p.cobertura',
                'p.detalhes',
                'p.limite_minimo_alerta',
                'c.id_categoria',
                'c.nome_categoria'
            )
            .orderBy('p.nome_produto', 'asc')
    } catch (error) {
        console.error('[DAO produto] getSelectAllProducts:', error.message)
        return false
    }
}


// ── Retorna produto por ID com nome da categoria ──────────────────────────────
const getSelectProductById = async function (id_produto) {
    try {
        const result = await knexDatabase('tb_produto as p')
            .join('tb_categoria as c', 'c.id_categoria', 'p.id_categoria')
            .select(
                'p.id_produto',
                'p.nome_produto',
                'p.codigo_identificador',
                'p.sabor_massa',
                'p.recheio',
                'p.cobertura',
                'p.detalhes',
                'p.limite_minimo_alerta',
                'c.id_categoria',
                'c.nome_categoria'
            )
            .where('p.id_produto', id_produto)

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO produto] getSelectProductById:', error.message)
        return false
    }
}


// ── Busca com filtros dinâmicos via Procedure (RF-011/3) ──────────────────────
const getSearchProducts = async function (nome, codigo, categoria) {
    try {
        const result = await knexDatabase.raw(
            'CALL sp_buscar_produtos(?, ?, ?)',
            [nome || null, codigo || null, categoria || null]
        )

        // O MySQL retorna o resultado da procedure em result[0][0]
        return result[0][0]
    } catch (error) {
        console.error('[DAO produto] getSearchProducts:', error.message)
        return false
    }
}


// ── Verifica se o código identificador já existe ──────────────────────────────
const getCheckCodigoExists = async function (codigo_identificador, ignorar_id = null) {
    try {
        let query = knexDatabase('tb_produto')
            .where({ codigo_identificador })

        if (ignorar_id) {
            query = query.andWhereNot({ id_produto: ignorar_id })
        }

        const result = await query.first()
        return !!result
    } catch (error) {
        console.error('[DAO produto] getCheckCodigoExists:', error.message)
        return false
    }
}


// ── Retorna o próximo código identificador disponível via Procedure ───────────
const getNextCodigo = async function () {
    try {
        await knexDatabase.raw('CALL sp_proximo_codigo_produto(@proximo)')
        const result = await knexDatabase.raw('SELECT @proximo AS proximo')
        return result[0][0].proximo || false
    } catch (error) {
        console.error('[DAO produto] getNextCodigo:', error.message)
        return false
    }
}


// ── Retorna último ID inserido ────────────────────────────────────────────────
const getSelectLastID = async function () {
    try {
        const result = await knexDatabase('tb_produto')
            .select('id_produto')
            .orderBy('id_produto', 'desc')
            .first()

        return result ? result.id_produto : false
    } catch (error) {
        console.error('[DAO produto] getSelectLastID:', error.message)
        return false
    }
}


// ── Insere produto ────────────────────────────────────────────────────────────
const setInsertProduct = async function (produto, trx = null) {
    try {
        const result = await db(trx)('tb_produto')
            .insert({
                nome_produto:          produto.nome_produto,
                codigo_identificador:  produto.codigo_identificador,
                sabor_massa:           produto.sabor_massa   || null,
                recheio:               produto.recheio       || null,
                cobertura:             produto.cobertura     || null,
                detalhes:              produto.detalhes      || null,
                limite_minimo_alerta:  produto.limite_minimo_alerta || 0,
                id_categoria:          produto.id_categoria
            })

        return result[0]
    } catch (error) {
        console.error('[DAO produto] setInsertProduct:', error.message)
        return false
    }
}


// ── Atualiza produto ──────────────────────────────────────────────────────────
const setUpdateProduct = async function (produto, trx = null) {
    try {
        const dados = {}

        if (produto.nome_produto         !== undefined) dados.nome_produto         = produto.nome_produto
        if (produto.codigo_identificador !== undefined) dados.codigo_identificador = produto.codigo_identificador
        if (produto.sabor_massa          !== undefined) dados.sabor_massa          = produto.sabor_massa
        if (produto.recheio              !== undefined) dados.recheio              = produto.recheio
        if (produto.cobertura            !== undefined) dados.cobertura            = produto.cobertura
        if (produto.detalhes             !== undefined) dados.detalhes             = produto.detalhes
        if (produto.limite_minimo_alerta !== undefined) dados.limite_minimo_alerta = produto.limite_minimo_alerta
        if (produto.id_categoria         !== undefined) dados.id_categoria         = produto.id_categoria

        if (Object.keys(dados).length === 0) return true

        const result = await db(trx)('tb_produto')
            .where({ id_produto: produto.id_produto })
            .update(dados)

        return result > 0
    } catch (error) {
        console.error('[DAO produto] setUpdateProduct:', error.message)
        return false
    }
}


// ── Deleta produto (cascade apaga os lotes vinculados) ────────────────────────
const setDeleteProduct = async function (id_produto, trx = null) {
    try {
        const result = await db(trx)('tb_produto')
            .where({ id_produto })
            .del()

        return result > 0
    } catch (error) {
        console.error('[DAO produto] setDeleteProduct:', error.message)
        return false
    }
}


module.exports = {
    getSelectAllProducts,
    getSelectProductById,
    getSearchProducts,
    getCheckCodigoExists,
    getNextCodigo,
    getSelectLastID,
    setInsertProduct,
    setUpdateProduct,
    setDeleteProduct
}