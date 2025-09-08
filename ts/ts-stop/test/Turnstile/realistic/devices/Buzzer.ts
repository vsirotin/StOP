/**
 * Technical device for audible alerts.
 */
export class Buzzer {

    private buzzCount = 0; 
    /**
     * Produces a short, unpleasant electronic sound.
     */
    buzz(): void {
        this.buzzCount++;
    }

    /**
     * @returns The count of buzzes.
     */
    getBuzzCount(): number {
        return this.buzzCount;
    }

    /**
     * Resets the buzz count to zero.
     */
    reset(): void {
        this.buzzCount = 0;
    }
}