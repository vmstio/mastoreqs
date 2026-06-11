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

export type LifecycleState = 'development' | 'supported' | 'eol';

export interface LifecycleEntry {
  version: string;
  status: string;
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
