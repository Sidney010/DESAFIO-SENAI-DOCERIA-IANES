/******************************************************************************
 * Objetivo: Controller responsável pela lógica de usuários
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const usuarioDAO    = require('../../model/DAO/usuario.js')
const DEFAULT_MESSAGES = require('../modulo/conf_message.js')
const { hashPassword, verifyPassword } = require('../modulo/crypto-password.js')
const { criarToken } = require('../auth/jwt.js')

// ─── Serviço de e-mail ────────────────────────────────────────────────────────
// ATENÇÃO: configure o nodemailer no arquivo abaixo com suas credenciais
// nunca coloque credenciais diretamente aqui — use variáveis de ambiente (.env)
const emailService = require('../modulo/email.js')



//  LISTAGEM
const listarUsuarios = async function () {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        let resultUsuarios = await usuarioDAO.getSelectAllUsers()

        if (resultUsuarios) {
            if (resultUsuarios.length > 0) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                MESSAGES.HEADER.response.usuarios = resultUsuarios
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


//  BUSCA POR ID

const buscarUsuarioId = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {
            let resultUsuario = await usuarioDAO.getSelectUserById(Number(id))

            if (resultUsuario) {
                if (resultUsuario.length > 0) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
                    MESSAGES.HEADER.response.usuario = resultUsuario[0]
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


//  CADASTRO

const cadastrarUsuario = async function (usuario, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            // Valida os campos obrigatórios
            let validar = await validarDadosUsuario(usuario)
            if (validar) return validar // 400

            // Verifica se o e-mail já está cadastrado (RF-002/1 — email único)
            let emailJaExiste = await usuarioDAO.getCheckEmailExists(usuario.email)
            if (emailJaExiste) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email já cadastrado]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            // Hash da senha antes de persistir (RNF-001/1 — senhas criptografadas)
            usuario.senha = await hashPassword(usuario.senha)

            let resultUsuario = await usuarioDAO.setInsertUser(usuario)

            if (resultUsuario) {
                let lastID = await usuarioDAO.getSelectLastID()

                if (lastID) {
                    MESSAGES.HEADER.status      = MESSAGES.SUCCESS_CREATED_ITEM.status
                    MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_CREATED_ITEM.status_code
                    MESSAGES.HEADER.message     = MESSAGES.SUCCESS_CREATED_ITEM.message
                    MESSAGES.HEADER.response.usuario = {
                        id_usuario: lastID,
                        nome:       usuario.nome,
                        email:      usuario.email
                        // nunca devolve a senha — nem o hash
                    }
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


//  LOGIN

const loginUsuario = async function (credenciais, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            // Validação básica dos campos de login
            if (!credenciais.email || !credenciais.senha) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email e senha são obrigatórios]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            // Busca o usuário pelo email (inclui a senha hasheada)
            let usuario = await usuarioDAO.getSelectUserByEmail(credenciais.email)

            // Mensagem genérica intencional — não informar se foi o email ou a senha
            // que errou evita ataques de enumeração de usuários
            if (!usuario) return MESSAGES.ERROR_LOGIN // 401

            if (!usuario.is_active) return MESSAGES.ERROR_LOGIN // 401

            // Verifica a senha com timing-safe compare
            let senhaValida = await verifyPassword(credenciais.senha, usuario.senha)
            if (!senhaValida) return MESSAGES.ERROR_LOGIN // 401

            // Gera o Bearer Token (RNF-002/2)
            let token = criarToken(usuario.id_usuario, 'usuario')

            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = MESSAGES.SUCCESS_REQUEST.message
            MESSAGES.HEADER.response.usuario = {
                id_usuario: usuario.id_usuario,
                nome:       usuario.nome,
                email:      usuario.email
            }
            MESSAGES.HEADER.response.token = token
            return MESSAGES.HEADER // 200

        } else {
            return MESSAGES.ERROR_CONTENT_TYPE // 415
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}



//  ATUALIZAÇÃO

const atualizarUsuario = async function (usuario, id, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            // Valida somente os campos que foram enviados (atualização parcial)
            let validar = await validarDadosUsuarioAtualizacao(usuario)
            if (validar) return validar // 400

            let validarID = await buscarUsuarioId(id)
            if (validarID.status_code !== 200) return validarID // 400 | 404 | 500

            // Se estiver trocando a senha, re-hasheia antes de salvar
            if (usuario.senha) {
                let validarSenha = validarForcaSenha(usuario.senha)
                if (validarSenha) return validarSenha // 400
                usuario.senha = await hashPassword(usuario.senha)
            }

            // Se estiver trocando o e-mail, verifica unicidade
            if (usuario.email) {
                let emailJaExiste = await usuarioDAO.getCheckEmailExists(usuario.email)
                if (emailJaExiste) {
                    MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email já cadastrado]'
                    return MESSAGES.ERROR_REQUIRED_FIELDS // 400
                }
            }

            usuario.id_usuario = Number(id)

            let resultUsuario = await usuarioDAO.setUpdateUser(usuario)

            if (resultUsuario) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_UPDATED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_UPDATED_ITEM.status_code
                MESSAGES.HEADER.message     = MESSAGES.SUCCESS_UPDATED_ITEM.message
                MESSAGES.HEADER.response.usuario = { id_usuario: Number(id), ...usuario, senha: undefined }
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



//  DESATIVAR USUÁRIO (soft delete)

const desativarUsuario = async function (id) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (!isNaN(id) && id != '' && id != null && id > 0) {

            let validarID = await buscarUsuarioId(id)
            if (validarID.status_code !== 200) return MESSAGES.ERROR_NOT_FOUND // 404

            let result = await usuarioDAO.setDeactivateUser(Number(id))

            if (result) {
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


//  RECUPERAÇÃO DE SENHA — PASSO 1: Solicitar código

const solicitarRecuperacaoSenha = async function (dados, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            if (!dados.email) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email é obrigatório]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            let usuario = await usuarioDAO.getSelectUserByEmail(dados.email)

            // Resposta genérica intencional: não confirmar se o e-mail existe
            // evita enumeração de usuários por atacantes
            if (!usuario || !usuario.is_active) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
                MESSAGES.HEADER.message     = 'Se o e-mail estiver cadastrado, você receberá o código em breve.'
                return MESSAGES.HEADER
            }

            // Chama a procedure no banco que gera e persiste o código com TTL de 15 min
            let codigo = await usuarioDAO.setGerarCodigoRecuperacao(usuario.id_usuario)

            if (!codigo) return MESSAGES.ERROR_INTERNAL_SERVER_MODEL // 500

            // Envia o e-mail com o código
            // (configure o arquivo email.js com suas credenciais no .env)
            await emailService.enviarCodigoRecuperacao(usuario.email, usuario.nome, codigo)

            MESSAGES.HEADER.status      = MESSAGES.SUCCESS_REQUEST.status
            MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_REQUEST.status_code
            MESSAGES.HEADER.message     = 'Se o e-mail estiver cadastrado, você receberá o código em breve.'
            return MESSAGES.HEADER // 200

        } else {
            return MESSAGES.ERROR_CONTENT_TYPE // 415
        }
    } catch (error) {
        return MESSAGES.ERROR_INTERNAL_SERVER_CONTROLLER // 500
    }
}


//  RECUPERAÇÃO DE SENHA — PASSO 2: Validar código e redefinir senha

const redefinirSenha = async function (dados, contentType) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    try {
        if (String(contentType).toUpperCase().includes('APPLICATION/JSON')) {

            if (!dados.email || !dados.codigo || !dados.nova_senha) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email, codigo e nova_senha são obrigatórios]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            // Valida força da nova senha (RF-002/1)
            let validarSenha = validarForcaSenha(dados.nova_senha)
            if (validarSenha) return validarSenha // 400

            let usuario = await usuarioDAO.getSelectUserByEmail(dados.email)
            if (!usuario || !usuario.is_active) return MESSAGES.ERROR_NOT_FOUND // 404

            // Valida o código via procedure — já marca como usado internamente
            let codigoValido = await usuarioDAO.getValidarCodigoRecuperacao(
                usuario.id_usuario,
                String(dados.codigo).trim()
            )

            if (!codigoValido) {
                MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [codigo inválido ou expirado]'
                return MESSAGES.ERROR_REQUIRED_FIELDS // 400
            }

            let novaSenhaHash = await hashPassword(dados.nova_senha)
            let result = await usuarioDAO.setUpdatePassword(usuario.id_usuario, novaSenhaHash)

            if (result) {
                MESSAGES.HEADER.status      = MESSAGES.SUCCESS_UPDATED_ITEM.status
                MESSAGES.HEADER.status_code = MESSAGES.SUCCESS_UPDATED_ITEM.status_code
                MESSAGES.HEADER.message     = 'Senha redefinida com sucesso!'
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


//  FUNÇÕES DE VALIDAÇÃO INTERNAS

// Valida cadastro completo (RF-002/1)
const validarDadosUsuario = async function (usuario) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    // Nome: obrigatório, mínimo 4 caracteres
    if (!usuario.nome || usuario.nome.trim().length < 4 || usuario.nome.length > 150) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome deve ter entre 4 e 150 caracteres]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Email: obrigatório e formato válido
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!usuario.email || !regexEmail.test(usuario.email)) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email inválido]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    // Senha: obrigatória — delega à função de força
    return validarForcaSenha(usuario.senha)
}

// Valida atualização parcial (só valida os campos que vieram)
const validarDadosUsuarioAtualizacao = async function (usuario) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    if (usuario.nome !== undefined) {
        if (usuario.nome.trim().length < 4 || usuario.nome.length > 150) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [nome deve ter entre 4 e 150 caracteres]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    if (usuario.email !== undefined) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regexEmail.test(usuario.email)) {
            MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [email inválido]'
            return MESSAGES.ERROR_REQUIRED_FIELDS
        }
    }

    return false
}

// Valida força da senha (RF-002/1): mín 8 chars, 1 maiúscula, 1 minúscula, 1 número
const validarForcaSenha = function (senha) {
    let MESSAGES = JSON.parse(JSON.stringify(DEFAULT_MESSAGES))

    if (!senha) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message += ' [senha é obrigatória]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!regexSenha.test(senha)) {
        MESSAGES.ERROR_REQUIRED_FIELDS.message +=
            ' [senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número]'
        return MESSAGES.ERROR_REQUIRED_FIELDS
    }

    return false
}


module.exports = {
    listarUsuarios,
    buscarUsuarioId,
    cadastrarUsuario,
    loginUsuario,
    atualizarUsuario,
    desativarUsuario,
    solicitarRecuperacaoSenha,
    redefinirSenha
}