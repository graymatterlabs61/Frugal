import { describe, it, expect } from 'vitest';
import { getTableName } from 'drizzle-orm';
import * as schema from '../../src/db/schema.js';

describe('db schema', () => {
  it('defines all 11 tables from spec §5', () => {
    const expected = [
      'users',
      'organizations',
      'org_members',
      'projects',
      'api_connections',
      'usage_records',
      'ingest_events',
      'proxy_requests',
      'budget_rules',
      'alert_log',
      'notifications',
    ];
    const actual = [
      schema.users,
      schema.organizations,
      schema.orgMembers,
      schema.projects,
      schema.apiConnections,
      schema.usageRecords,
      schema.ingestEvents,
      schema.proxyRequests,
      schema.budgetRules,
      schema.alertLog,
      schema.notifications,
    ].map((t) => getTableName(t));
    expect(actual).toEqual(expected);
  });

  it('defines the 7 enums from spec §5', () => {
    expect(schema.planEnum.enumValues).toEqual([
      'free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise',
    ]);
    expect(schema.providerEnum.enumValues).toEqual([
      'openai', 'anthropic', 'replicate', 'falai', 'gemini',
    ]);
    expect(schema.connectionStatusEnum.enumValues).toEqual([
      'active', 'polling_error', 'invalid', 'blocked',
    ]);
    expect(schema.budgetWindowEnum.enumValues).toEqual(['daily', 'monthly']);
    expect(schema.ruleActionEnum.enumValues).toEqual(['alert', 'block', 'throttle']);
    expect(schema.alertStatusEnum.enumValues).toEqual(['active', 'acknowledged', 'resolved']);
    expect(schema.orgRoleEnum.enumValues).toEqual(['owner', 'admin', 'member', 'viewer']);
  });
});