import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../database/entities/user.entity';
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
      relations: ['profile'],
    });
    const prefs = (user?.profile?.preferences ?? {}) as Record<string, unknown>;
    const pati = (prefs.patiSubscription ?? {}) as PatiSubscriptionPrefs;
    const gold = resolveGoldFromPreferences(prefs);

    const weekKey = mondayUtcWeekKey();
    let used = typeof pati.superlikesUsedInWeek === 'number' ? pati.superlikesUsedInWeek : 0;
    if (pati.usageWeekKey !== weekKey) {
      used = 0;
    }

    const superlikesRemaining = gold ? Math.max(0, GOLD_SUPER_LIKE_WEEKLY - used) : 0;

    return {
      tier: gold ? 'gold' : 'free',
      isActive: gold,
      productId: pati.productId ?? null,
      expiresAt: pati.activeUntil ?? null,
      userId,
      superlikesRemaining,
      superlikesWeeklyLimit: gold ? GOLD_SUPER_LIKE_WEEKLY : 0,
      usageWeekKey: weekKey,
    };
  }
}
