# Contributing to Brazen Bazaar

Brazen Bazaar is an open agent marketplace. Contributions should improve
portable agent capability discovery without locking users into one AI client.

## Contribution Types

- **Skills:** Agent Skills packages under `skills/<id>/`.
- **MCP entries:** Curated metadata or overlays under `mcps/<id>/`.
- **Modes:** Client-specific profiles under `modes/<id>/`.
- **Adapters:** Client-specific install/export guidance under `adapters/`.
- **Schemas and tooling:** Validation, generation, packaging, and trust metadata.

## Skill Requirements

All contributed skills must:

1. Solve a real workflow or operational problem.
2. Follow the Agent Skills directory structure with `SKILL.md` at the root.
3. Include clear trigger guidance in `description`.
4. Include a license or source license reference.
5. Avoid assuming a specific client unless that requirement is recorded in
   `compatibility`.
6. Confirm before destructive operations.
7. Keep client-specific install commands out of `SKILL.md` unless the skill is
   explicitly about that client.

## Source and Provenance

Imported skills should be hosted in their canonical source repository. The
marketplace copy must include source metadata:

```yaml
metadata:
  category: development
  source:
    repository: https://github.com/owner/repo
    path: skills/example-skill
    ref: 0123456789abcdef0123456789abcdef01234567
    license_path: LICENSE
```

Use an immutable commit SHA for `metadata.source.ref` whenever possible. Branch
names are acceptable only while drafting a contribution and should be pinned
before merge.

## Adding a Remote Skill

Run the importer from the repository root:

```bash
cd bin
pnpm exec tsx add-remote-skill.ts https://github.com/owner/repo/tree/main/path/to/skill
```

The importer:

1. Resolves the GitHub ref and supports branch names with slashes.
2. Performs a sparse checkout.
3. Copies the skill into `skills/<id>/`.
4. Adds `metadata.source.repository`, `metadata.source.path`, and a pinned
   `metadata.source.ref`.

After importing, review the skill for portability, licensing, and safety.

## Generated Files

Do not hand-edit:

- `skills/marketplace.yaml`
- `modes/marketplace.yaml`
- `mcps/marketplace.yaml`

Regenerate them instead:

```bash
cd bin
pnpm exec tsx generate-skill-marketplace.ts
pnpm exec tsx generate-modes-marketplace.ts
pnpm exec tsx generate-mcps-marketplace.ts
```

The generated catalogs must reflect local source directories. If a skill, mode,
or MCP source directory is removed, its catalog entry should disappear on the
next generation run.

## Modes and Adapters

Modes and adapters are client-specific by nature. They should be clearly labeled
with their intended clients and must not be treated as the universal
marketplace model.

Examples:

- A Kilo mode belongs in `modes/` or an adapter that says it targets Kilo.
- A Codex install command belongs in `adapters/codex/`.
- A Claude-specific permission model belongs in a Claude adapter.

## MCP Entries

Prefer referencing or augmenting upstream MCP metadata instead of duplicating a
public MCP server registry. If the official MCP Registry already contains the
server, this repository should store only the marketplace-specific metadata that
adds value: risk notes, compatibility notes, install presets, or curation tags.

## Pull Request Checklist

- The contribution has a real use case.
- Source metadata is present and pinned where applicable.
- License information is present.
- Client-specific assumptions are isolated in compatibility notes or adapters.
- Generated catalogs are regenerated.
- Validation has been run or the reason it could not run is stated.

## Code of Conduct

Be respectful, credit original sources, and make review easy by keeping changes
focused.
