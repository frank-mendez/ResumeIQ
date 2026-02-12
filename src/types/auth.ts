export enum AuthProviderEnum {
  GITHUB = "github",
  GOOGLE = "google",
}

export type AuthProviderType =
  | AuthProviderEnum.GITHUB
  | AuthProviderEnum.GOOGLE;
