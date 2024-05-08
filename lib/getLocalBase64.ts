import { getPlaiceholder } from "plaiceholder"
import type { Photo, ImagesResults } from "@/models/Images"


async function getBase64(imageUrl: string) {
    try {
        const res = await fetch(imageUrl)

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`)
        }

        const buffer = await res.arrayBuffer()

        const { base64 } = await getPlaiceholder(Buffer.from(buffer))

        //console.log(`base64: ${base64}`)

        return base64

    } catch (e) {
        if (e instanceof Error) console.log("MY ERROR",e.stack)
    }
}


export default async function addBlurredDataUrls(images:any): Promise<Photo[]> {
    // Make all requests at once instead of awaiting each one - avoiding a waterfall 
    //console.log("Omar ")
    
    const base64Promises = images.map((item:any) => getBase64(item.collection_image))

 
 // Resolve all requests in order 
    const base64Results = await Promise.all(base64Promises)
    const photosWithBlur: Photo[] = images.map((item:any, i:number) => {
        item.blurredDataUrl = base64Results[i]
       //console.log("XXX", item)
        return item
    })

    return photosWithBlur
}