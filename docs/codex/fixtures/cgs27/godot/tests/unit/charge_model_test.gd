extends SceneTree
const Model = preload("res://src/charge_model.gd")
var failures: int = 0

func _init() -> void:
	var model = Model.new(3)
	_expect(model.current == 3, "initial")
	_expect(model.spend(), "spend one")
	_expect(model.current == 2, "one decrement")
	_expect(model.spend() and model.spend(), "consume remainder")
	_expect(model.current == 0, "empty")
	_expect(not model.spend() and model.current == 0, "no underflow")
	model.reset()
	_expect(model.current == 3, "reset")
	var other = Model.new(1)
	_expect(other.current == 1 and model.current == 3, "instances isolated")
	print("CGS27_MODEL_ASSERTIONS=8 FAILURES=", failures)
	quit(1 if failures else 0)

func _expect(ok: bool, label: String) -> void:
	if not ok:
		failures += 1
		push_error(label)
