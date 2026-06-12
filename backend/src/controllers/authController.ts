import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { getUserId } from "../middleware/requireAuth.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { AuthService } from "../services/authService.js";
import { BaseController } from "./BaseController.js";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().max(100).optional(),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  })
  .strict();

const googleAuthSchema = z
  .object({
    googleId: z.string().min(1),
    email: z.string().email(),
    name: z.string().optional(),
  })
  .strict();

class AuthController extends BaseController {
  private get service(): AuthService {
    const userRepo = new UserRepository(db);
    return new AuthService(userRepo);
  }

  async register(req: Request, res: Response): Promise<void> {
    const input = registerSchema.parse(req.body);
    const result = await this.service.register(input.email, input.password, input.fullName);
    this.handleCreated(res, result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const input = loginSchema.parse(req.body);
    const result = await this.service.login(input.email, input.password);
    this.handleSuccess(res, result);
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const input = changePasswordSchema.parse(req.body);
    await this.service.changePassword(userId, input.currentPassword, input.newPassword);
    this.handleNoContent(res);
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const input = googleAuthSchema.parse(req.body);
    const result = await this.service.loginWithGoogle(
      input.googleId,
      input.email,
      input.name ?? input.email.split("@")[0] ?? input.email
    );
    this.handleSuccess(res, result);
  }

  async me(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: { code: "not_found", message: "User not found" } });
      return;
    }
    // Strip password hash
    const { passwordHash: _dropped, ...safeUser } = user;
    this.handleSuccess(res, safeUser);
  }
}

export const authController = new AuthController();
