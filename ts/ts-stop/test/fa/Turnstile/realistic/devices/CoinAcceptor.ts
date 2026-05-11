/**
 * Technical device for coin reception and validation.
 */
export class CoinAcceptor {
    private isSlotOpen: boolean = true;
     private lastCoinValue: number = 0;

    insertCoin(value: number): void {
        this.lastCoinValue = value;
    }

    getInsertedCoinValue(): number {
        return this.lastCoinValue;
    }

    /**
     * Opens the coin slot for receiving payments.
     */
    openSlot(): void {
        this.isSlotOpen = true;
    }

    /**
     * Closes the coin slot to prevent additional payments.
     */
    closeSlot(): void {
        this.isSlotOpen = false;
    }


    /**
     * Checks if slot is currently open.
     */
    isSlotAvailable(): boolean {
        return this.isSlotOpen;
    }
}


