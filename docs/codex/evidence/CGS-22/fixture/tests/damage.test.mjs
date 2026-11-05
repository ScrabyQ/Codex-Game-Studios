import assert from 'node:assert/strict';
import {damage} from '../src/damage.mjs';
assert.equal(damage(10,3),7);
assert.equal(damage(10,20),0);
assert.equal(damage(10,-5),10,'negative damage must not increase health');
