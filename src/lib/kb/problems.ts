// The problems a merged ticket really holds, counted the way the desk counts (causes.ts):
// a report is counted under the cause its tenant gives it. The desk's own notes (desk-notes.json)
// mark reports that are not a flipped month at all: the date moved by one day. That is its own
// problem, `shift`, with its own ticket; its reports stay counted where they are filed, as readAs() says.
import { groupByCause, readAs, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  taggedAs: Record<string, number>;
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // For `shift`: the cause each of its reports is filed and counted under.
  filedUnder?: Record<string, number>;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

function row(problem: ProblemRow['problem'], rs: Report[]): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: tally(rs.map((r) => r.channel)),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

// Cause rows exactly as the desk's CauseTable groups them, then one `shift` row for the one-day moves.
export function problemRows(
  merged: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { causes: CauseGroup[]; rows: ProblemRow[] } {
  const causes = groupByCause(merged, tenantOf);
  const rows = causes.map((g) => row(g.cause, g.reports));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const shift = row('shift', moved);
    shift.filedUnder = Object.fromEntries(causes.filter((g) => readAs(g, oneDayMove)).map((g) => [g.cause, readAs(g, oneDayMove)]));
    rows.push(shift);
  }
  return { causes, rows };
}
