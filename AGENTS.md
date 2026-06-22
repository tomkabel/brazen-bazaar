# Repository Instructions

Brazen Bazaar is a vendor-neutral marketplace for agent capabilities. Keep the
canonical registry data portable; put client-specific behavior in adapters,
compatibility notes, modes, or downstream generated output.

## Skill Directory Structure

Every skill consists of a required `SKILL.md` file and optional bundled
resources:

```text
skill-name/
├── SKILL.md
├── LICENSE
├── scripts/
├── references/
├── assets/
└── examples/
```

## SKILL.md Frontmatter

Every `SKILL.md` file must begin with YAML frontmatter:

```yaml
---
name: skill-name
description: A clear description of what the skill does and when it should be used.
license: MIT
compatibility: Optional environment or client requirements.
metadata:
  category: development
  author: author-name
  source:
    repository: https://github.com/org/repo
    path: path/to/skill/in/repo
    ref: 0123456789abcdef0123456789abcdef01234567
    license_path: LICENSE
---
```

Required fields:

| Field | Required | Notes |
| --- | --- | --- |
| `name` | Yes | Kebab-case and should match the directory name. |
| `description` | Yes | Describe what the skill does and when to use it. |
| `license` or `metadata.source.license_path` | Yes | Prefer SPDX identifiers for direct licenses. |
| `metadata.source.repository` | Imported skills | Canonical source repository. |
| `metadata.source.path` | Imported skills | Path to the skill directory in the source repo. |
| `metadata.source.ref` | Imported skills | Prefer an immutable commit SHA. |

## Adding Remote Skills

When asked to add a skill from GitHub, use:

```bash
cd bin
pnpm exec tsx add-remote-skill.ts <github-url-to-skill>
```

Then inspect the result for:

- Portability across clients.
- Clear license/source metadata.
- A pinned `metadata.source.ref`.
- No unnecessary client-specific install instructions in `SKILL.md`.

## Generated Catalogs

Use the generator scripts rather than editing marketplace YAML by hand:

```bash
cd bin
pnpm exec tsx generate-skill-marketplace.ts
pnpm exec tsx generate-modes-marketplace.ts
pnpm exec tsx generate-mcps-marketplace.ts
```

Catalog URL generation is configured in `marketplace.config.json`.
