import data from './requirements.json';

/** Support state for a single (Mastodon version × component version) cell. */
export type Support = 'yes' | 'warn' | 'no' | null;

export interface MatrixRow {
  /** Component version label, e.g. "8.1" or "1.26.3+". */
  version: string;
  /** One entry per Mastodon version, in `mastodonVersions` order. */
  support: Support[];
}

export interface Matrix {
  /** Stable identifier, unique within a component. */
  id: string;
  /** Display heading for the sub-matrix, or null when the component has a single unnamed matrix. */
  label: string | null;
  rows: MatrixRow[];
}

export interface Component {
  title: string;
  matrices: Matrix[];
}

export type LifecycleState = 'development' | 'supported' | 'deprecated' | 'eol';

export interface LifecycleEntry {
  version: string;
  status: string;
  /** Release date (ISO `YYYY-MM-DD`), or null if not recorded. */
  released: string | null;
  endOfLife: string | null;
  state: LifecycleState;
}

export interface Requirements {
  mastodonVersions: string[];
  lifecycle: LifecycleEntry[];
  components: Record<string, Component>;
}

const requirements = data as unknown as Requirements;

export const mastodonVersions = requirements.mastodonVersions;
export const lifecycle = requirements.lifecycle;
export const components = requirements.components;

/**
 * Git branch name for a lifecycle entry: `main` for the development branch,
 * otherwise the stable branch (e.g. `stable-45` for "4.5").
 */
export function branchName(entry: LifecycleEntry): string {
  return entry.state === 'development'
    ? 'main'
    : `stable-${entry.version.replace(/\./g, '')}`;
}

/**
 * Total days a release is (or was) supported: from its release date to its End
 * of Life date, or to `now` for a branch still supported (no EOL date set).
 * Returns null when the release date is unknown.
 */
export function daysSupported(entry: LifecycleEntry, now: Date = new Date()): number | null {
  if (!entry.released) return null;
  const start = Date.parse(entry.released);
  const end = entry.endOfLife ? Date.parse(entry.endOfLife) : now.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  // Floor to completed days so an ongoing branch's count doesn't drift with the
  // build's time-of-day (release date is midnight UTC; `now` carries a clock time).
  return Math.floor((end - start) / 86_400_000);
}

/** Look up a single matrix by component id and matrix id. */
export function getMatrix(componentId: string, matrixId?: string): Matrix {
  const component = components[componentId];
  if (!component) {
    throw new Error(`Unknown component "${componentId}" in requirements data.`);
  }
  const matrix = matrixId
    ? component.matrices.find((m) => m.id === matrixId)
    : component.matrices[0];
  if (!matrix) {
    throw new Error(
      `Unknown matrix "${matrixId}" for component "${componentId}".`
    );
  }
  return matrix;
}

export default requirements;
