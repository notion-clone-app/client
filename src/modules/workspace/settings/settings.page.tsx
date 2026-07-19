import { useState, type FormEvent } from "react";
import { Check, ChevronDown, MailPlus, Settings, Users } from "lucide-react";
import { Button } from "@/shared/ui/kit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import type { WorkspaceMemberRole } from "../collaboration/model/workspace-member.entity";
import { useWorkspaceContext } from "../workspace.context";

const SettingsPage = () => {
  const workspace = useWorkspaceContext();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceMemberRole>("editor");

  const invite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    workspace.inviteMember(email.trim(), role);
    setEmail("");
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 md:py-14">
      <div className="mb-10">
        <div className="mb-4 grid size-10 place-items-center rounded-xl border border-border bg-card shadow-card">
          <Settings className="size-4.5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Workspace settings</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage workspace identity and members.
        </p>
      </div>

      <div className="space-y-8">
        <SettingsSection
          icon={Users}
          title="Members"
          description="Invite people and define their initial workspace role."
        >
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={invite}>
            <input
              type="email"
              required
              value={email}
              aria-label="Member email"
              placeholder="teammate@company.com"
              className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20"
              onChange={(event) => setEmail(event.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="justify-between sm:w-36">
                  <span className="capitalize">{role}</span> <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {(["editor", "reviewer", "viewer"] as const).map((item) => (
                  <DropdownMenuItem key={item} onSelect={() => setRole(item)}>
                    <span className="flex-1 capitalize">{item}</span>
                    {role === item && <Check />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit">
              <MailPlus /> Invite
            </Button>
          </form>

          <div className="mt-5 divide-y divide-border">
            {workspace.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                  {initials(member.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </span>
                {member.status === "invited" && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700">
                    Invited
                  </span>
                )}
                <span className="w-16 text-right text-xs text-muted-foreground capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>
    </main>
  );
};

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-border pt-8 sm:grid-cols-[13rem_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4" /> {title}
        </div>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">{children}</div>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Component = SettingsPage;
