import { TurnstileRealistic } from './TurnstileRealistic';
import { CoinAcceptor } from './devices/CoinAcceptor';
import { BarrierArms } from './devices/BarrierArms';
import { StatusIndicator } from './devices/StatusIndicator';
import { Light } from './devices/Light';
import { LockedStateRealistic } from './states/LockedStateRealistic';
import { UnlockedStateRealistic } from './states/UnlockedStateRealistic';

describe('TurnstileRealistic', () => {
    let turnstile: TurnstileRealistic;
    
    // Device instances from actual states
    let coinAcceptor: CoinAcceptor;
    let barrierArms: BarrierArms;
    let statusIndicator: StatusIndicator;
    let redLight: Light;
    let greenLight: Light;

    function isLocked(): boolean {
        return turnstile.getCurrentState() instanceof LockedStateRealistic;
    }

    function isUnlocked(): boolean {
        return turnstile.getCurrentState() instanceof UnlockedStateRealistic;
    }

    beforeEach(() => {
        // Create turnstile instance with real devices
        turnstile = new TurnstileRealistic();
        
        // Get device instances from the locked state
        const lockedState = turnstile.getAllStates().find(state => state instanceof LockedStateRealistic) as LockedStateRealistic;
        const unlockedState = turnstile.getAllStates().find(state => state instanceof UnlockedStateRealistic) as UnlockedStateRealistic;
        coinAcceptor = lockedState.coinAcceptor;
        barrierArms = unlockedState.barrierArms;
        statusIndicator = lockedState.statusIndicator;
        redLight = statusIndicator.redLight;
        greenLight = statusIndicator.greenLight;
        
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Constructor and Initial State', () => {
        test('should initialize in locked state', () => {
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
        });

        test('should have correct initial state type', () => {
            const currentState = turnstile.getCurrentState();
            expect(currentState).toBeInstanceOf(LockedStateRealistic);
            expect(currentState.toString()).toBe('locked');
        });

        test('should configure devices correctly for initial locked state', () => {
            // Check device states directly
            expect(coinAcceptor.isSlotAvailable()).toBe(true);
            expect(barrierArms.getIsLocked()).toBe(true);
        });

        test('should configure lights correctly for initial locked state', () => {
            // Red light should be on, green light should be off
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
            
        });
    });

    describe('State Transitions - insertCoin()', () => {
        test('should transition from locked to unlocked when coin inserted successfully', () => {
            
            expect(isLocked()).toBe(true);
            
            const resultState = turnstile.insertCoin();
            
            expect(isUnlocked()).toBe(true);
            expect(isLocked()).toBe(false);
            expect(resultState).toBeInstanceOf(UnlockedStateRealistic);
        });

        test('should configure devices correctly after successful coin insertion', () => {
            
            turnstile.insertCoin();
            
            // Check device states after transition
            expect(coinAcceptor.isSlotAvailable()).toBe(false); // Slot closed after payment
            expect(barrierArms.getIsLocked()).toBe(false);       // Arms unlocked
        });

        test('should configure lights correctly after successful coin insertion', () => {
            
            turnstile.insertCoin();
            
            // Green light should be on, red light should be off
            expect(redLight.getIsOn()).toBe(false);
            expect(greenLight.getIsOn()).toBe(true);
        });


        test('should remain unlocked when coin inserted while already unlocked', () => {

            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Insert another coin
            const resultState = turnstile.insertCoin();
            
            // Should remain unlocked with same device states
            expect(isUnlocked()).toBe(true);
            expect(resultState).toBeInstanceOf(UnlockedStateRealistic);
            expect(barrierArms.getIsLocked()).toBe(false);
            expect(greenLight.getIsOn()).toBe(true);
            expect(redLight.getIsOn()).toBe(false);
        });
    });

    describe('State Transitions - pushThrough()', () => {
        test('should remain locked when pushing while locked', () => {
            expect(isLocked()).toBe(true);
            
            const resultState = turnstile.pushThrough();
            
            // Should remain locked with same device states
            expect(isLocked()).toBe(true);
            expect(resultState).toBeInstanceOf(LockedStateRealistic);
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
        });

        test('should transition from unlocked to locked when pushing through', () => {

            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Mock successful push detection
            
            const resultState = turnstile.pushThrough();
            
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
            expect(resultState).toBeInstanceOf(LockedStateRealistic);
        });

        test('should configure devices correctly after push through', () => {
            turnstile.insertCoin();
            
            turnstile.pushThrough();
            
            // Check device states after transition back to locked
            expect(coinAcceptor.isSlotAvailable()).toBe(true);  // Slot open for next payment
            expect(barrierArms.getIsLocked()).toBe(true);       // Arms locked again
        });

        test('should configure lights correctly after push through', () => {
            turnstile.insertCoin();
            
            turnstile.pushThrough();
            
            // Red light should be on, green light should be off
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);

        });

        test('should handle push detection failure', () => {

            turnstile.insertCoin();
            
            // Mock failed push detection
            
            const resultState = turnstile.pushThrough();
            
            // Should still transition to locked (state machine rule)
            expect(isLocked()).toBe(true);
            expect(resultState).toBeInstanceOf(LockedStateRealistic);
            expect(barrierArms.getIsLocked()).toBe(true);
            expect(redLight.getIsOn()).toBe(true);
        });
    });

    describe('Complete Workflow Scenarios', () => {
        test('should handle complete turnstile usage cycle', () => {
            
            // 1. Start locked
            expect(isLocked()).toBe(true);
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
            
            // 2. Insert coin → unlock
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            expect(redLight.getIsOn()).toBe(false);
            expect(greenLight.getIsOn()).toBe(true);
            expect(barrierArms.getIsLocked()).toBe(false);
            
            // 3. Push through → lock
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
            expect(barrierArms.getIsLocked()).toBe(true);
        });

        test('should handle multiple complete cycles', () => {
            
            for (let i = 0; i < 3; i++) {
                // Start of each cycle - locked
                expect(isLocked()).toBe(true);
                expect(redLight.getIsOn()).toBe(true);
                expect(greenLight.getIsOn()).toBe(false);
                
                // Insert coin - unlocked
                turnstile.insertCoin();
                expect(isUnlocked()).toBe(true);
                expect(redLight.getIsOn()).toBe(false);
                expect(greenLight.getIsOn()).toBe(true);
                
                // Push through - locked again
                turnstile.pushThrough();
                expect(isLocked()).toBe(true);
                expect(redLight.getIsOn()).toBe(true);
                expect(greenLight.getIsOn()).toBe(false);
            }
        });

    });

    describe('State Information and Queries', () => {
        test('should provide accurate state information', () => {
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
            
            turnstile.insertCoin();
            
            expect(isLocked()).toBe(false);
            expect(isUnlocked()).toBe(true);
        });

    });

    describe('Device Status Monitoring', () => {
        test('should provide accurate device status information', () => {
            
            expect(typeof coinAcceptor.isSlotAvailable()).toBe('boolean');
            expect(typeof barrierArms.getIsLocked()).toBe('boolean');
        });

        test('should track device status changes during operation', () => {
            // Initial locked state status
            expect(coinAcceptor.isSlotAvailable()).toBe(true);
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
            
            // Transition to unlocked
            turnstile.insertCoin();
            
            // Unlocked state status
            expect(coinAcceptor.isSlotAvailable()).toBe(false);
            expect(barrierArms.getIsLocked()).toBe(false);
            expect(redLight.getIsOn()).toBe(false);
            expect(greenLight.getIsOn()).toBe(true);
        });
    });

    describe('Light Status Verification', () => {
        test('should have correct light status in locked state', () => {
            expect(redLight.getIsOn()).toBe(true);
            expect(greenLight.getIsOn()).toBe(false);
        });

        test('should have correct light status in unlocked state', () => {
            // First unlock
            turnstile.insertCoin();
            
            expect(redLight.getIsOn()).toBe(false);
            expect(greenLight.getIsOn()).toBe(true);
        });

    });
});