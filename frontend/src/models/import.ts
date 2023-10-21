import User from "./user"
import ClientOrg from "./client-org"
import Project from "./project"

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
