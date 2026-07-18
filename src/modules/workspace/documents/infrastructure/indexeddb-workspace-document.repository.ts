import type { WorkspaceDocumentRepository } from "../application/workspace-document.repository";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";

const databaseName = "notion-local-first";
const databaseVersion = 1;
const documentStoreName = "documents";
const memoryDocuments = new Map<string, WorkspaceDocumentContent>();

/**
 * IndexedDB adapter for the workspace document repository port.
 * The in-memory fallback keeps tests and environments without IndexedDB usable.
 */
export const indexedDbWorkspaceDocumentRepository: WorkspaceDocumentRepository = {
  async list(workspaceId) {
    const database = await openDatabase();
    if (!database) {
      return [...memoryDocuments.values()].filter(
        (document) => document.workspaceId === workspaceId,
      );
    }

    const documents = await requestToPromise(
      database
        .transaction(documentStoreName, "readonly")
        .objectStore(documentStoreName)
        .getAll() as IDBRequest<WorkspaceDocumentContent[]>,
    );
    return documents.filter((document) => document.workspaceId === workspaceId);
  },

  async save(document) {
    memoryDocuments.set(document.id, document);
    const database = await openDatabase();
    if (!database) return;

    const transaction = database.transaction(documentStoreName, "readwrite");
    transaction.objectStore(documentStoreName).put(document);
    await transactionToPromise(transaction);
  },
};

function openDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in globalThis)) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onerror = () => reject(request.error ?? new Error("Failed to open local database"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(documentStoreName)) {
        database.createObjectStore(documentStoreName, { keyPath: "id" });
      }
    };
  });
}

function requestToPromise<TResult>(request: IDBRequest<TResult>): Promise<TResult> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("Local database request failed"));
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Local database transaction was aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Local database transaction failed"));
    transaction.oncomplete = () => resolve();
  });
}
