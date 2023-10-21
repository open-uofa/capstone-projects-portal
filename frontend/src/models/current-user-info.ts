import ClientOrg from "./client-org"
import Project from "./project"
import UserShort from "./user-short"

type CurrentUserInfo =
    | {
          logged_in: false
      }
    | ({
          logged_in: true
          is_superuser: boolean
          has_password: boolean
      } & UserShort)

export default CurrentUserInfo

/**
 * Checks if the current user can edit the given client organization.
 * The user must be logged in and either a superuser
 * or a representative of the client organization.
 *
 * @param currentUser the currently logged in user's CurrentUserInfo
 * @param client the client to be edited
 * @returns true if the user can edit the client organization, false otherwise
 */
export const canEditClientOrg = (
    currentUser: CurrentUserInfo,
    client: ClientOrg
): boolean =>
    currentUser.logged_in &&
    (currentUser.is_superuser ||
        client.reps.map((rep) => rep.id).includes(currentUser.id))

/**
 * Checks if the current user can edit the given user profile.
 * The user must be logged in and either a superuser
 * or the user being edited.
 *
 * @param currentUser the currently logged in user's CurrentUserInfo
 * @param user the ID of the user to be edited
 * @returns true if the user can edit the user profile, false otherwise
 */
export const canEditUser = (
    currentUser: CurrentUserInfo,
    userId: string
): boolean =>
    currentUser.logged_in &&
    (currentUser.is_superuser || userId === currentUser.id)

/**
 * Checks if the current user can edit the given project.
 * The user must be logged in and either a superuser,
 * student of the project, TA of the project, or
 * a representative of the project's client organization.
 *
 * @param currentUser the currently logged in user's CurrentUserInfo
 * @param project the project to be edited
 * @returns true if the user can edit the project, false otherwise
 */
export const canEditProject = (
    currentUser: CurrentUserInfo,
    project: Project
): boolean =>
    currentUser.logged_in &&
    (currentUser.is_superuser ||
        project.students
            .map((student) => student.id)
            .includes(currentUser.id) ||
        (project.ta !== null && project.ta.id === currentUser.id) ||
        (project.client_rep !== null &&
            project.client_rep.id === currentUser.id))
