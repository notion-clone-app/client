import { useCurrentUser, useLogout } from "@/modules/identity";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const logout = useLogout();

  return (
    <main>
      <h1>Workspace dashboard</h1>
      {currentUser.data && (
        <>
          <p>{currentUser.data.email}</p>
          <p>{currentUser.data.firstName}</p>
          <p>{currentUser.data.lastName}</p>
        </>
      )}
      <button disabled={logout.isPending} type="button" onClick={() => logout.mutate()}>
        Выйти
      </button>
    </main>
  );
};

export const Component = DashboardPage;
