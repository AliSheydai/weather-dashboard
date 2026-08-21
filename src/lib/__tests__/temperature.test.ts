import {
  convertTemperature,
  convertTempDiff,
  formatTemperature,
  formatDegree,
} from "../temperature";

describe("temperature utilities", () => {
  describe("convertTemperature", () => {
    it("should return Celsius as is when unit is C", () => {
      expect(convertTemperature(0, "C")).toBe(0);
      expect(convertTemperature(22, "C")).toBe(22);
      expect(convertTemperature(-10, "C")).toBe(-10);
    });

    it("should convert Celsius to Fahrenheit when unit is F", () => {
      expect(convertTemperature(0, "F")).toBe(32);
      expect(convertTemperature(100, "F")).toBe(212);
      expect(convertTemperature(22, "F")).toBe(72);
      expect(convertTemperature(-10, "F")).toBe(14);
    });

    it("should handle edge cases and non-numbers gracefully", () => {
      expect(convertTemperature(NaN, "C")).toBe(0);
      expect(convertTemperature(null as unknown as number, "F")).toBe(0);
    });
  });

  describe("convertTempDiff", () => {
    it("should return 1-to-1 difference for Celsius", () => {
      expect(convertTempDiff(3, "C")).toBe(3);
      expect(convertTempDiff(-2.5, "C")).toBe(-2.5);
    });

    it("should scale difference by 1.8 for Fahrenheit", () => {
      expect(convertTempDiff(1, "F")).toBe(1.8);
      expect(convertTempDiff(5, "F")).toBe(9);
      expect(convertTempDiff(-2, "F")).toBe(-3.6);
    });
  });

  describe("formatTemperature", () => {
    it("should format temperature with unit symbol", () => {
      expect(formatTemperature(22, "C")).toBe("22°C");
      expect(formatTemperature(22, "F")).toBe("72°F");
    });
  });

  describe("formatDegree", () => {
    it("should format value with degree sign", () => {
      expect(formatDegree(72.4)).toBe("72°");
      expect(formatDegree(22)).toBe("22°");
    });
  });
});
