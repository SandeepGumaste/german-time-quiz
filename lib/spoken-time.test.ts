import { describe, expect, it } from "vitest";
import { normalizeSpokenTime } from "./spoken-time";

describe("normalizeSpokenTime", () => {
  it("leaves spoken words alone", () => {
    expect(normalizeSpokenTime("  halb drei ")).toBe("halb drei");
  });
  it("turns digit forms into words", () => {
    expect(normalizeSpokenTime("8:20")).toBe("acht Uhr zwanzig");
    expect(normalizeSpokenTime("20 nach 8")).toBe("zwanzig nach acht");
    expect(normalizeSpokenTime("20 vor 9")).toBe("zwanzig vor neun");
  });
  it("turns hh:30 into halb of the next hour", () => {
    expect(normalizeSpokenTime("2:30")).toBe("halb drei");
  });
});
