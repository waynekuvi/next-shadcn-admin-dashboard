/**
 * Compatibility layer for migrating from NextAuth to Lucia
 * Provides NextAuth-like functions that use Lucia under the hood
 */

import { getSession, requireAuth } from "./auth-lucia";

/**
 * Get server session (compatible with NextAuth's getServerSession)
 */
export async function getServerSession() {
  const result = await getSession();
  if (!result || !result.user) {
    return null;
  }

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      role: result.user.role,
      organizationId: result.user.organizationId,
      orgRole: result.user.orgRole,
    },
  };
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireServerSession() {
  const { user } = await requireAuth();
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      organizationId: user.organizationId,
      orgRole: user.orgRole,
    },
  };
}

