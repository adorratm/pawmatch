import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import {
  GOLD_SUPER_LIKE_WEEKLY,
  mondayUtcWeekKey,
  type PatiSubscriptionPrefs,
  resolveGoldFromPreferences,
} from '../common/pati-subscription.util';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly entityManager: EntityManager) {}

  async getMySubscription(userId: number) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { profile: true },
    });
    const prefs = (user?.profile?.preferences ?? {}) as Record<string, unknown>;
    const pati = (prefs.patiSubscription ?? {}) as PatiSubscriptionPrefs;
    const gold = resolveGoldFromPreferences(prefs);

    const goldPlan = await this.entityManager.findOne(SubscriptionPlan, {
      where: { tier: 'gold', isActive: true },
    });
    const weeklyLimit = goldPlan?.superlikesWeeklyLimit ?? GOLD_SUPER_LIKE_WEEKLY;

    const weekKey = mondayUtcWeekKey();
    let used = typeof pati.superlikesUsedInWeek === 'number' ? pati.superlikesUsedInWeek : 0;
    if (pati.usageWeekKey !== weekKey) {
      used = 0;
    }

    const superlikesRemaining = gold ? Math.max(0, weeklyLimit - used) : 0;

    return {
      tier: gold ? 'gold' : 'free',
      isActive: gold,
      productId: pati.productId ?? goldPlan?.productId ?? null,
      expiresAt: pati.activeUntil ?? null,
      userId,
      superlikesRemaining,
      superlikesWeeklyLimit: gold ? weeklyLimit : 0,
      usageWeekKey: weekKey,
    };
  }
}
