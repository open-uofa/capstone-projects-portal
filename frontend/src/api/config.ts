import type { AxiosRequestConfig } from "axios"

export const axiosConfig: AxiosRequestConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
    timeout: 3000,
}

export const githubAuthorizeUrl =
    import.meta.env.VITE_GITHUB_AUTHORIZE_URL ??
    "https://github.com/login/oauth/authorize"
