import { AxiosRequestConfig } from "axios"

// development config
const devConfig: AxiosRequestConfig = {
    baseURL: process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8000/api",
    timeout: 3000,
}

// production config
const prodConfig: AxiosRequestConfig = {
    baseURL: process.env.REACT_APP_API_BASE_URL ?? "/api",
    timeout: 3000,
}

export default process.env.NODE_ENV === "production" ? prodConfig : devConfig

export const githubAuthorizeUrl =
    process.env.REACT_APP_GITHUB_AUTHORIZE_URL ??
    "https://github.com/login/oauth/authorize"
