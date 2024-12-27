describe('formatWeight', () => {
  it('formats integer weights with thousands separator', () => {
    expect(formatWeight(1000)).toBe('1,000g');
    expect(formatWeight(10000)).toBe('10,000g');
  });

  it('formats small weights without separator', () => {
    expect(formatWeight(5)).toBe('5g');
    expect(formatWeight(999)).toBe('999g');
  });

  it('formats decimal weights', () => {
    expect(formatWeight(1000.5)).toBe('1,000.5g');
  });
});

describe('formatPercentage', () => {
  it('formats integer percentages', () => {
    expect(formatPercentage(75)).toBe('75');
    expect(formatPercentage(100)).toBe('100');
  });
});
