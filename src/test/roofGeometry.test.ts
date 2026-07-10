import { describe, expect, it } from "vitest";
import { computeWallLayout } from "../components/WindowConfigurator/pitchGeometry";
import { computeRoofPlaneProfile } from "../components/WindowConfigurator/roofGeometry";
import {
  BACK_WALL_THICKNESS,
  DEFAULT_CONFIG,
  FRONT_WALL_THICKNESS,
  type WindowConfig,
} from "../components/WindowConfigurator/types";

const mm = (value: number) => value / 1000;
const OPENING_CLEARANCE = 20;
const TEST_ANGLES = [18, 31, 36, 50, 68, 75] as const;

describe("computeRoofPlaneProfile", () => {
  it.each(TEST_ANGLES)("keeps outer margins and opening anchors stable at %i°", (pitchDeg) => {
    const config: WindowConfig = {
      ...DEFAULT_CONFIG,
      roofEnabled: true,
      pitchDeg,
    };

    const layout = computeWallLayout(config);
    const profile = computeRoofPlaneProfile(config);

    expect(profile).not.toBeNull();
    if (!profile) return;

    const cosPitch = Math.cos((pitchDeg * Math.PI) / 180);
    const bodyHalfWidth = mm(layout.totalWallWidth) / 2;
    const totalBodyDepth = mm(FRONT_WALL_THICKNESS + layout.backExtrusionDepth) / cosPitch;
    const outerMargin = mm(config.roofOffset);

    expect(-bodyHalfWidth - profile.outer.left).toBeCloseTo(outerMargin, 6);
    expect(profile.outer.right - bodyHalfWidth).toBeCloseTo(outerMargin, 6);
    expect(profile.outer.front).toBeCloseTo(outerMargin, 6);
    expect(-totalBodyDepth - profile.outer.back).toBeCloseTo(outerMargin, 6);

    const firstWindowLeft = mm(layout.windowPositions[0]) - bodyHalfWidth;
    const lastWindowRight = mm(
      layout.windowPositions[config.windowCopies - 1] + config.windowWidth,
    ) - bodyHalfWidth;
    const PLANE_OFFSET = 50;
    const tanPitch = Math.sin((pitchDeg * Math.PI) / 180) / cosPitch;
    const offsetCorrection = mm(PLANE_OFFSET) * tanPitch;
    const openingFront = -(mm(FRONT_WALL_THICKNESS) / cosPitch) + offsetCorrection;
    const openingBack = -(mm(FRONT_WALL_THICKNESS + layout.backExtrusionDepth - BACK_WALL_THICKNESS) / cosPitch) + offsetCorrection;
    const openingClearance = mm(OPENING_CLEARANCE);

    expect(profile.opening.left).toBeCloseTo(firstWindowLeft - openingClearance, 6);
    expect(profile.opening.right).toBeCloseTo(lastWindowRight + openingClearance, 6);
    expect(profile.opening.front).toBeCloseTo(openingFront, 6);
    expect(profile.opening.back).toBeCloseTo(openingBack, 6);
  });
});
