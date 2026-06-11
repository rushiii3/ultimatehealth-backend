const sharp = require('sharp')

async function compressSignature(dataUri) {
    const base64 = dataUri.replace(/^data:image\/\w+;base64,/, '')

    const buffer = Buffer.from(base64, 'base64')
    console.log('Original:', buffer.length / 1024, 'KB')

    const compressedBuffer = await sharp(buffer)
        .png({
            compressionLevel: 9,
            palette: true,
        })
        .toBuffer()
    console.log('Compressed:', compressedBuffer.length / 1024, 'KB')
    return `data:image/png;base64,${compressedBuffer.toString('base64')}`
}

module.exports = {
    compressSignature,
}
