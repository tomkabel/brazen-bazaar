<h1 align="center">Brazen Bazaar</h1>

Brazen Bazaar is a vendor-neutral registry for reusable agent capabilities.
It indexes open Agent Skills and leaves room for client-specific adapters
without making any one AI tool the canonical target.

## What This Repository Publishes

| Area | Purpose | Source of truth |
| --- | --- | --- |
| Skills | Portable task packages that follow the Agent Skills format | `skills/<id>/SKILL.md` |
| MCP entries | Curated or augmented MCP server metadata | `mcps/<id>/MCP.yaml` |
| Modes | Client-specific mode/profile definitions | `modes/<id>/MODE.yaml` |
| Adapters | Installation/export guidance for specific clients | `adapters/` |

Generated files such as `skills/marketplace.yaml`, `mcps/marketplace.yaml`, and
`modes/marketplace.yaml` are derived artifacts. Do not edit them by hand.

## Design Principles

- **No vendor lock-in:** Canonical marketplace data must not require Kilo,
  Claude, Codex, Gemini, Cursor, or any other specific client.
- **Open formats first:** Skills follow the Agent Skills directory format:
  a folder with `SKILL.md` plus optional `scripts/`, `references/`, `assets/`,
  and examples.
- **Provenance is required:** Imported skills should record
  `metadata.source.repository`, `metadata.source.path`, and an immutable
  `metadata.source.ref` commit SHA whenever possible.
- **Adapters are downstream:** Client-specific install commands, permissions,
  modes, or runtime assumptions belong in adapters or compatibility notes, not
  in the canonical skill record.
- **Generated catalogs reflect local source:** If a source directory is removed,
  the next generation run should remove it from the catalog.

## Skills

A skill is a directory containing a `SKILL.md` file with YAML frontmatter and
Markdown instructions. Minimal example:

```markdown
---
name: shell-scripting
description: Write and review robust shell scripts. Use when working with bash or zsh automation.
license: MIT
metadata:
  category: development
  source:
    repository: https://github.com/example/skills
    path: skills/shell-scripting
    ref: 0123456789abcdef0123456789abcdef01234567
---

# Shell Scripting

Instructions for the agent go here.
```

## Generated Catalogs

Install generator dependencies:

```bash
cd bin
pnpm install
```

Regenerate all catalogs:

```bash
cd bin
pnpm exec tsx generate-skill-marketplace.ts
pnpm exec tsx generate-modes-marketplace.ts
pnpm exec tsx generate-mcps-marketplace.ts
```

Skill catalog URLs are configured by `marketplace.config.json` and can be
overridden in CI with:

- `MARKETPLACE_REPOSITORY`
- `MARKETPLACE_BRANCH`
- `MARKETPLACE_SKILLS_RELEASE_TAG`
- `MARKETPLACE_GITHUB_BASE_URL`
- `MARKETPLACE_RAW_BASE_URL`
- `MARKETPLACE_SKILLS_CONTENT_BASE_URL`

## Adding Remote Skills

Use the importer for GitHub-hosted skills:

```bash
cd bin
pnpm exec tsx add-remote-skill.ts https://github.com/owner/repo/tree/main/path/to/skill
```

The importer copies the skill, adds source metadata, and pins the fetched commit
SHA in `metadata.source.ref`.

## MCP Entries

Brazen Bazaar should not compete with the official MCP Registry as the source of
truth for public MCP server discovery. MCP entries here should either be local
curation, compatibility notes, or marketplace-specific overlays that can be
traced back to upstream server metadata.

## License

This repository is licensed under Apache-2.0. See `NOTICE` for attribution.
