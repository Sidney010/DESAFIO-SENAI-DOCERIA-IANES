/******************************************************************************
 * Objetivo: Geração e validação de tokens JWT da API IANES
 * Data: 31/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET


// ── Gera o Bearer Token (chamado no login) ────────────────────────────────────
function criarToken(userId, role) {
    return jwt.sign(
        {
            sub:  userId,
            role: role
        },
        SECRET,
        {
            expiresIn: '2h'
        }
    )
}


// ── Valida e decodifica o token ───────────────────────────────────────────────
function validarToken(token) {
    return jwt.verify(token, SECRET)
}


// ── Middleware de autenticação — protege as rotas (RNF-002/2) ─────────────────
function authMiddleware(req, res, next) {
    const bearer = req.headers.authorization

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({
            status:      'Unauthorized',
            status_code:  401,
            message:     'Token ausente ou mal formatado.'
        })
    }

    const token = bearer.replace('Bearer ', '').trim()

    try {
        const payload = validarToken(token)

        // ✅ Expõe o ID numérico do usuário para os controllers
        // Usado em: movimentacao.routes.js → request.usuarioId
        req.usuarioId = payload.sub
        req.usuarioRole = payload.role

        next()
    } catch (error) {
        return res.status(401).json({
            status:      'Unauthorized',
            status_code:  401,
            message:     'Token inválido ou expirado.'
        })
    }
}


module.exports = {
    criarToken,
    validarToken,
    authMiddleware
}