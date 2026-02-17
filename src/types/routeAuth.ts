export type RouteLocationLike = {
  pathname: string;
  search: unknown;
};

export type RequireDashboardAuthOptions = {
  location: RouteLocationLike;
  hasKnownUser?: boolean;
};

export type RedirectAuthenticatedFromLoginOptions = {
  redirectPath: string | undefined;
  hasKnownUser?: boolean;
};
