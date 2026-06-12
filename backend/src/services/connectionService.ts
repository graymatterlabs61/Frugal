import type {
  ConnectionRepository,
  ConnectionRow,
} from "../repositories/ConnectionRepository.js";
import { decrypt, encrypt } from "../utils/encryption.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import type { Plan } from "../utils/tier.js";
import { PLAN_LIMITS } from "../utils/tier.js";

export type SafeConnection = Omit<ConnectionRow, "apiKeyEncrypted">;

type CreateConnectionInput = {
  provider: ConnectionRow["provider"];
  label?: string;
  projectId?: string;
  apiKey: string;
};

/** Strip encrypted key — NEVER expose to clients */
function toSafe(conn: ConnectionRow): SafeConnection {
  const { apiKeyEncrypted: _dropped, ...safe } = conn;
  return safe;
}

/** Stub provider key validation — attempts a lightweight check. */
async function validateProviderKey(
  provider: ConnectionRow["provider"],
  apiKey: string
): Promise<boolean> {
  if (provider === "openai") {
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }
  // All other providers: accept as-is (stub)
  return true;
}

export class ConnectionService {
  constructor(private readonly connectionRepo: ConnectionRepository) {}

  async list(userId: string, projectId?: string): Promise<SafeConnection[]> {
    const rows = await this.connectionRepo.findAllByUser(userId, projectId);
    return rows.map(toSafe);
  }

  async get(userId: string, connectionId: string): Promise<SafeConnection> {
    const conn = await this.connectionRepo.findById(userId, connectionId);
    if (!conn) throw new NotFoundError("Connection not found");
    return toSafe(conn);
  }

  async create(
    userId: string,
    data: CreateConnectionInput,
    userPlan: Plan
  ): Promise<SafeConnection> {
    const limit = PLAN_LIMITS[userPlan].connections;
    const current = await this.connectionRepo.countByUser(userId);

    if (current >= limit) {
      throw new ValidationError(
        `Your ${userPlan} plan allows a maximum of ${limit} connection${limit === 1 ? "" : "s"}. Upgrade to add more.`
      );
    }

    const apiKeyEncrypted = encrypt(data.apiKey);
    const apiKeySuffix = data.apiKey.slice(-4);

    // Validate key against provider (non-blocking on failure — mark as invalid)
    const isValid = await validateProviderKey(data.provider, data.apiKey).catch(
      (err) => {
        logger.warn("provider_key_validation_error", {
          provider: data.provider,
          error: err instanceof Error ? err.message : String(err),
        });
        return false;
      }
    );

    const conn = await this.connectionRepo.create(userId, {
      provider: data.provider,
      label: data.label,
      projectId: data.projectId,
      apiKeyEncrypted,
      apiKeySuffix,
    });

    if (!isValid) {
      await this.connectionRepo.updateStatus(conn.id, "invalid");
      return toSafe({ ...conn, status: "invalid" });
    }

    return toSafe(conn);
  }

  async delete(userId: string, connectionId: string): Promise<void> {
    // Ownership check first
    await this.get(userId, connectionId);
    const deleted = await this.connectionRepo.delete(userId, connectionId);
    if (!deleted) throw new NotFoundError("Connection not found");
  }

  /** For internal use by polling service — returns decrypted key. */
  decryptKey(conn: ConnectionRow): string {
    return decrypt(conn.apiKeyEncrypted);
  }
}
