import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  organizations,
  orgMembers,
  users,
  type Organization,
  type NewOrganization,
  type OrgMember,
} from '@/db/schema';

export class OrgRepository {
  async findById(id: string): Promise<Organization | undefined> {
    return db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  }

  async create(data: NewOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(data).returning();
    return org;
  }

  async update(id: string, data: Partial<NewOrganization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  async getMember(orgId: string, userId: string): Promise<OrgMember | undefined> {
    return db.query.orgMembers.findFirst({
      where: and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)),
    });
  }

  async getMembers(orgId: string): Promise<(OrgMember & { email: string; fullName: string | null })[]> {
    const rows = await db
      .select({
        id: orgMembers.id,
        orgId: orgMembers.orgId,
        userId: orgMembers.userId,
        role: orgMembers.role,
        createdAt: orgMembers.createdAt,
        email: users.email,
        fullName: users.fullName,
      })
      .from(orgMembers)
      .innerJoin(users, eq(orgMembers.userId, users.id))
      .where(eq(orgMembers.orgId, orgId));
    return rows;
  }

  async addMember(orgId: string, userId: string, role: OrgMember['role']): Promise<OrgMember> {
    const [member] = await db
      .insert(orgMembers)
      .values({ orgId, userId, role })
      .onConflictDoUpdate({ target: [orgMembers.orgId, orgMembers.userId], set: { role } })
      .returning();
    return member;
  }

  async updateMemberRole(orgId: string, userId: string, role: OrgMember['role']): Promise<OrgMember> {
    const [member] = await db
      .update(orgMembers)
      .set({ role })
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)))
      .returning();
    return member;
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    await db.delete(orgMembers).where(
      and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)),
    );
  }
}