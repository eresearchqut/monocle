const NUMERIC_KEY_PADDING = 20; // TODO: allow configurable padding

export const padNumber = (n: number) => n.toString().padStart(NUMERIC_KEY_PADDING, "0");
