/******************************************************************************
 * Objetivo: DAO responsável pela conexão de usuários
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const knex       = require('knex')
const knexConfig = require('../dastabase_conf/knex.js')

const knexDatabase = knex(knexConfig.development)
const db = (trx) => trx || knexDatabase


// ── Retorna todos os usuários (sem expor a senha) ────────────────────────────
const getSelectAllUsers = async function () {
    try {
        return await knexDatabase('tb_usuario')
            .select('id_usuario', 'nome', 'email', 'is_active')
            .orderBy('id_usuario', 'desc')
    } catch (error) {
        console.error('[DAO usuario] getSelectAllUsers:', error.message)
        return false
    }
}


// ── Retorna usuário por ID (sem expor a senha) ───────────────────────────────
const getSelectUserById = async function (id_usuario) {
    try {
        const result = await knexDatabase('tb_usuario')
            .select('id_usuario', 'nome', 'email', 'is_active')
            .where({ id_usuario })

        return result.length > 0 ? result : false
    } catch (error) {
        console.error('[DAO usuario] getSelectUserById:', error.message)
        return false
    }
}


// ── Retorna usuário por email (COM senha — usado apenas no login) ─────────────
const getSelectUserByEmail = async function (email) {
    try {
        const result = await knexDatabase('tb_usuario')
            .where({ email })
            .first()

        return result || false
    } catch (error) {
        console.error('[DAO usuario] getSelectUserByEmail:', error.message)
        return false
    }
}


// ── Verifica se o email já está cadastrado (para validação no cadastro) ───────
const getCheckEmailExists = async function (email) {
    try {
        const result = await knexDatabase('tb_usuario')
            .where({ email })
            .first()

        return !!result
    } catch (error) {
        console.error('[DAO usuario] getCheckEmailExists:', error.message)
        return false
    }
}


// ── Retorna o último ID inserido ──────────────────────────────────────────────
const getSelectLastID = async function () {
    try {
        const result = await knexDatabase('tb_usuario')
            .select('id_usuario')
            .orderBy('id_usuario', 'desc')
            .first()

        return result ? result.id_usuario : false
    } catch (error) {
        console.error('[DAO usuario] getSelectLastID:', error.message)
        return false
    }
}


// ── Insere um novo usuário ────────────────────────────────────────────────────
const setInsertUser = async function (usuario, trx = null) {
    try {
        const result = await db(trx)('tb_usuario')
            .insert({
                nome:      usuario.nome,
                email:     usuario.email,
                senha:     usuario.senha,     // já chega com hash do controller
                is_active: true
            })

        return result[0]
    } catch (error) {
        console.error('[DAO usuario] setInsertUser:', error.message)
        return false
    }
}


// ── Atualiza dados do usuário ─────────────────────────────────────────────────
const setUpdateUser = async function (usuario, trx = null) {
    try {
        const dados = {}

        if (usuario.nome  !== undefined) dados.nome  = usuario.nome
        if (usuario.email !== undefined) dados.email = usuario.email
        if (usuario.senha !== undefined) dados.senha = usuario.senha

        if (Object.keys(dados).length === 0) return true

        const result = await db(trx)('tb_usuario')
            .where({ id_usuario: usuario.id_usuario })
            .update(dados)

        return result > 0
    } catch (error) {
        console.error('[DAO usuario] setUpdateUser:', error.message)
        return false
    }
}


// ── Desativa usuário (soft delete — mantém histórico de movimentações) ────────
const setDeactivateUser = async function (id_usuario, trx = null) {
    try {
        const result = await db(trx)('tb_usuario')
            .where({ id_usuario })
            .update({ is_active: false })

        return result > 0
    } catch (error) {
        console.error('[DAO usuario] setDeactivateUser:', error.message)
        return false
    }
}


// ── Atualiza a senha do usuário (pós-recuperação) ─────────────────────────────
const setUpdatePassword = async function (id_usuario, novaSenhaHash, trx = null) {
    try {
        const result = await db(trx)('tb_usuario')
            .where({ id_usuario })
            .update({ senha: novaSenhaHash })

        return result > 0
    } catch (error) {
        console.error('[DAO usuario] setUpdatePassword:', error.message)
        return false
    }
}


// ── Gera código de recuperação via Procedure do banco ─────────────────────────
const setGerarCodigoRecuperacao = async function (id_usuario) {
    try {
        // Chama a procedure criada no MySQL que gera o código e persiste o token
        await knexDatabase.raw('CALL sp_gerar_codigo_recuperacao(?, @codigo)', [id_usuario])

        const result = await knexDatabase.raw('SELECT @codigo AS codigo')
        const codigo = result[0][0].codigo

        return codigo || false
    } catch (error) {
        console.error('[DAO usuario] setGerarCodigoRecuperacao:', error.message)
        return false
    }
}


// ── Valida o código de recuperação via Procedure do banco ─────────────────────
const getValidarCodigoRecuperacao = async function (id_usuario, codigo) {
    try {
        await knexDatabase.raw(
            'CALL sp_validar_codigo_recuperacao(?, ?, @valido)',
            [id_usuario, codigo]
        )

        const result = await knexDatabase.raw('SELECT @valido AS valido')
        const valido = result[0][0].valido

        return valido === 1
    } catch (error) {
        console.error('[DAO usuario] getValidarCodigoRecuperacao:', error.message)
        return false
    }
}


module.exports = {
    getSelectAllUsers,
    getSelectUserById,
    getSelectUserByEmail,
    getCheckEmailExists,
    getSelectLastID,
    setInsertUser,
    setUpdateUser,
    setDeactivateUser,
    setUpdatePassword,
    setGerarCodigoRecuperacao,
    getValidarCodigoRecuperacao
}