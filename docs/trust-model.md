# Trust Model

Brazen Bazaar is an index, not a trustless package manager. Registry entries
should make review easier by exposing provenance and risk metadata.

## Required Signals

- Source repository URL.
- Source path.
- Immutable source ref when imported from Git.
- License or source license path.
- Generated catalog URL.
- Checksum URL for packaged artifacts.

## Recommended Signals

- Last reviewed commit.
- Maintainer identity.
- Compatibility notes.
- Security or destructive-operation notes.
- Evaluation files or test fixtures when available.

## Client Boundary

Client-specific permissions, install commands, and runtime behavior should be
stored in adapters or compatibility notes. They are not universal trust signals.
