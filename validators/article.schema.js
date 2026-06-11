const { z } = require('zod')

const mongoIdSchema = z
    .string({
        error: 'Id must be a string',
    })
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'Invalid Id format')

const MAX_ID = 2147483647 // common INT max

const title = z
    .string({
        error: 'Title must be a string',
    })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s.,!?'":()\-&]+$/, 'Title contains invalid characters')

const autoIncrementIdSchema = z.coerce
    .number({
        error: 'Id must be a number',
    })
    .int('Id must be an integer')
    .positive('Id must be greater than 0')
    .max(MAX_ID, `Id must be less than or equal to ${MAX_ID}`)

const createArticleTagSchema = z
    .object({
        name: z
            .string({
                error: 'Tag name must be a string',
            })
            .trim()
            .min(2, 'Tag name must be at least 2 characters')
            .max(50, 'Tag name is too long')
            .regex(
                /^[a-zA-Z0-9\s&+_.-]+$/,
                'Tag name contains invalid characters'
            )
            .transform((value) => value.replace(/\s+/g, ' '))
            .transform((value) => value.toLowerCase()),
    })
    .strict()

const artickeTagIdParamSchema = z.object({
    id: autoIncrementIdSchema,
})

const uploadHtmlSchema = z
    .object({
        title: title,

        htmlContent: z
            .string({
                error: 'HTML content must be a string',
            })
            .trim()
            .min(1, 'HTML content is required')
            .max(
                500 * 1024, // 500 KB
                'HTML content exceeds maximum allowed size'
            ),
    })
    .strict()
    .superRefine((data, ctx) => {
        const plainText = data.htmlContent
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, '')
            .trim()

        if (!plainText) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['htmlContent'],
                message: 'Article content cannot be empty',
            })
        }
    })

const createArticleSchema = z
    .object({
        title: title,

        authorName: z
            .string({
                error: 'Author name must be a string',
            })
            .trim()
            .min(2, 'Author name is required')
            .max(100, 'Author name is too long'),

        description: z
            .string({
                error: 'Description must be a string',
            })
            .trim()
            .min(10, 'Description must be at least 10 characters')
            .max(1000, 'Description cannot exceed 1000 characters'),

        tags: z
            .array(
                z.object({
                    _id: mongoIdSchema,
                })
            )
            .max(10, 'Maximum 10 tags allowed')
            .default([]),

        imageUtils: z
            .string({
                error: 'Image reference must be a string',
            })
            .trim()
            .min(1, 'Image reference is required')
            .max(500, 'Image reference is too long'),

        allow_podcast: z.boolean().default(false),

        language: z
            .string()
            .trim()
            .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Invalid language format')
            .default('en-IN'),

        article_id: autoIncrementIdSchema,

        article_signature: z
            .string()
            .trim()
            .regex(/^[a-f0-9]{64}$/i, 'Invalid article signature'),
    })
    .strict()

const cursorPaginationSchema = z
    .object({
        cursor: z.string().trim().optional(),

        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict()
module.exports = {
    createArticleTagSchema,
    artickeTagIdParamSchema,
    uploadHtmlSchema,
    createArticleSchema,
    cursorPaginationSchema,
}
