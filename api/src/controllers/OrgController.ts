import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { OrgService } from '@/services/orgService';
import { OrgRepository } from '@/repositories/OrgRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { createOrgSchema, updateOrgSchema, inviteSchema, updateRoleSchema } from '@/validators/org.schema';


const orgService = new OrgService(new OrgRepository(), new UserRepository());

class OrgController extends BaseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = createOrgSchema.parse(req.body);
      const org = await orgService.create(req.user!.id, name);
      this.handleCreated(res, { org });
    } catch (error) {
      this.handleError(error, res, 'createOrg');
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const org = await orgService.get(this.param(req, 'id'), req.user!.id);
      this.handleSuccess(res, { org });
    } catch (error) {
      this.handleError(error, res, 'getOrg');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const data = updateOrgSchema.parse(req.body);
      const org = await orgService.update(this.param(req, 'id'), req.user!.id, data);
      this.handleSuccess(res, { org });
    } catch (error) {
      this.handleError(error, res, 'updateOrg');
    }
  }

  async getMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await orgService.getMembers(this.param(req, 'id'), req.user!.id);
      this.handleSuccess(res, { members });
    } catch (error) {
      this.handleError(error, res, 'getOrgMembers');
    }
  }

  async invite(req: Request, res: Response): Promise<void> {
    try {
      const { email, role } = inviteSchema.parse(req.body);
      await orgService.invite(this.param(req, 'id'), req.user!.id, email, role);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'inviteOrgMember');
    }
  }

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = updateRoleSchema.parse(req.body);
      const member = await orgService.updateMemberRole(
        this.param(req, 'id'),
        req.user!.id,
        this.param(req, 'userId'),
        role,
      );
      this.handleSuccess(res, { member });
    } catch (error) {
      this.handleError(error, res, 'updateOrgMemberRole');
    }
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      await orgService.removeMember(this.param(req, 'id'), req.user!.id, this.param(req, 'userId'));
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'removeOrgMember');
    }
  }
}

export const orgController = new OrgController();