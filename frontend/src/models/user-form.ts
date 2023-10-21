export default interface UserForm {
    name: string
    bio?: string
    image?: string | BlobPart | null
    github_user_id?: string
    website_link?: string
    linkedin_link?: string
}
