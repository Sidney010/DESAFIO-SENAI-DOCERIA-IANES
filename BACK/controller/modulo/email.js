/******************************************************************************
 * Objetivo: Serviço de envio de e-mail para recuperação de senha
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 *
 * CONFIGURAÇÃO NECESSÁRIA NO .env:
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=seu_email@gmail.com
 *   EMAIL_PASS=sua_senha_de_app        ← não use a senha normal, use App Password
 *   EMAIL_FROM="Doceria IANES <seu_email@gmail.com>"
 ******************************************************************************/

const nodemailer = require('nodemailer')

// Cria o transporter uma única vez (singleton)
const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true para porta 465, false para 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})


// ── Envia o código de recuperação de senha ────────────────────────────────────
const enviarCodigoRecuperacao = async function (emailDestino, nomeUsuario, codigo) {
    const mailOptions = {
        from:    process.env.EMAIL_FROM,
        to:      emailDestino,
        subject: '🍰 Doceria IANES — Código de recuperação de senha',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                <h2 style="color: #b5451b;">Doceria Gourmet IANES</h2>
                <p>Olá, <strong>${nomeUsuario}</strong>!</p>
                <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>

                <div style="
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                    margin: 24px 0;
                ">
                    <span style="
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #b5451b;
                    ">${codigo}</span>
                </div>

                <p>⏰ Este código expira em <strong>15 minutos</strong>.</p>
                <p>Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.</p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <small style="color: #999;">Doceria Gourmet IANES — Sistema de Estoque</small>
            </div>
        `
    }

    await transporter.sendMail(mailOptions)
}


module.exports = {
    enviarCodigoRecuperacao
}