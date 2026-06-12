import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { getUserId } from "../middleware/requireAuth.js";
import { DashboardRepository } from "../repositories/DashboardRepository.js";
import { BaseController } from "./BaseController.js";

function getMonthBounds(): { fromDate: string; toDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  return d.toISOString().slice(0, 10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const daysSchema = z.coerce.number().int().positive().max(90).default(7);
const limitSchema = z.coerce.number().int().positive().max(50).default(5);

class DashboardController extends BaseController {
  private repo(): DashboardRepository {
    return new DashboardRepository(db);
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { fromDate, toDate } = getMonthBounds();
    const stats = await this.repo().getStats(userId, fromDate, toDate);
    this.handleSuccess(res, stats);
  }

  async getDailySpend(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const days = daysSchema.parse(req.query.days);
    const fromDate = daysAgoDate(days);
    const toDate = todayDate();
    const rows = await this.repo().getDailySpend(userId, fromDate, toDate);
    this.handleSuccess(res, { rows });
  }

  async getTopProjects(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { fromDate, toDate } = getMonthBounds();
    const projects = await this.repo().getTopProjects(userId, fromDate, toDate, 5);
    this.handleSuccess(res, { projects });
  }

  async getRecentAlerts(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const limit = limitSchema.parse(req.query.limit);
    const alerts = await this.repo().getRecentAlerts(userId, limit);
    this.handleSuccess(res, { alerts });
  }
}

export const dashboardController = new DashboardController();
