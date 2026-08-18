import type { MouseEvent as ReactMouseEvent } from "react";

export type ProgressRef = { current: number };
export type ScrollTo = (event: ReactMouseEvent<HTMLAnchorElement>, target: string) => void;
