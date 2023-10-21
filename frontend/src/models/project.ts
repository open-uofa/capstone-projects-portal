import UserShort from "./user-short"
import ClientOrgShort from "./client-org-short"

export interface Tag {
    value: string
}

export enum Term {
    Fall = "Fall",
    Winter = "Winter",
    Spring = "Spring",
    Summer = "Summer",
}

export enum ProjectType {
    Mobile = "Mobile App",
    Web = "Web App",
    Other = "Other",
}

export default interface Project {
    id: string
    client_org: ClientOrgShort
    students: UserShort[]
    ta: UserShort | null
    client_rep: UserShort | null
    tags: Tag[]
    name: string
    summary: string
    video: string
    type: ProjectType
    tagline: string
    is_published: boolean
    year: number
    term: Term
    screenshot: string
    presentation: string
    review: string
    website_url: string
    source_code_url: string
    logo_url: string
    storyboard: string
}
