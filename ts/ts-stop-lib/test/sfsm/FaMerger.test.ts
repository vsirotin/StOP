import { FaDefinition, mergeFAs } from "../../src/sfsm";

describe("mergeFAs", () => {
    it("should reduce extended definitions and merge into compact output", () => {
        const inputA: FaDefinition = {
            TS: {
                states: {
                    PP: {
                        states: {
                            BPP: {
                                ts: [["I", "BPU>Banknote candidate inserted", "E_Change not needed"]]
                            }
                        },
                        ts: [["I", "BPU>Banknote candidate inserted", "BPU"]]
                    }
                },
                ts: [["I", "TS>start", "PU"]]
            }
        };

        const inputB: FaDefinition = {
            AUX: [["I", "A.s", "E_Change not needed"]]
        };

        const { merged, warnings } = mergeFAs([inputA, inputB]);

        expect(warnings).toEqual([]);
        expect(merged).toEqual({
            TS: [["I", "TS>start", "PU"]],
            PP: [["I", "BPU>Banknote candidate inserted", "BPU"]],
            BPP: [["I", "BPU>Banknote candidate inserted", "E_Change not needed"]],
            AUX: [["I", "A.s", "E_Change not needed"]]
        });
    });

    it("should keep compact input unchanged before merge", () => {
        const compactA: FaDefinition = {
            A: [["I", "A.s", "E_Change not needed"]]
        };
        const compactB: FaDefinition = {
            B: [["I", "B.s", "E_Change not needed"]]
        };

        const { merged, warnings } = mergeFAs([compactA, compactB]);

        expect(warnings).toEqual([]);
        expect(merged).toEqual({
            A: [["I", "A.s", "E_Change not needed"]],
            B: [["I", "B.s", "E_Change not needed"]]
        });
    });

    it("should overwrite duplicate FA keys from later inputs and report warnings", () => {
        const inputA: FaDefinition = {
            TS: [["I", "TS>start", "TS:Locked"]],
            PP: [["I", "PP.s", "E_Change not needed"]]
        };
        const inputB: FaDefinition = {
            PP: [["I", "PP.s2", "E_Payment_OK"]],
            TS: [["I", "TS.s2", "TS:Unlocked"]]
        };

        const { merged, warnings } = mergeFAs([inputA, inputB]);

        expect(merged).toEqual({
            TS: [["I", "TS.s2", "TS:Unlocked"]],
            PP: [["I", "PP.s2", "E_Payment_OK"]]
        });
        expect(warnings).toHaveLength(2);
        expect(warnings[0]).toContain("Duplicate FA key 'PP'");
        expect(warnings[1]).toContain("Duplicate FA key 'TS'");
    });
});