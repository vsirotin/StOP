/**
 * Technical device for coin reception and validation.
 */
export class CoinAcceptor {
    private isSlotOpen: boolean = true;
    private coinsReceived: number = 0;

    /**
     * Opens the coin slot for receiving payments.
     */
    openSlot(): void {
        this.isSlotOpen = true;
        console.log("Slot is opened");
    }

    /**
     * Closes the coin slot to prevent additional payments.
     */
    private closeSlot(): void {
        this.isSlotOpen = false;
        console.log("Slot is closed");
    }


    /**
     * Processes a received coin and validates it.
     * 
     * @returns true if coin is valid and slot is open
     */
    processCoin(): boolean {
        if (!this.isSlotOpen) {
            console.warn("Slot is closed");
            return false;
        }
        
        this.coinsReceived++;
        this.closeSlot();
        console.log(`💰 Coin acceptor: Valid coin received (Total: ${this.coinsReceived})`);
        return true;
    }

    /**
     * Resets the coin counter (maintenance operation).
     */
    reset(): void {
        this.coinsReceived = 0;
        console.log("Coin acceptor: reset done");
    }

        /**
     * Gets the current coin count.
     */
    getCoinCount(): number {
        return this.coinsReceived;
    }

    /**
     * Checks if slot is currently open.
     */
    isSlotAvailable(): boolean {
        return this.isSlotOpen;
    }
}

