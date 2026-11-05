/** Synthetic guard contract: owns health; maxHealth comes from fixture config. */
export function createHealth({maxHealth}) {
  if (!Number.isFinite(maxHealth) || maxHealth <= 0) throw new RangeError('maxHealth');
  let health = maxHealth;
  return Object.freeze({
    /** Return an immutable value snapshot; no writable state crosses into UI. */
    snapshot() { return Object.freeze({health, maxHealth}); },
    /** Apply finite nonnegative damage, clamped at zero; invalid input is atomic. */
    damage(amount) {
      if (!Number.isFinite(amount) || amount < 0) throw new RangeError('damage');
      health = Math.max(0, health - amount);
    }
  });
}
