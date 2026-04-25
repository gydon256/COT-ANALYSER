import { describe, expect, it } from "vitest";
import { mapLegacyRowToReport } from "../lib/cftc/legacyApi";

describe("mapLegacyRowToReport", () => {
  it("maps CFTC Legacy Futures Only API rows into cot_reports inserts", () => {
    const report = mapLegacyRowToReport(7, {
      report_date_as_yyyy_mm_dd: "2026-04-21T00:00:00.000",
      open_interest_all: "735000",
      noncomm_positions_long_all: "217407",
      noncomm_positions_short_all: "142000",
      comm_positions_long_all: "310000",
      comm_positions_short_all: "380000",
      nonrept_positions_long_all: "50000",
      nonrept_positions_short_all: "60000"
    });

    expect(report).toEqual({
      asset_id: 7,
      report_date: "2026-04-21",
      open_interest: 735000,
      non_commercial_long: 217407,
      non_commercial_short: 142000,
      non_commercial_net: 75407,
      commercial_long: 310000,
      commercial_short: 380000,
      commercial_net: -70000,
      non_reportable_long: 50000,
      non_reportable_short: 60000,
      non_reportable_net: -10000
    });
  });
});
