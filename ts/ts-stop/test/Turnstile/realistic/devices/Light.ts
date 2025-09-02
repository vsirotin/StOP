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
        console.log(`💡 Light: ON`);
    }

    /**
     * Turns the light off.
     */
    turnOff(): void {
        this.isOn = false;
        console.log(`💡 Light: OFF`);
    }

    /**
     * Gets the current light state.
     */
    getIsOn(): boolean {
        return this.isOn;
    }
}