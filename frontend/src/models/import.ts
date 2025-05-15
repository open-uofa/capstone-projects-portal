import type ClientOrg from "./client-org"
import type Project from "./project"
import type User from "./user"

export default interface ImportCsvResponse {
    errors: string[]
    warnings: string[]
    users: {
        new: User[]
        existing: User[]
    }
    orgs: {
        new: ClientOrg[]
        existing: ClientOrg[]
    }
    projects: {
        new: Project[]
        existing: Project[]
    }
}
