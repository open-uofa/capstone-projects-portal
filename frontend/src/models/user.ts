import ProjectShort from "./project-short"

export default interface User {
    id?: string
    email?: string
    name: string
    bio?: string
    image?: string
    website_link?: string
    linkedin_link?: string
    github_username?: string
    github_user_id?: string
    student_projects?: ProjectShort[]
    ta_projects?: ProjectShort[]
    client_rep_projects?: ProjectShort[]
}
