import * as sqlite from "./sqlite";

const useSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getSupabaseAdmin() {
  const { createAdminClient } = await import("./supabase/admin");
  return createAdminClient();
}

// ============ Providers ============

export async function createProvider(p: Parameters<typeof sqlite.createProvider>[0]) {
  sqlite.createProvider(p);
  if (useSupabase) {
    const sb = await getSupabaseAdmin();
    await sb.from("providers").upsert({
      id: p.id, name: p.name, description: p.description,
      category: p.category, country: p.country,
      links: p.links, tags: p.tags,
    });
  }
}

export async function updateProvider(id: string, p: Parameters<typeof sqlite.updateProvider>[1]) {
  sqlite.updateProvider(id, p);
  if (useSupabase) {
    const sb = await getSupabaseAdmin();
    const update: Record<string, unknown> = {};
    if (p.name !== undefined) update.name = p.name;
    if (p.description !== undefined) update.description = p.description;
    if (p.category !== undefined) update.category = p.category;
    if (p.country !== undefined) update.country = p.country;
    if (p.links !== undefined) update.links = p.links;
    if (p.tags !== undefined) update.tags = p.tags;
    await sb.from("providers").update(update).eq("id", id);
  }
}

export async function deleteProvider(id: string) {
  sqlite.deleteProvider(id);
  if (useSupabase) {
    const sb = await getSupabaseAdmin();
    await sb.from("providers").delete().eq("id", id);
  }
}

// ============ Sources ============

export async function createSource(s: Parameters<typeof sqlite.createSource>[0]) {
  sqlite.createSource(s);
}

export async function updateSource(id: string, s: Parameters<typeof sqlite.updateSource>[1]) {
  sqlite.updateSource(id, s);
}

export async function deleteSource(id: string) {
  sqlite.deleteSource(id);
}

// ============ Modules ============

export async function createModule(m: Parameters<typeof sqlite.createModule>[0]) {
  sqlite.createModule(m);
}

export async function updateModule(id: string, m: Parameters<typeof sqlite.updateModule>[1]) {
  sqlite.updateModule(id, m);
}

export async function deleteModule(id: string) {
  sqlite.deleteModule(id);
}
