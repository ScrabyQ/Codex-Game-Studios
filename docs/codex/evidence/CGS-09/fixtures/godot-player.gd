# Synthetic review fixture; do not use as an engine project.
extends Node2D

var health = 100

func _process(delta):
	$HealthLabel.text = str(health)
