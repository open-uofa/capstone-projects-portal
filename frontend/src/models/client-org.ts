import UserShort from "./user-short"
import ProjectShort from "./project-short"
import ClientOrgShort from "./client-org-short"

type ClientOrg = ClientOrgShort & {
    about: string
    website_link: string
    reps: UserShort[]
    projects: ProjectShort[]
    testimonial: string
}
export default ClientOrg
