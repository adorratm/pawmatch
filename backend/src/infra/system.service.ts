import { Injectable } from '@nestjs/common';
import * as os from 'os';
import checkDiskSpace from 'check-disk-space';
import { QueuesService } from './queues.service';

@Injectable()
export class SystemService {
  constructor(private readonly queues: QueuesService) {}

  async getMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const usedPercent = Math.round(((total - free) / total) * 100);
    const cpus = os.cpus();
    let disk: { totalGb: number; freeGb: number; usedPercent: number } | null = null;
    try {
      const root = process.platform === 'win32' ? 'C:\\' : '/';
      const info = await checkDiskSpace(root);
      disk = {
        totalGb: Math.round(info.size / 1024 / 1024 / 1024),
        freeGb: Math.round(info.free / 1024 / 1024 / 1024),
        usedPercent: Math.round(((info.size - info.free) / info.size) * 100),
      };
    } catch {
      disk = null;
    }
    const mem = process.memoryUsage();
    const queueStats = await this.queues.stats();
    return {
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model,
        load: os.loadavg(),
      },
      memory: {
        totalMb: Math.round(total / 1024 / 1024),
        freeMb: Math.round(free / 1024 / 1024),
        usedPercent,
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
      disk,
      uptimeSec: Math.round(process.uptime()),
      queues: queueStats.queues,
    };
  }
}
