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
        console.log("🔴 Status Indicator: RED light ON - Access denied");
    }

    /**
     * Turns on green light and turns off red light.
     */
    showGreen(): void {
        this.redLight.turnOff();
        this.greenLight.turnOn();
        console.log("🟢 Status Indicator: GREEN light ON - Access granted");
    }

    /**
     * Turns off all lights.
     */
    turnOff(): void {
        this.redLight.turnOff();
        this.greenLight.turnOff();
        console.log("⚫ Status Indicator: All lights OFF");
    }

}