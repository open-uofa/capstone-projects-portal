import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios"
import { Dispatch } from "react"
import ClientOrg from "../models/client-org"
import User from "../models/user"
import config from "./config"
import Project from "../models/project"
import ProposalForm from "../models/proposal-form"
import {
    ActivateRequest,
    ActivateResult,
    LoginResult,
    LoginWithEmailAndPasswordRequest,
    LoginWithOAuth2ProviderRequest,
    RequestPasswordResetRequest,
    ResetPasswordRequest,
    ResetPasswordResult,
} from "../models/login"
import CurrentUserInfo from "../models/current-user-info"
import Action from "../global-state/action"
import ImportCsvResponse from "../models/import"

/**
 * Returns an appropriate error message for a given error object.
 * @param error The error object.
 * @returns The appropriate error message, or "Unknown error" if the error is of an unknown type or has no message.
 */
const errorMessageOf = (
    error: AxiosError<{ error: string }> | Error | unknown
): string =>
    (error as AxiosError<{ error: string }>)?.response?.data?.error ||
    (error as Error)?.message ||
    "Unknown error"

const onLoginResult = (result: LoginResult, dispatch: Dispatch<Action>) => {
    if (result.success === true) {
        localStorage.setItem("token", result.token)
        dispatch({ type: "SET_CURRENT_USER", value: result.user })
    }
}

const handleLoginResponsePromise = (
    promise: Promise<AxiosResponse<LoginResult>>,
    dispatch: Dispatch<Action>
): Promise<LoginResult> =>
    promise
        .then((response) => {
            onLoginResult(response.data, dispatch)
            return response.data
        })
        .catch((error) => {
            const result: LoginResult = {
                success: false,
                error: errorMessageOf(error),
            }
            onLoginResult(result, dispatch)
            return result
        })

export default class PortalApi {
    axiosInstance: AxiosInstance

    constructor(axiosRequestConfig: AxiosRequestConfig, logResponses: boolean) {
        // reusable AxiosInstance
        this.axiosInstance = axios.create(axiosRequestConfig)

        // Interceptor to include token in all requests if it is set
        this.axiosInstance.interceptors.request.use((requestConfig) => {
            const token = localStorage.getItem("token")
            if (token !== null) {
                /* eslint-disable no-param-reassign */
                requestConfig.headers = config.headers ?? {}
                requestConfig.headers.Authorization = `Token ${token}`
                /* eslint-enable no-param-reassign */
            }
            return requestConfig
        })

        // log all errors
        if (logResponses) {
            this.axiosInstance.interceptors.response.use(
                (response) =>
                    // Any status code that lie within the range of 2xx cause this function to trigger
                    // console.log(response)
                    response,
                (error) => {
                    // Any status codes that falls outside the range of 2xx cause this function to trigger
                    console.error(error)

                    // Invalidate token if it results in HTTP 401
                    if (
                        error.request?.status === 401 &&
                        localStorage.getItem("token") !== null
                    ) {
                        localStorage.removeItem("token")
                        // Reload page to remove stale information
                        window.location.reload()
                        return
                    }

                    throw error
                }
            )
        }
    }

    getClientOrgs = async (): Promise<ClientOrg[]> =>
        this.axiosInstance
            .get<ClientOrg[]>("/orgs/")
            .then((response) => response.data)

    getClientOrg = async (id: string): Promise<ClientOrg> =>
        this.axiosInstance
            .get<ClientOrg>(`/orgs/${id}/`)
            .then((response) => response.data)

    editClient = async (clientId: string, data: FormData): Promise<void> =>
        this.axiosInstance
            .patch<FormData>(`/orgs/${clientId}/`, data)
            .then(() => {})

    getUser = async (id: string): Promise<User> =>
        this.axiosInstance
            .get<User>(`/users/${id}/`)
            .then((response) => response.data)

    getImage = async (image_url: string | BlobPart): Promise<Response> =>
        this.axiosInstance
            .get<Response>(`${image_url}`)
            .then((response) => response)
            .catch((error) => error.response)

    getCurrentUserInfo = async (): Promise<CurrentUserInfo> =>
        this.axiosInstance
            .get<CurrentUserInfo>("/users/me/")
            .then((response) => response.data)

