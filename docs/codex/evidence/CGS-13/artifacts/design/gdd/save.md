# Save
## Summary
Resume saved health between sessions.
## Detailed Rules
Save must persist current health between sessions with a versioned schema.
## Dependencies
Save reads a snapshot from health; health does not call save.
## Acceptance Criteria
Loading a valid save restores the recorded current health.
