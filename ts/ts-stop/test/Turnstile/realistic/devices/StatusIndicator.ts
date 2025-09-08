import { Light } from './Light';

/**
 * Technical device for status indication using independent red and green lights.
 */
export class StatusIndicator {
    public readonly redLight: Light = new Light();
    public readonly greenLight: Light = new Light();

    constructor() {
        // Initialize with red light on (default locked state)
        this.showRed();
    }

    /**
     * Turns on red light and turns off green light.
     */
    showRed(): void {
        this.greenLight.turnOff();
        this.redLight.turnOn();
    }

    /**
     * Turns on green light and turns off red light.
     */
    showGreen(): void {
        this.redLight.turnOff();
        this.greenLight.turnOn();
    }

}