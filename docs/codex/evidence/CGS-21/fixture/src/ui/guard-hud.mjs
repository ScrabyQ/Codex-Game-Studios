/** Project immutable health into display data through a localization boundary. */
export function projectHealth(snapshot, translate) {
  return Object.freeze({
    label: translate('hud.health', {current:snapshot.health, maximum:snapshot.maxHealth}),
    ratio: snapshot.health / snapshot.maxHealth
  });
}

/** Emit an input intent only. The gameplay layer owns its effect on game state. */
export function requestGuard(inputSource, emit) {
  if (!['keyboard','gamepad'].includes(inputSource)) throw new RangeError('inputSource');
  emit(Object.freeze({type:'guard-requested', inputSource}));
}
