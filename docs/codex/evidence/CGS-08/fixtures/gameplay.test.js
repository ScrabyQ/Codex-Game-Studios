// Synthetic QA fixture: this single case cannot establish the design contract.
import { applyDamage } from './gameplay.js';
if (applyDamage(100, 0) !== 100) throw new Error('zero damage failed');
