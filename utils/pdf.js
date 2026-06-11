const fs = require('fs')
const path = require('path')
const { getBrowser } = require('./browser')
const { compressSignature } = require('./compresion')
const { v7: uuidv7 } = require('uuid')

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

const generatePDF = async ({
    admin,
    signedDate,
    signerIp,
    compressedSignature,
}) => {
    let page

    try {
        const templatePath = path.resolve(
            __dirname,
            '../templates/ultimatehealth_agreement.html'
        )

        let html = await fs.promises.readFile(templatePath, 'utf8')

        html = html
            .replace(
                /{{moderator_name}}/g,
                escapeHtml(admin.user_name.toUpperCase())
            )
            .replace(/{{moderator_email}}/g, escapeHtml(admin.email))
            .replace(
                /{{moderator_role}}/g,
                escapeHtml(admin.role.toUpperCase())
            )
            .replace(/{{signed_date}}/g, signedDate)
            .replace(/{{signer_ip}}/g, escapeHtml(signerIp))
            .replace(/{{signature_image}}/g, compressedSignature)

        const browser = await getBrowser()

        page = await browser.newPage()

        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
        })

        const pdfBuffer = Buffer.from(
            await page.pdf({
                format: 'A4',
                printBackground: true,
            })
        )

        const agreementId = uuidv7()
        return {
            agreementId,
            pdfBuffer,
        }
    } catch (error) {
        console.error('PDF generation failed:', error)

        throwError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to generate agreement PDF'
        )
    } finally {
        if (page) {
            await page.close().catch(() => {})
        }
    }
}

module.exports = { generatePDF }
