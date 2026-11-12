import type { Sport, SportFilterDefinition } from '@/types';
import { SPORTS, getSport, getSportFilters } from '@/data/sports';

/**
 * Sports are static reference data shipped with the bundle (no network call
 * needed). Exposed through a service so a CMS-backed source can replace it.
 */
export const sportService = {
  list(): Sport[] {
    return SPORTS;
  },
  get(slug: string | undefined): Sport | undefined {
    return getSport(slug);
  },
  filters(sports: string[]): SportFilterDefinition[] {
    return getSportFilters(sports);
  },
};
