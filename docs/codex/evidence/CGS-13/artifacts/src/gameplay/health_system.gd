class_name HealthSystem
extends RefCounted
signal health_changed(value: int)
var max_health: int = 100
var health: int = 100

func take_damage(amount: int) -> void:
    if amount < 0:
        return
    var before: int = health
    health = clampi(health - amount, 0, max_health)
    if health != before:
        health_changed.emit(health)

func heal(amount: int) -> void:
    if amount < 0:
        return
    var before: int = health
    health = clampi(health + amount, 0, max_health)
    if health != before:
        health_changed.emit(health)

func reset_health() -> void:
    var before: int = health
    health = max_health
    if health != before:
        health_changed.emit(health)

func is_alive() -> bool:
    return health > 0

func snapshot() -> Dictionary:
    return {"health": health, "max_health": max_health}

func restore_snapshot(data: Dictionary) -> void:
    if not data.has("health"):
        return
    var before: int = health
    health = clampi(int(data["health"]), 0, max_health)
    if health != before:
        health_changed.emit(health)
