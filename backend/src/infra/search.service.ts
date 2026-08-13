import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EntityManager, ILike } from 'typeorm';
import { Client } from '@elastic/elasticsearch';
import { User } from '../database/entities/user.entity';
import { Pet } from '../database/entities/pet.entity';
import { Match } from '../database/entities/match.entity';
import { SupportTicket } from '../database/entities/support-ticket.entity';
import { Shelter } from '../database/entities/shelter.entity';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { TranslationEntry } from '../database/entities/translation-entry.entity';
import { CmsPage } from '../database/entities/cms-page.entity';

export type SearchHit = {
  type: string;
  id: number;
  title: string;
  snippet?: string;
  href: string;
};

const INDEX = 'pawmatch';

export function hrefFor(type: string, id: number | string) {
  const map: Record<string, string> = {
    user: '/users',
    pet: '/pets',
    match: '/matches',
    ticket: '/support',
    shelter: '/shelters',
    veterinarian: '/veterinarians',
    i18n: '/i18n',
    cms: '/cms',
    plan: '/plans',
    setting: '/settings',
    ad: '/ads',
    temperament: '/temperaments',
  };
  const base = map[type] || '/';
  return `${base}?id=${id}`;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly log = new Logger(SearchService.name);
  private client: Client | null = null;

  constructor(private readonly em: EntityManager) {}

  get enabled() {
    return !!this.client;
  }

  async onModuleInit() {
    const node = process.env.ELASTICSEARCH_NODE;
    if (!node) {
      this.log.warn('ELASTICSEARCH_NODE yok — arama Postgres ILIKE fallback');
      return;
    }
    try {
      this.client = new Client({ node });
      await this.client.ping();
      await this.client.indices.create({
        index: INDEX,
        mappings: {
          properties: {
            type: { type: 'keyword' },
            title: { type: 'text' },
            snippet: { type: 'text' },
            href: { type: 'keyword' },
          },
        },
      }).catch(() => undefined);
      this.log.log(`Elasticsearch bağlandı: ${node}`);
    } catch (err) {
      this.log.warn(`Elasticsearch kapalı: ${(err as Error).message}`);
      this.client = null;
    }
  }

  async upsert(type: string, id: number, doc: Omit<SearchHit, 'type' | 'id'>) {
    if (!this.client) return;
    await this.client.index({
      index: INDEX,
      id: `${type}-${id}`,
      document: { type, id, ...doc },
    });
  }

  async remove(type: string, id: number) {
    if (!this.client) return;
    await this.client.delete({ index: INDEX, id: `${type}-${id}` }).catch(() => undefined);
  }

  async search(q: string): Promise<{ items: SearchHit[]; source: 'elasticsearch' | 'postgres' }> {
    const term = q.trim();
    if (!term) return { items: [], source: this.client ? 'elasticsearch' : 'postgres' };
    if (this.client) {
      try {
        const res = await this.client.search({
          index: INDEX,
          size: 20,
          query: {
            multi_match: {
              query: term,
              fields: ['title^2', 'snippet', 'type'],
              fuzziness: 'AUTO',
            },
          },
        });
    const items = (res.hits.hits ?? []).map((h) => {
      const src = h._source as SearchHit;
      return { ...src, href: src.href || hrefFor(src.type, src.id) };
    });
        return { items, source: 'elasticsearch' };
      } catch (err) {
        this.log.warn(`ES search fallback: ${(err as Error).message}`);
      }
    }
    return { items: await this.postgresSearch(term), source: 'postgres' };
  }

  async reindexAll() {
    const users = await this.em.find(User, { take: 2000 });
    for (const u of users) {
      await this.upsert('user', u.id, {
        title: `${u.firstName} ${u.lastName}`.trim() || u.email,
        snippet: u.email,
        href: hrefFor('user', u.id),
      });
    }
    const pets = await this.em.find(Pet, { take: 2000 });
    for (const p of pets) {
      await this.upsert('pet', p.id, {
        title: p.name,
        snippet: [p.species, p.breed].filter(Boolean).join(' · '),
        href: hrefFor('pet', p.id),
      });
    }
    const matches = await this.em.find(Match, { relations: { pet1: true, pet2: true }, take: 1000 });
    for (const m of matches) {
      await this.upsert('match', m.id, {
        title: `${m.pet1?.name ?? '?'} × ${m.pet2?.name ?? '?'}`,
        href: hrefFor('match', m.id),
      });
    }
    const tickets = await this.em.find(SupportTicket, { take: 1000 });
    for (const t of tickets) {
      await this.upsert('ticket', t.id, {
        title: t.subject || `Ticket #${t.id}`,
        snippet: t.message?.slice(0, 120),
        href: hrefFor('ticket', t.id),
      });
    }
    const shelters = await this.em.find(Shelter, { take: 500 });
    for (const s of shelters) {
      await this.upsert('shelter', s.id, {
        title: s.name,
        snippet: s.city ?? undefined,
        href: hrefFor('shelter', s.id),
      });
    }
    const vets = await this.em.find(Veterinarian, { relations: { user: true }, take: 500 });
    for (const v of vets) {
      await this.upsert('veterinarian', v.id, {
        title: `${v.user?.firstName ?? ''} ${v.user?.lastName ?? ''}`.trim() || v.licenseNumber,
        snippet: v.licenseNumber,
        href: hrefFor('veterinarian', v.id),
      });
    }
    const entries = await this.em.find(TranslationEntry, { take: 3000 });
    for (const e of entries) {
      await this.upsert('i18n', e.id, {
        title: e.key,
        snippet: e.value?.slice(0, 120),
        href: hrefFor('i18n', e.id),
      });
    }
    const pages = await this.em.find(CmsPage, { take: 200 });
    for (const p of pages) {
      await this.upsert('cms', p.id, {
        title: p.title,
        snippet: p.slug,
        href: hrefFor('cms', p.id),
      });
    }
    return { ok: true, enabled: this.enabled };
  }

  private async postgresSearch(term: string): Promise<SearchHit[]> {
    const like = ILike(`%${term}%`);
    const items: SearchHit[] = [];
    const users = await this.em.find(User, {
      where: [{ email: like }, { firstName: like }, { lastName: like }, { phone: like }],
      take: 8,
    });
    for (const u of users) {
      items.push({
        type: 'user',
        id: u.id,
        title: `${u.firstName} ${u.lastName}`.trim() || u.email,
        snippet: u.email,
        href: hrefFor('user', u.id),
      });
    }
    const pets = await this.em.find(Pet, { where: [{ name: like }, { breed: like }], take: 8 });
    for (const p of pets) {
      items.push({
        type: 'pet',
        id: p.id,
        title: p.name,
        snippet: p.breed ?? p.species,
        href: hrefFor('pet', p.id),
      });
    }
    const tickets = await this.em.find(SupportTicket, {
      where: [{ subject: like }, { message: like }],
      take: 5,
    });
    for (const t of tickets) {
      items.push({
        type: 'ticket',
        id: t.id,
        title: t.subject || `#${t.id}`,
        snippet: t.message?.slice(0, 80),
        href: hrefFor('ticket', t.id),
      });
    }
    const shelters = await this.em.find(Shelter, { where: [{ name: like }, { city: like }], take: 5 });
    for (const s of shelters) {
      items.push({
        type: 'shelter',
        id: s.id,
        title: s.name,
        snippet: s.city ?? undefined,
        href: hrefFor('shelter', s.id),
      });
    }
    const vets = await this.em.find(Veterinarian, {
      where: [{ licenseNumber: like }, { specialization: like }],
      relations: { user: true },
      take: 5,
    });
    for (const v of vets) {
      items.push({
        type: 'veterinarian',
        id: v.id,
        title: `${v.user?.firstName ?? ''} ${v.user?.lastName ?? ''}`.trim() || v.licenseNumber,
        snippet: v.licenseNumber,
        href: hrefFor('veterinarian', v.id),
      });
    }
    const pages = await this.em.find(CmsPage, {
      where: [{ title: like }, { slug: like }],
      take: 5,
    });
    for (const p of pages) {
      items.push({
        type: 'cms',
        id: p.id,
        title: p.title,
        snippet: p.slug,
        href: hrefFor('cms', p.id),
      });
    }
    return items.slice(0, 20);
  }
}
