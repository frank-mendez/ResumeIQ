import { setCookie } from "@tanstack/react-start/server";

export type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<typeof setCookie>[2];
};
