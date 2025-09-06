/**
 * Technical device for audible alerts.
 */
export class Bell {

    private ringsCount = 0; //Only for demonstration/testing purposes
    /**
     * Rings the bell to signal an alert.
     */
    ring(): void {
        this.ringsCount++;
    }

    /**
     * Returns the number of times the bell has rung.
     * @returns The count of bell rings.
     */
    getRingsCount(): number {
        return this.ringsCount;
    }

    /**
     * Resets the bell ring count to zero.
     */
    resetRingsCount(): void {
        this.ringsCount = 0;
    }
}