    getProjects = async (homePageOnly = false): Promise<Project[]> =>
        this.axiosInstance
            .get<Project[]>(`/projects/?home_page=${homePageOnly}`)
            .then((response) => response.data)

    getProject = async (id: string): Promise<Project> =>
        this.axiosInstance
            .get<Project>(`/projects/${id}/`)
            .then((response) => response.data)

    createProposal = async (inputData: ProposalForm): Promise<void> =>
        this.axiosInstance
            .post<ProposalForm>("/proposals/", inputData)
            .then(() => {})

    editProfile = async (userId: string, inputData: FormData): Promise<void> =>
        this.axiosInstance
            .patch<FormData>(`/users/${userId}/`, inputData)
            .then(() => {})

    editProject = async (
        projectId: string,
        projectData: FormData
    ): Promise<void> =>
        this.axiosInstance
            .patch<FormData>(`/projects/${projectId}/`, projectData)
            .then(() => {})

    validateCsv = async (csvFile: File): Promise<ImportCsvResponse> => {
        const formData = new FormData()
        formData.append("file", csvFile)
        return this.axiosInstance
            .post<FormData, AxiosResponse<ImportCsvResponse>>(
                "/csv/validate/",
                formData
            )
            .then((response) => response.data)
    }

    importCsv = async (csvFile: File): Promise<ImportCsvResponse> => {
        const formData = new FormData()
        formData.append("file", csvFile)
        return this.axiosInstance
            .post<FormData, AxiosResponse<ImportCsvResponse>>(
                "/csv/import/",
                formData
            )
            .then((response) => response.data)
    }

    loginWithEmailAndPassword = async (
        inputData: LoginWithEmailAndPasswordRequest,
        dispatch: Dispatch<Action>
    ): Promise<LoginResult> =>
        handleLoginResponsePromise(
            this.axiosInstance.post<
                LoginWithEmailAndPasswordRequest,
                AxiosResponse<LoginResult>
            >("/login/email/", inputData),
            dispatch
        )

    loginWithOAuth2Provider = async (
        inputData: LoginWithOAuth2ProviderRequest,
        dispatch: Dispatch<Action>
    ): Promise<LoginResult> =>
        handleLoginResponsePromise(
            this.axiosInstance.post<
                LoginWithOAuth2ProviderRequest,
                AxiosResponse<LoginResult>
            >("/login/oauth2/", inputData),
            dispatch
        )

    logout = async (dispatch: Dispatch<Action>): Promise<void> => {
        localStorage.removeItem("token")
        dispatch({ type: "SET_CURRENT_USER", value: { logged_in: false } })
    }

    activateAccount = async (
        inputData: ActivateRequest,
        dispatch: Dispatch<Action>
    ): Promise<ActivateResult> =>
        handleLoginResponsePromise(
            this.axiosInstance.post<
                ActivateRequest,
                AxiosResponse<ActivateResult>
            >("/activate/", inputData),
            dispatch
        )

    resetPassword = async (
        inputData: ResetPasswordRequest,
        dispatch: Dispatch<Action>
    ): Promise<ResetPasswordResult> =>
        handleLoginResponsePromise(
            this.axiosInstance.post<
                ResetPasswordRequest,
                AxiosResponse<ResetPasswordResult>
            >("/reset-password/", inputData),
            dispatch
        )

    requestPasswordReset = async (
        inputData: RequestPasswordResetRequest
    ): Promise<void> =>
        this.axiosInstance
            .post<RequestPasswordResetRequest>(
                "/request-password-reset/",
                inputData
            )
            .then(() => {})

    invalidateOtherSessions = async (
        dispatch: Dispatch<Action>
    ): Promise<LoginResult> =>
        handleLoginResponsePromise(
            this.axiosInstance.post<void, AxiosResponse<LoginResult>>(
                "/logout-all/"
            ),
            dispatch
        )

    logAllData = async (): Promise<void> => {
        console.log("%c Client Orgs:", "font-size: 16px")
        console.table(await this.getClientOrgs())
        console.log("%c Projects:", "font-size: 16px")
        console.table(await this.getProjects())
    }
}

const logResponses = process.env.NODE_ENV === "development"
export const portalApiInstance = new PortalApi(config, logResponses)
