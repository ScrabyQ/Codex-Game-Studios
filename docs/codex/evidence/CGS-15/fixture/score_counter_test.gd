extends SceneTree

const CounterScript = preload("res://src/score_counter.gd")

func _initialize() -> void:
    var counter = CounterScript.new()
    if counter.value != 0:
        push_error("new counter must be zero")
        quit(1)
        return
    counter.increment()
    if counter.value != 1:
        push_error("first increment must produce one")
        quit(1)
        return
    counter.increment()
    if counter.value != 2:
        push_error("subsequent increments must accumulate")
        quit(1)
        return
    counter.reset()
    if counter.value != 0:
        push_error("reset must return to zero")
        quit(1)
        return
    print("PASS: initial, increment, repeated increment and reset")
    quit(0)
