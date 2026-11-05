extends RefCounted

## Stores a nonvisual counter for the current run.
var value: int = 0

## Adds one to the counter.
func increment() -> void:
    value += 1

## Returns the counter to its starting value.
func reset() -> void:
    value = 0
