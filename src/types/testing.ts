import type { ReactNode } from "react";

export type ElementWithChildrenProps = {
  children?: ReactNode;
};

export type ClickableElementProps = ElementWithChildrenProps & {
  onClick: (event?: { preventDefault: () => void }) => void;
};

export type SessionResponse = {
  data: { session: { access_token?: string } | null };
  error: Error | null;
};
