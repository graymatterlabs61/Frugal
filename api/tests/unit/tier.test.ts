import { describe, it, expect } from 'vitest';
import { getPlanLimits, requireCorporate, requirePro } from '@/utils/tier';
import { ForbiddenError } from '@/utils/errors';

describe('tier limits', () => {
  it('free plan: 1 project, 1 connection, 7-day history', () => {
    const limits = getPlanLimits('free');
    expect(limits.maxProjects).toBe(1);
    expect(limits.maxConnections).toBe(1);
    expect(limits.historyDays).toBe(7);
    expect(limits.canBlock).toBe(false);
  });

  it('plus plan: 5 projects, 3 connections, can block', () => {
    const limits = getPlanLimits('plus');
    expect(limits.maxProjects).toBe(5);
    expect(limits.canBlock).toBe(true);
    expect(limits.perUserAttribution).toBe(false);
  });

  it('pro plan: unlimited, per-user attribution enabled', () => {
    const limits = getPlanLimits('pro');
    expect(limits.maxProjects).toBe(Infinity);
    expect(limits.perUserAttribution).toBe(true);
    expect(limits.programmaticApi).toBe(true);
  });

  it('requireCorporate throws for free plan', () => {
    expect(() => requireCorporate('free')).toThrow(ForbiddenError);
  });

  it('requireCorporate passes for corp_starter', () => {
    expect(() => requireCorporate('corp_starter')).not.toThrow();
  });

  it('requirePro throws for free plan', () => {
    expect(() => requirePro('free')).toThrow(ForbiddenError);
  });

  it('requirePro passes for pro', () => {
    expect(() => requirePro('pro')).not.toThrow();
  });
});