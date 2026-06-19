const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

const BUCKET = 'ultimate-health-new'

const { throwError } = require('./throwError')
const { HTTP_STATUS, ERROR_CODES } = require('../constants/errorConstants')

const MAX_PDF_SIZE = 2 * 1024 * 1024 // 1 MB

const uploadPdf = async (buffer, key) => {
    if (!Buffer.isBuffer(buffer)) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
            'Invalid PDF buffer'
        )
    }

    if (buffer.length > MAX_PDF_SIZE) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.FILE_TOO_LARGE,
            'PDF exceeds maximum allowed size'
        )
    }

    if (!key) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
            'Object key is required'
        )
    }

    const result = await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: 'application/pdf',
        })
    )
    return {
        key,
        etag: result.ETag,
    }
}

const getPdf = async (key) => {
    try {
        const result = await s3.send(
            new GetObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        )
        return result.Body
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            throwError(
                HTTP_STATUS.NOT_FOUND,
                ERROR_CODES.FILE_NOT_FOUND,
                'PDF not found'
            )
        }
    }
}

module.exports = {
    uploadPdf,
    getPdf,
}
