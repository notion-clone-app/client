import type { DocumentRevisionRepository } from "../application/document-revision.repository.port";
import type { DocumentRevision } from "../domain/document-revision.entity";

const databaseName = "notion-document-versioning";
const databaseVersion = 1;
const revisionStoreName = "revisions";
const memoryRevisions = new Map<string, DocumentRevision>();

/** IndexedDB adapter for immutable revision snapshots. */
export const indexedDbDocumentRevisionRepository: DocumentRevisionRepository = {
  async list(workspaceId) {
    const database = await openDatabase();
    if (!database) {
      return [...memoryRevisions.values()].filter(
        (revision) => revision.workspaceId === workspaceId,
      );
    }

    const revisions = await requestToPromise(
      database
        .transaction(revisionStoreName, "readonly")
        .objectStore(revisionStoreName)
        .getAll() as IDBRequest<DocumentRevision[]>,
    );
    return revisions.filter((revision) => revision.workspaceId === workspaceId);
  },

  async save(revision) {
    memoryRevisions.set(revision.id, revision);
    const database = await openDatabase();
    if (!database) return;

    const transaction = database.transaction(revisionStoreName, "readwrite");
    transaction.objectStore(revisionStoreName).put(revision);
    await transactionToPromise(transaction);
  },
};

function openDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in globalThis)) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onerror = () => reject(request.error ?? new Error("Failed to open revision database"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(revisionStoreName)) {
        database.createObjectStore(revisionStoreName, { keyPath: "id" });
      }
    };
  });
}

function requestToPromise<TResult>(request: IDBRequest<TResult>): Promise<TResult> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("Revision request failed"));
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Revision transaction was aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Revision transaction failed"));
    transaction.oncomplete = () => resolve();
  });
}
