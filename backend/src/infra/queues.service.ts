import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { SearchService } from './search.service';

const QUEUE_NAMES = ['notifications', 'search-index'] as const;

@Injectable()
export class QueuesService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(QueuesService.name);
  private redis: Redis | null = null;
  private connection: ConnectionOptions | null = null;
  private queues = new Map<string, Queue>();
  private workers: Worker[] = [];
  private broadcastHandler: ((data: { title: string; body: string; type?: string }) => Promise<unknown>) | null =
    null;

  constructor(private readonly search: SearchService) {}

  setBroadcastHandler(fn: (data: { title: string; body: string; type?: string }) => Promise<unknown>) {
    this.broadcastHandler = fn;
  }

  get enabled() {
    return !!this.connection;
  }

  async onModuleInit() {
    const host = process.env.REDIS_HOST;
    if (!host) {
      this.log.warn('REDIS_HOST yok — kuyruklar senkron fallback');
      return;
    }
    try {
      this.connection = {
        host,
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
      };
      this.redis = new Redis(this.connection);
      await this.redis.ping();
      for (const name of QUEUE_NAMES) {
        this.queues.set(name, new Queue(name, { connection: this.connection }));
      }
      this.workers.push(
        new Worker(
          'notifications',
          async (job) => {
            if (!this.broadcastHandler) throw new Error('Broadcast handler yok');
            return this.broadcastHandler(job.data);
          },
          { connection: this.connection },
        ),
      );
      this.workers.push(
        new Worker(
          'search-index',
          async (job) => {
            if (job.name === 'reindex') return this.search.reindexAll();
            if (job.name === 'upsert') {
              return this.search.upsert(job.data.type, job.data.id, job.data.doc);
            }
            if (job.name === 'delete') return this.search.remove(job.data.type, job.data.id);
          },
          { connection: this.connection },
        ),
      );
      this.log.log(`Redis/BullMQ bağlandı: ${host}`);
    } catch (err) {
      this.log.warn(`Redis kapalı: ${(err as Error).message}`);
      this.connection = null;
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((w) => w.close()));
    await Promise.all([...this.queues.values()].map((q) => q.close()));
    this.redis?.disconnect();
  }

  async enqueueBroadcast(data: { title: string; body: string; type?: string }) {
    const q = this.queues.get('notifications');
    if (!q) return null;
    await q.add('broadcast', data);
    return true;
  }

  async enqueueReindex() {
    const q = this.queues.get('search-index');
    if (!q) return this.search.reindexAll();
    await q.add('reindex', {});
    return { queued: true };
  }

  async stats() {
    if (!this.connection) return { enabled: false, queues: [], failed: {} };
    const queues = [];
    const failed: Record<string, { id: string; name: string; failedReason?: string }[]> = {};
    for (const [name, q] of this.queues) {
      const counts = await q.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
      queues.push({
        name,
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        delayed: counts.delayed ?? 0,
        failed: counts.failed ?? 0,
        completed: counts.completed ?? 0,
      });
      const jobs = await q.getFailed(0, 20);
      failed[name] = jobs.map((j) => ({
        id: String(j.id),
        name: j.name,
        failedReason: j.failedReason,
      }));
    }
    return { enabled: true, queues, failed };
  }

  async retryFailed(name: string) {
    const q = this.queues.get(name);
    if (!q) return { retried: 0 };
    const jobs = await q.getFailed(0, 100);
    for (const j of jobs) await j.retry();
    return { retried: jobs.length };
  }

  async clean(name: string) {
    const q = this.queues.get(name);
    if (!q) return { ok: false };
    await q.clean(0, 1000, 'completed');
    await q.clean(0, 1000, 'failed');
    return { ok: true };
  }
}
