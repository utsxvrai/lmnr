/*
 * Shapes evaluation trial rows (JSON columns serialized as strings) for the
 * CSV / JSON download. Client-safe (no server imports).
 */

export interface SerializedTrial {
  id: string;
  taskId: string;
  index: number;
  executorOutput: string;
  data: string;
  target: string;
  metadata: string;
  scores: string;
}

/**
 * Parses a serialized JSON value, returning the original string only when it is not valid JSON.
 * Unlike `tryParseJson(value) ?? value`, a valid JSON `null` stays `null` instead of becoming "null".
 */
export const parseJsonOrRaw = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

/** Parses the trial's JSON columns and flattens its scores into top-level fields. */
export const formatTrialsForExport = (trials: SerializedTrial[]): Record<string, unknown>[] =>
  trials.map(({ scores, ...trial }) => {
    const parsedScores = parseJsonOrRaw(scores);
    return {
      ...trial,
      data: parseJsonOrRaw(trial.data),
      target: parseJsonOrRaw(trial.target),
      executorOutput: parseJsonOrRaw(trial.executorOutput),
      ...(parsedScores as Record<string, number | null> | null),
    };
  });
