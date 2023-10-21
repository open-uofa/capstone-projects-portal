export default interface ClientForm {
    name: string
    about?: string
    image?: string | BlobPart | null
    website_link?: string
    testimonial?: string
}
