// Deliberately faulty synthetic input. QA must not fix it.
export function damage(health, amount) { return Math.max(0, health - amount); }
