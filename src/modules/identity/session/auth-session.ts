export type AuthSession = Readonly<{
  accessExpiresAt: number;
}>;

export type AuthState =
  | Readonly<{ status: "unknown" }>
  | Readonly<{ status: "anonymous" }>
  | Readonly<{ status: "authenticated"; session: AuthSession }>;

type Listener = () => void;

let state: AuthState = { status: "unknown" };
const listeners = new Set<Listener>();

function publish(nextState: AuthState) {
  state = nextState;
  for (const listener of listeners) listener();
}

export const authSession = {
  getSnapshot: () => state,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  authenticate: (session: AuthSession) => {
    publish({ status: "authenticated", session });
  },
  clear: () => {
    publish({ status: "anonymous" });
  },
  reset: () => {
    publish({ status: "unknown" });
  },
};
