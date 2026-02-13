import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";

const invalidateMock = vi.fn();
const useMatchMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  ErrorComponent: ({ error }: { error: unknown }) => <div>{String(error)}</div>,
  Link: ({ children, ...props }: Record<string, unknown>) => (
    <a {...props}>{children as ReactNode}</a>
  ),
  rootRouteId: "__root__",
  useMatch: (...args: unknown[]) => useMatchMock(...args),
  useRouter: () => ({ invalidate: invalidateMock }),
}));

import { DefaultCatchBoundary } from "../DefaultCatchBoundary";

type ElementWithChildrenProps = {
  children?: ReactNode;
};

type ClickableElementProps = ElementWithChildrenProps & {
  onClick: (event?: { preventDefault: () => void }) => void;
};

function getActionElements(tree: ReactElement) {
  const root = tree as ReactElement<ElementWithChildrenProps>;
  const topChildren = root.props.children as ReactNode[];
  const actionsWrapper =
    topChildren[1] as ReactElement<ElementWithChildrenProps>;
  const actionChildren = actionsWrapper.props.children as ReactNode[];

  return {
    tryAgainButton: actionChildren[0] as ReactElement<ClickableElementProps>,
    navigationLink: actionChildren[1] as ReactElement<ClickableElementProps>,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("DefaultCatchBoundary", () => {
  it("renders root navigation and retries via router invalidate", () => {
    useMatchMock.mockReturnValue(true);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const tree = DefaultCatchBoundary({
      error: new Error("root error"),
      reset: vi.fn(),
    });
    const { tryAgainButton, navigationLink } = getActionElements(tree);

    tryAgainButton.props.onClick();

    expect(tryAgainButton.props.children).toBe("Try Again");
    expect(navigationLink.props.children).toBe("Home");
    expect(invalidateMock).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it("renders non-root back navigation and calls history.back", () => {
    useMatchMock.mockReturnValue(false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const backMock = vi.fn();
    const originalHistory = globalThis.history;

    Object.defineProperty(globalThis, "history", {
      configurable: true,
      value: { back: backMock },
    });

    const tree = DefaultCatchBoundary({
      error: new Error("child error"),
      reset: vi.fn(),
    });
    const { navigationLink } = getActionElements(tree);

    const preventDefaultMock = vi.fn();
    navigationLink.props.onClick({ preventDefault: preventDefaultMock });

    expect(navigationLink.props.children).toBe("Go Back");
    expect(preventDefaultMock).toHaveBeenCalledTimes(1);
    expect(backMock).toHaveBeenCalledTimes(1);

    Object.defineProperty(globalThis, "history", {
      configurable: true,
      value: originalHistory,
    });

    consoleSpy.mockRestore();
  });
});
