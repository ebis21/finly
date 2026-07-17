import { beforeEach, describe, expect, it } from "vitest";
import {
  clearGuestChoice,
  readGuestChoice,
  rememberGuestChoice,
  shouldShowEntryGate,
} from "@/lib/entry-choice";

describe("entry choice", () => {
  beforeEach(() => localStorage.clear());

  it("shows the gate only after auth resolves without a user or guest choice", () => {
    expect(shouldShowEntryGate(true, false, false)).toBe(false);
    expect(shouldShowEntryGate(false, true, false)).toBe(false);
    expect(shouldShowEntryGate(false, false, true)).toBe(false);
    expect(shouldShowEntryGate(false, false, false)).toBe(true);
  });

  it("remembers and clears guest mode without touching financial data", () => {
    localStorage.setItem("finly-data-v1", "portfolio");
    expect(readGuestChoice()).toBe(false);
    rememberGuestChoice();
    expect(readGuestChoice()).toBe(true);
    clearGuestChoice();
    expect(readGuestChoice()).toBe(false);
    expect(localStorage.getItem("finly-data-v1")).toBe("portfolio");
  });
});
