describe('validateSaltPercentage', () => {
  // Valid cases
  it('should return true for minimum valid salt percentage (1.5%)', () => {
    expect(validateSaltPercentage(1.5)).toBe(true);
  });

  it('should return true for maximum valid salt percentage (3%)', () => {
    expect(validateSaltPercentage(3)).toBe(true);
  });

  it('should return true for salt percentage in valid range (2.25%)', () => {
    expect(validateSaltPercentage(2.25)).toBe(true);
  });

  // Invalid cases
  it('should return false for salt percentage below minimum', () => {
    expect(validateSaltPercentage(1.4)).toBe(false);
  });

  it('should return false for salt percentage above maximum', () => {
    expect(validateSaltPercentage(3.1)).toBe(false);
  });
});
