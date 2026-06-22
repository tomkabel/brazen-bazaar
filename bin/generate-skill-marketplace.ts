#!/usr/bin/env npx tsx
/**
 * Generate marketplace.yaml from skill SKILL.md frontmatter.
 *
 * Usage: npx tsx bin/generate-skill-marketplace.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { Document, Scalar } from "yaml";
import { loadMarketplaceConfig } from "./marketplace-config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const skillsDir = path.join(__dirname, "..", "skills");

const marketplaceConfig = loadMarketplaceConfig(rootDir);
const GITHUB_BASE_URL = `${marketplaceConfig.githubBaseUrl}/skills`;
const RAW_BASE_URL = `${marketplaceConfig.rawBaseUrl}/skills`;
const CONTENT_BASE_URL = marketplaceConfig.skillsContentBaseUrl;

// Create a folded block scalar with strip chomping (>-)
function foldedScalar(value: string): Scalar {
  const scalar = new Scalar(value);
  scalar.type = Scalar.BLOCK_FOLDED;
  scalar.blockChomping = "strip";
  return scalar;
}

const items = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))
  .map((dir) => {
    const { data } = matter(
      fs.readFileSync(path.join(skillsDir, dir.name, "SKILL.md"), "utf-8"),
    );
    console.log(`Added: ${data.name}`);
    return {
      id: dir.name,
      description: foldedScalar(data.description),
      category: data.metadata?.category || undefined,
      license: data.license || undefined,
      compatibility: data.compatibility || undefined,
      githubUrl: `${GITHUB_BASE_URL}/${dir.name}`,
      rawUrl: `${RAW_BASE_URL}/${dir.name}/SKILL.md`,
      content: `${CONTENT_BASE_URL}/${dir.name}.tar.gz`,
      checksum: `${CONTENT_BASE_URL}/${dir.name}.tar.gz.sha256`,
      source: data.metadata?.source || undefined,
    };
  })
  .sort((a, b) => {
    const catCmp = (a.category || "zzz").localeCompare(b.category || "zzz");
    return catCmp !== 0 ? catCmp : a.id.localeCompare(b.id);
  });

const doc = new Document({ items });
const output = doc.toString({ lineWidth: 120 });

fs.writeFileSync(path.join(skillsDir, "marketplace.yaml"), output);

console.log(`\nGenerated marketplace.yaml with ${items.length} skills`);
