import type { ContentProvider } from "./types";
import { netflixProvider } from "./providers/netflix";
import { anizoneProvider } from "./providers/anizone";
import { animesamaProvider } from "./providers/animesama";
import { frenchstreamProvider } from "./providers/frenchstream";
import { netmirrorProvider } from "./providers/netmirror";

const providers = new Map<string, ContentProvider>();
let activeProviderId = "netflix";

function ensureDefaults() {
  if (providers.size === 0) {
    registerProvider(netflixProvider);
    registerProvider(anizoneProvider);
    registerProvider(animesamaProvider);
    registerProvider(frenchstreamProvider);
    registerProvider(netmirrorProvider);
  }
}

export function registerProvider(provider: ContentProvider) {
  providers.set(provider.id, provider);
}

export function unregisterProvider(id: string) {
  providers.delete(id);
  if (activeProviderId === id) {
    activeProviderId = providers.keys().next().value || "netflix";
  }
}

export function getProvider(id?: string): ContentProvider {
  ensureDefaults();
  const target = id || activeProviderId;
  const p = providers.get(target);
  if (!p) {
    const fallback = providers.values().next().value;
    if (!fallback) throw new Error("No content providers registered");
    return fallback;
  }
  return p;
}

export function listProviders(): { id: string; name: string; type: string; active: boolean }[] {
  ensureDefaults();
  return Array.from(providers.values()).map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    active: p.id === activeProviderId,
  }));
}

export function setActiveProvider(id: string): boolean {
  ensureDefaults();
  if (!providers.has(id)) return false;
  activeProviderId = id;
  return true;
}

export function getActiveProviderId(): string {
  return activeProviderId;
}
