export const ROLE_SLUGS = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  FINANCE_MANAGER: "FINANCE_MANAGER",
  DISPATCHER: "DISPATCHER",
  VIEWER: "VIEWER",
} as const;

export type RoleSlug = (typeof ROLE_SLUGS)[keyof typeof ROLE_SLUGS];

export const ROLE_COLORS: Record<string, string> = {
  [ROLE_SLUGS.SUPER_ADMIN]: "bg-purple-500/10 text-purple-500",
  [ROLE_SLUGS.OPERATIONS_MANAGER]: "bg-blue-500/10 text-blue-500",
  [ROLE_SLUGS.SUPPORT_AGENT]: "bg-green-500/10 text-green-500",
  [ROLE_SLUGS.FINANCE_MANAGER]: "bg-amber-500/10 text-amber-500",
  [ROLE_SLUGS.DISPATCHER]: "bg-cyan-500/10 text-cyan-500",
  [ROLE_SLUGS.VIEWER]: "bg-slate-500/10 text-slate-500",
};

export const getRoleColor = (slug: string): string => {
  return ROLE_COLORS[slug] || "bg-muted text-muted-foreground";
};
