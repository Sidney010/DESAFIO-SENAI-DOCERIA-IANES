const crypto = require('crypto')
const { promisify } = require('util')

const pbkdf2Async = promisify(crypto.pbkdf2)

const ITERATIONS = 5000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex')

    const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)

    return `${salt}:${hash.toString('hex')}`
}

async function verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(':')

    const hashVerify = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)

    return crypto.timingSafeEqual(
        Buffer.from(originalHash, 'hex'),
        hashVerify
    )
}

module.exports = {
    hashPassword,
    verifyPassword
}