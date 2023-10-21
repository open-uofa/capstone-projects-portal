import { ProjectType, Tag, Term } from "./project"

export default interface ProjectShort {
    id: string
    tags: Tag[]
    name: string
    tagline: string
    year: number
    term: Term
    logo_url: string
    type: ProjectType
}
