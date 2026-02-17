import { AuthProviderEnum } from "~/enums/auth";

export type AuthProviderType =
  | AuthProviderEnum.GITHUB
  | AuthProviderEnum.GOOGLE;
