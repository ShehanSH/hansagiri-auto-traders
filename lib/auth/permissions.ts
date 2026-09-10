import { ROLE_PERMISSIONS } from "@/config/constants";
import type { AdminRole } from "@/types";

export function hasRole(
  role: AdminRole | null | undefined,
  permission: string,
): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  if (!granted) return false;
  if (granted.includes("*")) return true;
  if (granted.includes(permission)) return true;
  if (permission.endsWith(":read") && granted.includes(permission.replace(":read", ""))) {
    return true;
  }
  if (permission.endsWith(":write") && granted.includes(permission.replace(":write", ""))) {
    return true;
  }
  return false;
}
