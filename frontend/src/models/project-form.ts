import { Tag } from "./project"

export default interface ProjectForm {
    name: string
    summary: string
    video: string
    tagline: string
    screenshot?: string | BlobPart | null
    presentation: string
    review: string
    website_url: string
    source_code_url: string
    logo_url: string
    tags: Array<Tag>
}
