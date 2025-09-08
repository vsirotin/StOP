/**
 * Simple light device that can be turned on or off.
 */
export class Light {
    private isOn: boolean = false;

    /**
     * Turns the light on.
     */
    turnOn(): void {
        this.isOn = true;
    }

    /**
     * Turns the light off.
     */
    turnOff(): void {
        this.isOn = false;
    }

    /**
     * Gets the current light state.
     */
    getIsOn(): boolean {
        return this.isOn;
    }
}