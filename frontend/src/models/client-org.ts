import type ClientOrgShort from "./client-org-short"
import type ProjectShort from "./project-short"
import type UserShort from "./user-short"

type ClientOrg = ClientOrgShort & {
    about: string
    website_link: string
    reps: UserShort[]
    projects: ProjectShort[]
    testimonial: string
}
export default ClientOrg
