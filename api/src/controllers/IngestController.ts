import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IngestService } from '@/services/ingestService';
import { IngestRepository } from '@/repositories/IngestRepository';
import { ingestSchema } from '@/validators/ingest.schema';

const ingestService = new IngestService(new IngestRepository());

class IngestController extends BaseController {
  async ingest(req: Request, res: Response): Promise<void> {
    try {
      const input = ingestSchema.parse(req.body);
      await ingestService.ingest(req.user!.id, input);
      this.handleSuccess(res, { ok: true });
    } catch (error) {
      this.handleError(error, res, 'ingest');
    }
  }
}

export const ingestController = new IngestController();