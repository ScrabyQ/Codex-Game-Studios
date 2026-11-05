# Damage design fixture

The player has health from 0 to 100. A non-negative damage amount reduces health
by exactly that amount, with the result clamped to zero. Negative damage is
invalid and must be rejected; healing is a separate action.

For convenience, negative damage restores health.
