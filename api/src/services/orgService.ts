import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { OrgRepository } from '@/repositories/OrgRepository';
import { UserRepository } from '@/repositories/UserRepository';
import type { Organization, OrgMember } from '@/db/schema';

export class OrgService {
  constructor(
    private readonly orgRepository: OrgRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(ownerId: string, name: string): Promise<Organization> {
    const org = await this.orgRepository.create({ name, ownerId, plan: 'corp_starter' });
    await this.orgRepository.addMember(org.id, ownerId, 'owner');
    return org;
  }

  async get(id: string, requesterId: string): Promise<Organization> {
    await this.requireMembership(id, requesterId);
    const org = await this.orgRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');
    return org;
  }

  async update(id: string, requesterId: string, data: { name?: string }): Promise<Organization> {
    await this.requireRole(id, requesterId, ['owner', 'admin']);
    return this.orgRepository.update(id, data);
  }

  async getMembers(orgId: string, requesterId: string) {
    await this.requireMembership(orgId, requesterId);
    return this.orgRepository.getMembers(orgId);
  }

  async invite(orgId: string, requesterId: string, email: string, role: OrgMember['role']): Promise<void> {
    await this.requireRole(orgId, requesterId, ['owner', 'admin']);

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundError('User not found — they must register first');

    if (role === 'owner') throw new ForbiddenError('Cannot assign owner role via invite');

    await this.orgRepository.addMember(orgId, user.id, role);
  }

  async updateMemberRole(
    orgId: string,
    requesterId: string,
    targetUserId: string,
    role: OrgMember['role'],
  ): Promise<OrgMember> {
    await this.requireRole(orgId, requesterId, ['owner']);
    if (role === 'owner') throw new ForbiddenError('Cannot assign owner role');
    return this.orgRepository.updateMemberRole(orgId, targetUserId, role);
  }

  async removeMember(orgId: string, requesterId: string, targetUserId: string): Promise<void> {
    await this.requireRole(orgId, requesterId, ['owner', 'admin']);

    const target = await this.orgRepository.getMember(orgId, targetUserId);
    if (!target) throw new NotFoundError('Member not found');
    if (target.role === 'owner') throw new ForbiddenError('Cannot remove org owner');

    await this.orgRepository.removeMember(orgId, targetUserId);
  }

  private async requireMembership(orgId: string, userId: string): Promise<OrgMember> {
    const member = await this.orgRepository.getMember(orgId, userId);
    if (!member) throw new ForbiddenError('Not a member of this organization');
    return member;
  }

  private async requireRole(
    orgId: string,
    userId: string,
    roles: OrgMember['role'][],
  ): Promise<void> {
    const member = await this.requireMembership(orgId, userId);
    if (!roles.includes(member.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}