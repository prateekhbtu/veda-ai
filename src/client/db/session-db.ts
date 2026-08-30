import { openDB, type DBSchema } from "idb";
import type { PageImage, Session } from "@/client/types";

interface VedaDb extends DBSchema {
  sessions: { key: string; value: Session; indexes: { "by-updated": number; "by-expiry": number } };
  pages: { key: string; value: PageImage; indexes: { "by-session": string } };
}

const DB_NAME = "vedaai-grader";

async function db() {
  return openDB<VedaDb>(DB_NAME, 2, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("sessions")) {
        const store = database.createObjectStore("sessions", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
        store.createIndex("by-expiry", "expiresAt");
      }
      if (!database.objectStoreNames.contains("pages")) {
        const pages = database.createObjectStore("pages", { keyPath: "id" });
        pages.createIndex("by-session", "sessionId");
      }
    },
  });
}

export async function saveSession(session: Session) {
  const database = await db();
  await database.put("sessions", session);
}

export async function getSession(id: string) {
  const database = await db();
  return database.get("sessions", id);
}

export async function savePage(page: PageImage) {
  const database = await db();
  await database.put("pages", page);
}

export async function getPage(id: string) {
  const database = await db();
  return database.get("pages", id);
}

export async function recentSessions() {
  const database = await db();
  const all = await database.getAllFromIndex("sessions", "by-updated");
  return all.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
}

export async function purgeExpiredSessions(now = Date.now()) {
  const database = await db();
  const expired = await database.getAllFromIndex("sessions", "by-expiry", IDBKeyRange.upperBound(now));
  const tx = database.transaction(["sessions", "pages"], "readwrite");
  for (const { id } of expired) {
    const pageIds = await tx.objectStore("pages").index("by-session").getAllKeys(id);
    await Promise.all(pageIds.map((pageId) => tx.objectStore("pages").delete(pageId)));
    await tx.objectStore("sessions").delete(id);
  }
  await tx.done;
}

export async function clearAllSavedExams() {
  const database = await db();
  const tx = database.transaction(["sessions", "pages"], "readwrite");
  await Promise.all([tx.objectStore("sessions").clear(), tx.objectStore("pages").clear()]);
  await tx.done;
}
