export type AuthSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
}>;

let currentSession: AuthSession | null = null;

export const authSession = {
  get: () => currentSession,
  set: (session: AuthSession) => {
    currentSession = session;
  },
  clear: () => {
    currentSession = null;
  },
};
