import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  calculateHealthScore,
  getActivityLevel,
  getDaysSinceLastPush,
} from "@/lib/github-scanner";

const fixedNow = new Date("2026-01-29T12:00:00Z");

const daysAgo = (days: number) =>
  new Date(fixedNow.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe("github-scanner helpers", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("calculateHealthScore handles active repo", () => {
    const result = calculateHealthScore({
      pushedAt: daysAgo(3),
      description: "A well documented repository",
      license: "MIT",
      hasIssues: true,
      openIssueCount: 4,
      starCount: 5,
      forkCount: 2,
      isArchived: false,
      topics: ["nextjs"],
      language: "TypeScript",
      size: 1200,
    });

    expect(result).toEqual({ score: 82, grade: "A" });
  });

  it("calculateHealthScore handles dormant repo", () => {
    const result = calculateHealthScore({
      pushedAt: daysAgo(400),
      description: null,
      license: null,
      hasIssues: false,
      openIssueCount: 75,
      starCount: 0,
      forkCount: 0,
      isArchived: false,
      topics: [],
      language: null,
      size: 0,
    });

    expect(result).toEqual({ score: 5, grade: "F" });
  });

  it("calculateHealthScore handles archived repo", () => {
    const result = calculateHealthScore({
      pushedAt: daysAgo(2),
      description: "Archived but still documented",
      license: "Apache-2.0",
      hasIssues: true,
      openIssueCount: 10,
      starCount: 2,
      forkCount: 1,
      isArchived: true,
      topics: ["archive"],
      language: "TypeScript",
      size: 900,
    });

    expect(result).toEqual({ score: 53, grade: "C" });
  });

  it("getActivityLevel covers all thresholds", () => {
    expect(getActivityLevel(daysAgo(1))).toBe("active");
    expect(getActivityLevel(daysAgo(15))).toBe("moderate");
    expect(getActivityLevel(daysAgo(100))).toBe("stale");
    expect(getActivityLevel(daysAgo(181))).toBe("dormant");
    expect(getActivityLevel(null)).toBe("dormant");
  });

  it("getDaysSinceLastPush handles null and date", () => {
    expect(getDaysSinceLastPush(daysAgo(5))).toBe(5);
    expect(getDaysSinceLastPush(null)).toBeNull();
  });
});
