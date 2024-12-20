import { describe, it, expect } from 'vitest';
import { calculateRecipeFromTotalWeight } from './calculations';

describe('calculateRecipeFromTotalWeight', () => {
    it('calculates recipe correctly for 1000g total weight with 75% hydration and 2% salt', () => {
        const result = calculateRecipeFromTotalWeight({
            totalWeight: 1000,
            hydration: 75,
            salt: 2
        });

        expect(result).toEqual({
            flour: 508,
            water: 381,
            levain: 102,
            salt: 10,
            saltPercentage: 2,
            hydration: 75,
            total: 1000
        });
    });

    it('handles string inputs correctly', () => {
        const result = calculateRecipeFromTotalWeight({
            totalWeight: "1000",
            hydration: "75",
            salt: "2"
        });

        expect(result).toEqual({
            flour: 508,
            water: 381,
            levain: 102,
            salt: 10,
            saltPercentage: 2,
            hydration: 75,
            total: 1000
        });
    });

    it('calculates recipe correctly for different hydration levels', () => {
        const result = calculateRecipeFromTotalWeight({
            totalWeight: 1000,
            hydration: 65,
            salt: 2
        });

        expect(result).toEqual({
            flour: 535,
            water: 348,
            levain: 107,
            salt: 11,
            saltPercentage: 2,
            hydration: 65,
            total: 1000
        });
    });
});