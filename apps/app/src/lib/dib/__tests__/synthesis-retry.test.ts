import { synthesizeDibNarrative } from "../synthesis-retry";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUpdate = jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
const mockSelect = jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ contentJson: { insights: [] } }]) }) });

jest.mock("@/lib/db-client", () => ({
  db: {
    update: (...args: any[]) => mockUpdate(...args),
    select: (...args: any[]) => mockSelect(...args),
  },
}));

jest.mock("@/lib/tables/schema", () => ({
  dibs: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

const mockSynthesize = jest.fn();
jest.mock("@/lib/intelligence/synthesis", () => ({
  synthesizeNarrative: (...args: any[]) => mockSynthesize(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const minimalResult = {
  tables: [],
  stats: { tableCount: 0, totalSizeBytes: 0, relationCount: 0 },
} as any;

function make503Error() {
  return new Error("Service Unavailable: 503 overloaded");
}

function captureSetCall(callIndex = 0) {
  const updateCall = mockUpdate.mock.results[callIndex]?.value;
  return updateCall?.set?.mock?.calls?.[0]?.[0];
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  // Re-wire the chain after clearAllMocks
  const mockWhere = jest.fn().mockResolvedValue([]);
  const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
  mockUpdate.mockReturnValue({ set: mockSet });

  const mockSelectWhere = jest.fn().mockResolvedValue([{ contentJson: {} }]);
  const mockFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
  mockSelect.mockReturnValue({ from: mockFrom });
});

afterEach(() => {
  jest.useRealTimers();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("synthesizeDibNarrative", () => {
  it("marks synthesis_status='success' when synthesizeNarrative resolves", async () => {
    const narrative = { executiveSummary: "All good", keyMetrics: [], trends: [], recommendations: [] };
    mockSynthesize.mockResolvedValueOnce(narrative);

    await synthesizeDibNarrative("dib-1", minimalResult);

    const setPayloads = mockUpdate.mock.results
      .map((r: any) => r.value?.set?.mock?.calls?.[0]?.[0])
      .filter(Boolean);

    const successCall = setPayloads.find((p: any) => p?.synthesisStatus === "success");
    expect(successCall).toBeDefined();
    expect(successCall.synthesisRetryCount).toBe(0);
  });

  it("retries on 503 and eventually succeeds", async () => {
    const narrative = { executiveSummary: "Recovered", keyMetrics: [], trends: [], recommendations: [] };
    mockSynthesize
      .mockRejectedValueOnce(make503Error())
      .mockRejectedValueOnce(make503Error())
      .mockResolvedValueOnce(narrative);

    const promise = synthesizeDibNarrative("dib-2", minimalResult);
    // Advance through retry delays: 1s + 2s
    await jest.runAllTimersAsync();
    await promise;

    expect(mockSynthesize).toHaveBeenCalledTimes(3);

    const setPayloads = mockUpdate.mock.results
      .map((r: any) => r.value?.set?.mock?.calls?.[0]?.[0])
      .filter(Boolean);

    const successCall = setPayloads.find((p: any) => p?.synthesisStatus === "success");
    expect(successCall).toBeDefined();
    expect(successCall.synthesisRetryCount).toBe(2);
  });

  it("marks synthesis_status='failed' after 5 retries of 503 errors", async () => {
    mockSynthesize.mockRejectedValue(make503Error());

    const promise = synthesizeDibNarrative("dib-3", minimalResult);
    await jest.runAllTimersAsync();
    await promise;

    // 1 initial + 5 retries = 6 calls total
    expect(mockSynthesize).toHaveBeenCalledTimes(6);

    const setPayloads = mockUpdate.mock.results
      .map((r: any) => r.value?.set?.mock?.calls?.[0]?.[0])
      .filter(Boolean);

    const failCall = setPayloads.find((p: any) => p?.synthesisStatus === "failed");
    expect(failCall).toBeDefined();
    expect(failCall.synthesisError).toMatch(/503|overloaded|service unavailable/i);
  });

  it("does NOT retry on non-503 errors", async () => {
    mockSynthesize.mockRejectedValueOnce(new Error("Invalid API key"));

    const promise = synthesizeDibNarrative("dib-4", minimalResult);
    await jest.runAllTimersAsync();
    await promise;

    expect(mockSynthesize).toHaveBeenCalledTimes(1);

    const setPayloads = mockUpdate.mock.results
      .map((r: any) => r.value?.set?.mock?.calls?.[0]?.[0])
      .filter(Boolean);

    const failCall = setPayloads.find((p: any) => p?.synthesisStatus === "failed");
    expect(failCall).toBeDefined();
    expect(failCall.synthesisError).toBe("Invalid API key");
  });
});
