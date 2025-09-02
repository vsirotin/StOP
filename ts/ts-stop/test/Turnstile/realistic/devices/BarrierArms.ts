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
            console.log("🔓 Barrier Arms: Unlocking mechanism - Arms rotating to OPEN position");
            this.isLocked = false;
        }
    }

    /**
     * Locks the barrier arms to block passage.
     */
    lock(): void {
        if (!this.isLocked) {
            console.log("🔒 Barrier Arms: Locking mechanism - Arms rotating to CLOSED position");
              this.isLocked = true;
        }
    }

    /**
     * Gets current lock status.
     */
    getIsLocked(): boolean {
        return this.isLocked;
    }
    
}