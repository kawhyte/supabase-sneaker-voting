import { z } from 'zod'

const BasicImageSchema = z.object({
    // page: z.number(),
    // per_page: z.number(),
    // prev_page: z.string().optional(),
    // next_page: z.string().optional(),
    // total_results: z.number(),
})

const PhotoSchema = z.object({
    id: z.number().optional(),
    collection_image:z.string(),
    name:z.string(),
    // width: z.number().optional(),
    // height: z.number().optional(),
    // url: z.string().optional(),
    // src: z.object({
    //     large: z.string(),
    // }),
    // alt: z.string().optional(),
    blurredDataUrl: z.string().optional(),
})

export const ImagesSchemaWithPhotos = BasicImageSchema.extend({
    collection_image: z.array(PhotoSchema)
})

export type Photo = z.infer<typeof PhotoSchema>

export type ImagesResults = z.infer<typeof ImagesSchemaWithPhotos>