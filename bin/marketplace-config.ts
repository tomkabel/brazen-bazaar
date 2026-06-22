import * as fs from "fs";
import * as path from "path";

type RawMarketplaceConfig = {
  name?: string;
  repository?: string;
  branch?: string;
  skillsReleaseTag?: string;
  githubBaseUrl?: string;
  rawBaseUrl?: string;
  skillsContentBaseUrl?: string;
};

export type MarketplaceConfig = {
  name: string;
  repository: string;
  branch: string;
  skillsReleaseTag: string;
  githubBaseUrl: string;
  rawBaseUrl: string;
  skillsContentBaseUrl: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function readConfig(rootDir: string): RawMarketplaceConfig {
  const configPath =
    process.env.MARKETPLACE_CONFIG ||
    path.join(rootDir, "marketplace.config.json");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function loadMarketplaceConfig(rootDir: string): MarketplaceConfig {
  const raw = readConfig(rootDir);
  const repository =
    process.env.MARKETPLACE_REPOSITORY ||
    raw.repository ||
    process.env.GITHUB_REPOSITORY;

  if (!repository) {
    throw new Error(
      "Missing repository. Set marketplace.config.json.repository or MARKETPLACE_REPOSITORY.",
    );
  }

  const branch =
    process.env.MARKETPLACE_BRANCH ||
    raw.branch ||
    process.env.GITHUB_REF_NAME ||
    "main";
  const skillsReleaseTag =
    process.env.MARKETPLACE_SKILLS_RELEASE_TAG ||
    raw.skillsReleaseTag ||
    "skills-latest";

  return {
    name: raw.name || "Open Agent Marketplace",
    repository,
    branch,
    skillsReleaseTag,
    githubBaseUrl: trimTrailingSlash(
      process.env.MARKETPLACE_GITHUB_BASE_URL ||
        raw.githubBaseUrl ||
        `https://github.com/${repository}/tree/${branch}`,
    ),
    rawBaseUrl: trimTrailingSlash(
      process.env.MARKETPLACE_RAW_BASE_URL ||
        raw.rawBaseUrl ||
        `https://raw.githubusercontent.com/${repository}/${branch}`,
    ),
    skillsContentBaseUrl: trimTrailingSlash(
      process.env.MARKETPLACE_SKILLS_CONTENT_BASE_URL ||
        raw.skillsContentBaseUrl ||
        `https://github.com/${repository}/releases/download/${skillsReleaseTag}`,
    ),
  };
}
