import { describe, it, expect } from 'vitest';
import { formatFloursForUrl, parseFloursFromUrl } from './urlParams';
import { FLOUR_TYPES } from '../types/recipe';

// src/utils/urlParams.test.js

describe('formatFloursForUrl', () => {
    it('should format a single flour correctly', () => {
        const input = [{
            type: FLOUR_TYPES.BF,
            percentage: 100
        }];
        expect(formatFloursForUrl(input)).toBe('BF:100');
    });

    it('should format multiple flours correctly', () => {
        const input = [
            { type: FLOUR_TYPES.BF, percentage: 70 },
            { type: FLOUR_TYPES.WW, percentage: 30 }
        ];
        expect(formatFloursForUrl(input)).toBe('BF:70,WW:30');
    });

    it('should handle empty flour array', () => {
        expect(formatFloursForUrl([])).toBe('');
    });

    it('should handle decimal percentages', () => {
        const input = [{
            type: FLOUR_TYPES.BF,
            percentage: 33.3
        }];
        expect(formatFloursForUrl(input)).toBe('BF:33.3');
    });
});

describe('parseFloursFromUrl', () => {
    it('should parse a single flour correctly', () => {
        const input = 'BF:100';
        expect(parseFloursFromUrl(input)).toEqual([{
            type: FLOUR_TYPES.BF,
            percentage: 100
        }]);
    });

    it('should parse multiple flours correctly', () => {
        const input = 'BF:70,WW:30';
        expect(parseFloursFromUrl(input)).toEqual([
            { type: FLOUR_TYPES.BF, percentage: 70 },
            { type: FLOUR_TYPES.WW, percentage: 30 }
        ]);
    });

    it('should convert percentage strings to numbers', () => {
        const input = 'BF:33.3';
        const result = parseFloursFromUrl(input);
        expect(typeof result[0].percentage).toBe('number');
        expect(result[0].percentage).toBe(33.3);
    });

    it('should map flour type keys to correct constants', () => {
        const input = 'WW:100';
        expect(parseFloursFromUrl(input)[0].type).toBe(FLOUR_TYPES.WW);
    });

    it('should handle empty string input', () => {
        expect(parseFloursFromUrl('')).toEqual([]);
    });
});