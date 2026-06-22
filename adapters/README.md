# Client Adapters

Adapters are the place for client-specific install and export behavior.

The canonical marketplace data should stay portable. If an entry needs special
handling for a specific client, document or generate that behavior here instead
of baking it into `SKILL.md` or the top-level marketplace schema.

Examples:

- `adapters/codex/` for Codex install/export behavior.
- `adapters/claude/` for Claude-specific import behavior.
- `adapters/kilo/` for Kilo mode or settings exports.
- `adapters/gemini/` for Gemini CLI conventions.

An adapter may read the canonical catalog and produce client-specific output,
but the canonical catalog should not depend on the adapter.
