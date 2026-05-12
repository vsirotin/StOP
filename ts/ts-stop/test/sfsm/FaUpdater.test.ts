import * as path from 'path';
import { loadFAFromFile } from '../../src/sfsm';
import { updateCompactFA, updateFullFA } from '../../src/sfsm';
import { FaUpdate } from '../../src/sfsm';

const dataDir = path.resolve(__dirname, 'test-data');

function load(name: string) {
    return loadFAFromFile(path.join(dataDir, name));
}

// ---------------------------------------------------------------------------
// updateCompactFA – unit tests
// ---------------------------------------------------------------------------

describe('updateCompactFA', () => {

    describe('remove', () => {
        it('should remove the named FA from the result', () => {
            const source = load('turnstile-fa-compact.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateCompactFA(source, update);
            expect(Object.keys(result)).not.toContain('CPP');
        });

        it('should keep all other FAs when removing one', () => {
            const source = load('turnstile-fa-compact.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateCompactFA(source, update);
            expect(Object.keys(result)).toContain('TS');
            expect(Object.keys(result)).toContain('PP');
            expect(Object.keys(result)).toContain('BPP');
        });

        it('should prune transitions targeting the removed FA from all remaining FAs', () => {
            const source = load('turnstile-fa-compact.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateCompactFA(source, update);
            for (const transitions of Object.values(result)) {
                for (const t of transitions as [string, string, string, string?][]) {
                    expect(t[2]).not.toBe('CPP');
                }
            }
        });

        it('should not mutate the source definition', () => {
            const source = load('turnstile-fa-compact.json');
            const sourceCopy = JSON.parse(JSON.stringify(source));
            updateCompactFA(source, { remove: ['CPP'] });
            expect(source).toEqual(sourceCopy);
        });
    });

    describe('add', () => {
        it('should add a new FA key that was not in the source', () => {
            const source = load('turnstile-fa-compact.json');
            const update: FaUpdate = {
                add: { 'CCPP': [['I', 'CCRD.sw$', 'C', 'CCRD.c$']] }
            };
            const result = updateCompactFA(source, update);
            expect(Object.keys(result)).toContain('CCPP');
        });

        it('should replace an existing FA key with the new transitions', () => {
            const source = load('turnstile-fa-compact.json');
            const newTs: [string, string, string][] = [['I', 'X.y', 'Z']];
            const update: FaUpdate = { add: { 'TS': newTs } };
            const result = updateCompactFA(source, update);
            expect(result['TS']).toEqual(newTs);
        });
    });

    describe('round-trip: coins → credit card', () => {
        it('should produce the expected cc compact FA', () => {
            const source  = load('turnstile-fa-compact.json');
            const update  = load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate;
            const expected = load('turnstile-fa-compact-cc.json');
            const result  = updateCompactFA(source, update);
            expect(result).toEqual(expected);
        });

        it('result should have TS, PP, BPP, CCPP keys', () => {
            const source = load('turnstile-fa-compact.json');
            const update = load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate;
            const result = updateCompactFA(source, update);
            expect(Object.keys(result)).toEqual(['TS', 'PP', 'BPP', 'CCPP']);
        });

        it('result should not contain CPP', () => {
            const source = load('turnstile-fa-compact.json');
            const update = load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate;
            const result = updateCompactFA(source, update);
            expect(Object.keys(result)).not.toContain('CPP');
        });

        it('TS transitions should use CCRD.sw$ and not CR.cc$', () => {
            const source = load('turnstile-fa-compact.json');
            const update = load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate;
            const result = updateCompactFA(source, update);
            const ts = result['TS'] as [string, string, string][];
            const signals = ts.map(t => t[1]);
            expect(signals).toContain('CCRD.sw$');
            expect(signals).not.toContain('CR.cc$');
        });
    });
});

// ---------------------------------------------------------------------------
// updateFullFA – unit tests
// ---------------------------------------------------------------------------

describe('updateFullFA', () => {

    describe('remove', () => {
        it('should remove the named sub-FA from its parent states', () => {
            const source = load('turnstile-fa.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateFullFA(source, update) as any;
            const ppStates = result['TS']['states']['PP']['states'];
            expect(Object.keys(ppStates)).not.toContain('CPP');
        });

        it('should prune parent ts transitions targeting the removed FA', () => {
            const source = load('turnstile-fa.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateFullFA(source, update) as any;
            const ppTs = result['TS']['states']['PP']['ts'] as [string, string, string][];
            const targets = ppTs.map(t => t[2]);
            expect(targets).not.toContain('CPP');
        });

        it('should keep sibling FAs (BPP) untouched', () => {
            const source = load('turnstile-fa.json');
            const update: FaUpdate = { remove: ['CPP'] };
            const result = updateFullFA(source, update) as any;
            const ppStates = result['TS']['states']['PP']['states'];
            expect(Object.keys(ppStates)).toContain('BPP');
        });

        it('should not mutate the source definition', () => {
            const source = load('turnstile-fa.json');
            const sourceCopy = JSON.parse(JSON.stringify(source));
            updateFullFA(source, { remove: ['CPP'] });
            expect(source).toEqual(sourceCopy);
        });
    });

    describe('add (replace)', () => {
        it('should replace the root FA when its key is in add', () => {
            const source = load('turnstile-fa.json');
            const newTs = { states: {}, signals: {}, commands: {}, ts: [['I', 'X.y', 'Z'] as [string,string,string]] };
            const update: FaUpdate = { add: { 'TS': newTs } };
            const result = updateFullFA(source, update) as any;
            expect(result['TS']['ts']).toEqual([['I', 'X.y', 'Z']]);
        });

        it('should replace a nested FA (PP) in-place', () => {
            const source = load('turnstile-fa.json');
            const newPp = { states: {}, signals: {}, commands: {}, ts: [['I', 'X.y', 'Z'] as [string,string,string]] };
            const update: FaUpdate = { add: { 'PP': newPp } };
            const result = updateFullFA(source, update) as any;
            expect(result['TS']['states']['PP']['ts']).toEqual([['I', 'X.y', 'Z']]);
        });
    });

    describe('round-trip: coins → credit card', () => {
        it('should produce the expected cc extended FA', () => {
            const source   = load('turnstile-fa.json');
            const update   = load('turnstile-to-cc-update-full.json') as unknown as FaUpdate;
            const expected = load('turnstile-fa-cc.json');
            const result   = updateFullFA(source, update);
            expect(result).toEqual(expected);
        });

        it('result root should have TS key', () => {
            const source = load('turnstile-fa.json');
            const update = load('turnstile-to-cc-update-full.json') as unknown as FaUpdate;
            const result = updateFullFA(source, update) as any;
            expect(Object.keys(result)).toContain('TS');
        });

        it('PP states should contain CCPP and not CPP', () => {
            const source = load('turnstile-fa.json');
            const update = load('turnstile-to-cc-update-full.json') as unknown as FaUpdate;
            const result = updateFullFA(source, update) as any;
            const ppStates = result['TS']['states']['PP']['states'];
            expect(Object.keys(ppStates)).toContain('CCPP');
            expect(Object.keys(ppStates)).not.toContain('CPP');
        });

        it('TS transitions should use CCRD.sw$ and not CR.cc$', () => {
            const source = load('turnstile-fa.json');
            const update = load('turnstile-to-cc-update-full.json') as unknown as FaUpdate;
            const result = updateFullFA(source, update) as any;
            const tsTs = result['TS']['ts'] as [string, string, string][];
            const signals = tsTs.map(t => t[1]);
            expect(signals).toContain('CCRD.sw$');
            expect(signals).not.toContain('CR.cc$');
        });
    });
});
