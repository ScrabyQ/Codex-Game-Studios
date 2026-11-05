# $setup-engine — Section 4: Select engine and language

For Godot, establish the primary language: GDScript, C#, or both. For Unreal, establish whether C++ or Blueprint is primary; use C++ only when the user has no preference. Unity uses C#. Ask when the choice is unresolved; use an available question facility or plain text and wait for the required answer.

Record the selected engine, version and language through the project.yaml step within existing authorization. Language determines naming and specialist routing; see references/godot-language-config.md for Godot. GDExtension availability does not make C++ the primary language of a GDScript project.

Read docs/engine-reference/<engine>/VERSION.md on demand. Do not edit CLAUDE.md or assume an @import loads context.
