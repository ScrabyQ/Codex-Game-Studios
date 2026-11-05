import fs from 'node:fs';
import path from 'node:path';
import {put,fixtures,evidence} from './io.mjs';
const root=path.join(fixtures,'godot'),f=(p,c)=>put(path.join(root,p),c);
const red=JSON.parse(fs.readFileSync(path.join(evidence,'godot-test-red.json'),'utf8'));
if(red.status==='PASS')throw Error('Expected missing-implementation red test before writing');
const progressPath=path.join(root,'production/epics/beacon/story-001-charge-hud.md');
put(progressPath,fs.readFileSync(progressPath,'utf8').replace('**Status**: Ready','**Status**: In Progress'));
f('docs/project/ui-contract.md','# Bounded UX/layout contract\nAuthored in-session as fixture design before implementation; not independent design approval. One 800x480 dark slate surface; centered 560x330 panel. Vertical reading order: title, subtitle, charge count, status, Spend Charge and Reset side-by-side, input hint. Body text at least18px, count52px, buttons46px high. Ready cyan; empty amber, always paired with words. No animation/audio. Native button focus and default ui_accept support keyboard/gamepad; physical device and accessibility usability are not tested here.\n');
f('assets/data/charge.json',{initial_charges:3});
f('localization/en.json',{title:'CHARGE BEACON',subtitle:'A small signal. A clear state.',charge_format:'%d / %d',ready:'Ready to send',empty:'Out of charges',spend:'Spend charge',reset:'Reset',hint:'Select a button to send or restore the signal.'});
f('prototypes/.gdignore','');
f('src/charge_model.gd',`class_name ChargeModel
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
`);
f('src/charge_beacon.gd',`extends Control
## Charge Beacon view. Gameplay state belongs to ChargeModel.
const Model = preload("res://src/charge_model.gd")
const EVIDENCE_DIR: String = "res://production/qa/evidence/story-001-charge-hud"
var _model: ChargeModel
var _copy: Dictionary
var _count: Label
var _status: Label
var _spend: Button
var _reset: Button

func _ready() -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/data/charge.json"))
	_copy = JSON.parse_string(FileAccess.get_file_as_string("res://localization/en.json"))
	_model = Model.new(int(data["initial_charges"]))
	_build_view()
	_refresh()
	if "--cgs-e2e" in OS.get_cmdline_user_args():
		call_deferred("_exercise")

func _build_view() -> void:
	var background := ColorRect.new()
	background.color = Color("#101c29")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(560, 330)
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#1b2e40")
	style.corner_radius_top_left = 18
	style.corner_radius_top_right = 18
	style.corner_radius_bottom_left = 18
	style.corner_radius_bottom_right = 18
	style.content_margin_left = 32
	style.content_margin_right = 32
	style.content_margin_top = 24
	style.content_margin_bottom = 24
	panel.add_theme_stylebox_override("panel", style)
	center.add_child(panel)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 12)
	panel.add_child(column)
	_label(column, str(_copy["title"]), 24, Color("#e7f1fa"))
	_label(column, str(_copy["subtitle"]), 18, Color("#b5c8da"))
	_count = _label(column, "", 52, Color("#7dd3fc"))
	_status = _label(column, "", 20, Color.WHITE)
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 16)
	column.add_child(row)
	_spend = _button(row, str(_copy["spend"]))
	_reset = _button(row, str(_copy["reset"]))
	_spend.pressed.connect(_on_spend_pressed)
	_reset.pressed.connect(_on_reset_pressed)
	_label(column, str(_copy["hint"]), 18, Color("#b5c8da"))
	_spend.grab_focus()

func _label(parent: Node, text: String, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)
	return label

func _button(parent: Node, text: String) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(190, 46)
	button.add_theme_font_size_override("font_size", 20)
	parent.add_child(button)
	return button

func _refresh() -> void:
	_count.text = str(_copy["charge_format"]) % [_model.current, _model.capacity]
	_status.text = str(_copy["ready"] if _model.current > 0 else _copy["empty"])
	_status.modulate = Color("#a7f3d0") if _model.current > 0 else Color("#fbbf24")
	_spend.disabled = _model.current == 0

func _on_spend_pressed() -> void:
	_model.spend()
	_refresh()

func _on_reset_pressed() -> void:
	_model.reset()
	_refresh()

# Opt-in QA harness: real rendered frames, synthetic engine events, no human-playtest claim.
func _exercise() -> void:
	if DisplayServer.get_name() == "headless":
		push_error("CGS27 render requires a real display driver")
		get_tree().quit(1)
		return
	print("CGS27_DISPLAY=", DisplayServer.get_name())
	for frame in range(60):
		await RenderingServer.frame_post_draw
	await _capture("01-ready.png")
	for activation in range(3):
		await _click(_spend)
	if not _verify(_model.current == 0 and _spend.disabled and _count.text == "0 / 3", "empty UI after three engine-event clicks"):
		return
	await _capture("02-empty.png")
	await _click(_spend)
	if not _verify(_model.current == 0, "disabled click cannot underflow"):
		return
	await _click(_reset)
	if not _verify(_model.current == 3 and not _spend.disabled and _count.text == "3 / 3", "reset UI"):
		return
	await _capture("03-reset.png")
	print("CGS27_RENDER_INPUT_PASS: initial, empty, disabled, reset; synthetic Input.parse_input_event")
	get_tree().quit(0)

func _click(button: Button) -> void:
	var press := InputEventMouseButton.new()
	press.button_index = MOUSE_BUTTON_LEFT
	press.position = button.get_global_rect().get_center()
	press.global_position = press.position
	press.pressed = true
	Input.parse_input_event(press)
	await get_tree().process_frame
	var release := InputEventMouseButton.new()
	release.button_index = MOUSE_BUTTON_LEFT
	release.position = press.position
	release.global_position = press.position
	release.pressed = false
	Input.parse_input_event(release)
	await get_tree().process_frame

func _capture(filename: String) -> void:
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(EVIDENCE_DIR))
	var result := get_viewport().get_texture().get_image().save_png(EVIDENCE_DIR.path_join(filename))
	if result != OK:
		push_error("CGS27 screenshot save failed: " + str(result))
		get_tree().quit(1)
	print("CGS27_CAPTURE=", filename)

func _verify(ok: bool, label: String) -> bool:
	if not ok:
		push_error("CGS27_UI_FAIL: " + label)
		get_tree().quit(1)
	return ok
`);
f('scenes/charge_beacon.tscn','[gd_scene load_steps=2 format=3]\n\n[ext_resource type="Script" path="res://src/charge_beacon.gd" id="1"]\n\n[node name="ChargeBeacon" type="Control"]\nlayout_mode = 3\nanchors_preset = 15\nanchor_right = 1.0\nanchor_bottom = 1.0\ngrow_horizontal = 2\ngrow_vertical = 2\nscript = ExtResource("1")\n');
const project=fs.readFileSync(path.join(root,'project.godot'),'utf8');f('project.godot',project.replace('; Main scene is set only during story implementation.','run/main_scene="res://scenes/charge_beacon.tscn"'));
const storyPath='production/epics/beacon/story-001-charge-hud.md',story=fs.readFileSync(path.join(root,storyPath),'utf8');f(storyPath,story.replace('**Status**: Ready','**Status**: In Progress').replace('Implementation file set will be recorded before closure; engine code root src/.','- src/charge_model.gd\n- src/charge_beacon.gd\n- tests/unit/charge_model_test.gd (baseline test-first input)\n- scenes/charge_beacon.tscn\n- assets/data/charge.json\n- localization/en.json\n- project.godot\n- prototypes/.gdignore\n- docs/project/ui-contract.md\n- engine-generated .gd.uid companions and QA evidence/checkpoint files'));
f('production/session-state/active.md','**Current task:** $dev-story — production/epics/beacon/story-001-charge-hud.md\n**Status:** In Progress\n**Blocked on:** actual import/parse/test/render observation\n**Next step:** run engine checks; do not close from parse alone\n');
const u=path.join(fixtures,'unreal');
put(path.join(u,'Source/TP_Blank/ChargeModel.h'),`#pragma once
#include "CoreMinimal.h"
/// Pure charge state; capacity supplied by the caller, not a gameplay constant.
struct FChargeModel
{
	int32 Capacity;
	int32 Current;
	explicit FChargeModel(int32 Initial) : Capacity(FMath::Max(0, Initial)), Current(Capacity) {}
	bool Spend() { if (Current == 0) return false; --Current; return true; }
	void Reset() { Current = Capacity; }
};
`);
put(path.join(u,'Source/TP_Blank/ChargeModelTest.cpp'),`#include "ChargeModel.h"
#include "Misc/AutomationTest.h"
#if WITH_DEV_AUTOMATION_TESTS
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FChargeModelTest, "CGS27.ChargeModel.Bounds", EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FChargeModelTest::RunTest(const FString& Parameters)
{
	FChargeModel Model(3);
	TestEqual(TEXT("Initial"), Model.Current, 3);
	TestTrue(TEXT("Spend first"), Model.Spend());
	Model.Spend(); Model.Spend();
	TestEqual(TEXT("Empty"), Model.Current, 0);
	TestFalse(TEXT("No underflow"), Model.Spend());
	Model.Reset();
	TestEqual(TEXT("Reset"), Model.Current, 3);
	return true;
}
#endif
`);
console.log(JSON.stringify({implemented:'godot',unreal:'C++ model/test draft pending real build; no UI/map fabricated',unity:'no implementation because no real editor/project'}));
