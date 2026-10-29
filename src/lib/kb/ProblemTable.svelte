<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import split from '#lib/data/split-4471.json';
  import { splitTicket, type ProblemGroup } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const result = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const placed = $derived(result.groups.filter((g) => g.problem !== 'unplaced'));
  const unplaced = $derived(result.groups.find((g) => g.problem === 'unplaced'));
  const counted = $derived(result.groups.reduce((n, g) => n + g.reports.length, 0));

  const issue = (g: ProblemGroup) => (split.issues as Record<string, number>)[g.problem];
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports in #{ticket} ·
  <strong>{placed.length}</strong>
  {placed.length === 1 ? 'problem' : 'problems'}
  {#if unplaced}· <strong class="warn">{unplaced.reports.length}</strong> not placed{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr class:unplaced={g.problem === 'unplaced'}>
        <td><code>{g.problem}</code></td>
        <td class="n">{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issue(g)}<a href="https://github.com/{split.repo}/issues/{issue(g)}">{split.repo}#{issue(g)}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>all</td><td class="n">{counted}</td><td colspan="5" class="small">{counted === result.merged.length ? 'every report is in exactly one row' : 'rows do not add up to the ticket: check the split'}</td></tr>
  </tfoot>
</table>

{#each placed.filter((g) => g.reports.length <= 10) as g (g.problem)}
  <p class="small"><code>{g.problem}</code>: {g.reports.map((r) => r.id).join(', ')}</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .n { font-variant-numeric: tabular-nums; font-weight: 600; }
  .small { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); }
  .unplaced td { background: var(--warn-bg); }
  tfoot td { border-bottom: none; font-weight: 600; }
</style>
