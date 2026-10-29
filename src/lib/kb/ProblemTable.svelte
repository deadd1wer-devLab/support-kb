<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import split from '#lib/data/split-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { problemRows, type ProblemRow } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const result = $derived(problemRows(merged, tenantOf, notes.oneDayMove));
  const placed = $derived(result.rows.filter((g) => g.problem !== 'unplaced'));
  const unplaced = $derived(result.rows.find((g) => g.problem === 'unplaced'));

  const issue = (g: ProblemRow) => (split.issues as Record<string, number>)[g.problem];
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ·
  <strong>{placed.length}</strong>
  {placed.length === 1 ? 'problem' : 'problems'}
  {#if unplaced}· <strong class="warn">{unplaced.reports.length}</strong> not placed{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.rows as g (g.problem)}
      <tr class:unplaced={g.problem === 'unplaced'} class:sub={g.filedUnder}>
        <td><code>{g.problem}</code></td>
        <td class="n">{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issue(g)}<a href="https://github.com/{split.repo}/issues/{issue(g)}">{split.repo}#{issue(g)}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each placed.filter((g) => g.filedUnder) as g (g.problem)}
  <p class="small">
    <code>{g.problem}</code>: {g.reports.map((r) => r.id).join(', ')}. Filed by tenant, so they are also counted under
    {Object.entries(g.filedUnder ?? {}).map(([cause, n]) => `${cause} (${n})`).join(', ')}, the way the desk counts.
  </p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .n { font-variant-numeric: tabular-nums; font-weight: 600; }
  .small { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); }
  .unplaced td { background: var(--warn-bg); }
  .sub td:first-child { padding-left: 1.25rem; }
</style>
