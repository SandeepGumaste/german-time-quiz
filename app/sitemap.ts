import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PATHS = ["", "/time", "/artikel", "/zahlen", "/verben", "/satzbau", "/laden", "/leaderboard", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: `${SITE.url}${p}` }));
}
