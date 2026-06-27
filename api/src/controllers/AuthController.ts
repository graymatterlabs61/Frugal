import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AuthService } from '@/services/authService';
import { UserRepository } from '@/repositories/UserRepository';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '@/validators/auth.schema';
import { config } from '@/config/unifiedConfig';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax' as const,
  maxAge: config.auth.jwtExpiresInSeconds * 1000,
  path: '/',
};

class AuthController extends BaseController {
  private readonly authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService(new UserRepository());
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const { token, user } = await this.authService.register(input);
      res.cookie('token', token, COOKIE_OPTIONS);
      this.handleCreated(res, { token, user });
    } catch (error) {
      this.handleError(error, res, 'register');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const { token, user } = await this.authService.login(input);
      res.cookie('token', token, COOKIE_OPTIONS);
      this.handleSuccess(res, { token, user });
    } catch (error) {
      this.handleError(error, res, 'login');
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const input = googleAuthSchema.parse(req.body);
      const { token, user } = await this.authService.googleAuth(input);
      res.cookie('token', token, COOKIE_OPTIONS);
      this.handleSuccess(res, { token, user });
    } catch (error) {
      this.handleError(error, res, 'googleAuth');
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const input = changePasswordSchema.parse(req.body);
      await this.authService.changePassword(req.user!.id, input);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'changePassword');
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authService.getMe(req.user!.id);
      this.handleSuccess(res, { user });
    } catch (error) {
      this.handleError(error, res, 'me');
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const input = updateProfileSchema.parse(req.body);
      const user = await this.authService.updateProfile(req.user!.id, input);
      this.handleSuccess(res, { user });
    } catch (error) {
      this.handleError(error, res, 'updateProfile');
    }
  }

  logout(_req: Request, res: Response): void {
    res.clearCookie('token', { path: '/' });
    res.status(204).end();
  }
}

export const authController = new AuthController();