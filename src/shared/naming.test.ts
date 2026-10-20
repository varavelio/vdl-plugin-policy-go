import { describe, expect, it } from "vitest";
import {
  isValidGoPackageName,
  toGoEnumMemberName,
  toGoFieldName,
  toGoTypeName,
  toGoUnexportedName,
} from "./naming";

describe("naming", () => {
  it("converts VDL names to exported Go names", () => {
    expect(toGoTypeName("CanApproveInvoice")).toBe("CanApproveInvoice");
    expect(toGoFieldName("ownerId")).toBe("OwnerId");
    expect(toGoEnumMemberName("InTransit")).toBe("InTransit");
  });

  it("keeps PascalCase names usable when VDL uses keywords", () => {
    expect(toGoTypeName("type")).toBe("Type");
    expect(toGoFieldName("func")).toBe("Func");
  });

  it("validates package names", () => {
    expect(isValidGoPackageName("policy")).toBe(true);
    expect(isValidGoPackageName("Policy")).toBe(false);
    expect(isValidGoPackageName("my-policy")).toBe(false);
    expect(isValidGoPackageName("func")).toBe(false);
  });
});

describe("toGoUnexportedName", () => {
  it("lowercases the first letter for unexported check functions", () => {
    expect(toGoUnexportedName("CanAccessPanel")).toBe("canAccessPanel");
  });
});
