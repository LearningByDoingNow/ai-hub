import Database from "better-sqlite3";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

const ARXIV_API = "http://export.arxiv.org/api/query";
const CATEGORIES = ["cs.AI", "cs.CL", "cs.LG", "cs.CV"];
const MAX_RESULTS = 30;

function generateId(arxivId) {
  return "paper-" + crypto.createHash("md5").update(arxivId).digest("hex").slice(0, 12);
}

function parseAtomXml(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const getTag = (tag) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : "";
    };

    const getAttr = (tag, attr) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/>`));
      return m ? m[1] : "";
    };

    const title = getTag("title").replace(/\s+/g, " ");
    const summary = getTag("summary").replace(/\s+/g, " ");
    const published = getTag("published").split("T")[0];
    const arxivId = getTag("id");

    // Get authors
    const authorRegex = /<author>\s*<name>([^<]*)<\/name>/g;
    const authors = [];
    let am;
    while ((am = authorRegex.exec(entry)) !== null) {
      authors.push(am[1].trim());
    }

    // Get links
    const pdfLink = getAttr("link", 'title="pdf"') ||
      arxivId.replace("/abs/", "/pdf/");
    const absLink = arxivId;

    // Get categories
    const catRegex = /category[^>]*term="([^"]*)"/g;
    const cats = [];
    let cm;
    while ((cm = catRegex.exec(entry)) !== null) {
      cats.push(cm[1]);
    }
    const primaryCat = cats[0] || "";

    if (!title || !arxivId) continue;

    entries.push({
      title,
      summary: summary.slice(0, 500),
      published,
      arxivId,
      absLink,
      pdfLink,
      authors: authors.slice(0, 5),
      primaryCat,
    });
  }
  return entries;
}

async function fetchArxiv() {
  const query = CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `${ARXIV_API}?search_query=${query}&start=0&max_results=${MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`;

  console.log("  Fetching arXiv...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

  const xml = await res.text();
  return parseAtomXml(xml);
}

async function main() {
  console.log("AI Hub Paper Fetcher");
  console.log("====================\n");

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Clear old mock papers
  const deleted = db.prepare("DELETE FROM papers WHERE id LIKE 'paper-%' AND links LIKE '%arxiv.org\"%'").run();
  if (deleted.changes > 0) console.log(`  Cleared ${deleted.changes} old mock papers`);

  const entries = await fetchArxiv();
  console.log(`  Got ${entries.length} papers from arXiv\n`);

  const insert = db.prepare(
    "INSERT OR IGNORE INTO papers (id, title, authors, venue, date, abstract, abstract_en, links) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  let added = 0;
  const doInsert = db.transaction(() => {
    for (const e of entries) {
      const id = generateId(e.arxivId);
      const venue = `arXiv ${e.published.slice(0, 4)} [${e.primaryCat}]`;
      const links = [
        { label: "arXiv", url: e.absLink },
        { label: "PDF", url: e.pdfLink },
      ];

      const r = insert.run(
        id, e.title, JSON.stringify(e.authors), venue, e.published,
        e.summary, e.summary, JSON.stringify(links)
      );
      if (r.changes > 0) {
        added++;
        console.log(`  + ${e.title.slice(0, 70)}...`);
      }
    }
  });
  doInsert();

  const total = db.prepare("SELECT COUNT(*) as c FROM papers").get();
  console.log(`\n✓ Done! ${added} new papers. Total: ${total.c}`);

  db.pragma("wal_checkpoint(TRUNCATE)");
  db.close();
}

main().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
