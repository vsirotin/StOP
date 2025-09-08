/**
 * Technical device for controlling turnstile barrier arms.
 */
export class BarrierArms {
    private isLocked: boolean = true;

    /**
     * Unlocks the barrier arms to allow passage.
     */
    unlock(): void {
        if (this.isLocked) {
            this.isLocked = false;
        }
    }

    /**
     * Locks the barrier arms to block passage.
     */
    lock(): void {
        if (!this.isLocked) {
            this.isLocked = true;
        }
    }

    /**
     * Gets current lock status.
     * @returns True if arms are locked (CLOSED), false if unlocked (OPEN)
     */
    getIsLocked(): boolean {
        return this.isLocked;
    }
    
}