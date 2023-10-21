import ClientOrgType from "./client-org-type"

export default interface ClientOrgShort {
    id: string
    name: string
    image: string | undefined
    type: ClientOrgType
}
