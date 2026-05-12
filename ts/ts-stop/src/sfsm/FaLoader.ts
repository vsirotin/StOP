import * as fs from 'fs';
import { FaDefinition } from './types';

/**
 * Reads and parses a JSON file at the given path and returns it as a FaDefinition.
 * Works with both extended and compact formats.
 *
 * Node.js only — uses `fs.readFileSync` and is not available in browser environments.
 *
 * @param filePath - Absolute or relative path to a JSON file containing an FA definition.
 * @returns Parsed FaDefinition ready to pass to `Sfsm.loadFA()`.
 * @throws If the file cannot be read or the contents are not valid JSON.
 */
export function loadFAFromFile(filePath: string): FaDefinition {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as FaDefinition;
}

/**
 * Fetches and parses a JSON FA definition from a URL.
 * Works in both browser and Node.js (≥ 18) environments — uses the standard `fetch` API.
 *
 * @param url - Absolute URL to a JSON file containing an FA definition.
 * @returns Promise resolving to a FaDefinition ready to pass to `Sfsm.loadFA()`.
 * @throws If the request fails, the server returns a non-2xx status, or the body is not valid JSON.
 */
export async function loadFAFromURL(url: string): Promise<FaDefinition> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`loadFAFromURL: request failed with status ${response.status} ${response.statusText} for URL: ${url}`);
    }
    return response.json() as Promise<FaDefinition>;
}
