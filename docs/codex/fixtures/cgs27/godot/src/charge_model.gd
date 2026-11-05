class_name ChargeModel
extends RefCounted
## Independent charge state; the caller supplies the configured capacity.

var current: int
var capacity: int

func _init(initial_charges: int) -> void:
	capacity = maxi(0, initial_charges)
	current = capacity

## Consume one charge when available and report whether it was consumed.
func spend() -> bool:
	if current == 0:
		return false
	current -= 1
	return true

## Restore the configured capacity.
func reset() -> void:
	current = capacity
