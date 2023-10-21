import CurrentUserInfo from "./current-user-info"

export interface LoginWithEmailAndPasswordRequest {
    email: string
    password: string
}

export type OAuth2Provider = "GitHub"

export interface LoginWithOAuth2ProviderRequest {
    provider: OAuth2Provider
    code: string
}

export type LoginResult =
    | {
          success: true
          token: string
          user: CurrentUserInfo
      }
    | {
          success: false
          error: string
      }

export interface ActivateRequest {
    activationKey: string
    newPassword: string
}

export type ActivateResult = LoginResult

export type ResetPasswordRequest =
    | {
          currentPassword?: string
          newPassword: string
      }
    | {
          resetKey: string
          newPassword: string
      }

export type ResetPasswordResult = LoginResult

export interface RequestPasswordResetRequest {
    email: string
}
