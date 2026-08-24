import prisma from "../config/prisma.js";

/**
 * Single source of truth for project access.
 *
 * Today a project is reachable only by its owner. When organizations land, this
 * is the one function that changes — every caller keeps working.
 */
export const canAccessProject = async (userId, projectId) => {
  if (!userId || !projectId) return false;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  return Boolean(project);
};

/**
 * Where-clause fragment scoping a CodeExplanation query to its owner.
 * Use this instead of hand-writing `project: { userId }` at each call site.
 */
export const explanationOwnedBy = (userId) => ({
  project: { userId },
});
