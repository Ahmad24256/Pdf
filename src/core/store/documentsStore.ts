import { create } from 'zustand';
import type { DocumentMeta } from '../../types/document';
import { toUserMessage } from '../errors';
import * as repository from '../storage/documentsRepository';

interface DocumentsState {
  documents: DocumentMeta[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  add: (sourceUri: string, name: string) => Promise<DocumentMeta | null>;
  remove: (id: string) => Promise<void>;
  touch: (id: string) => Promise<void>;
  setThumbnail: (id: string, path: string | null) => Promise<void>;
}

function sortByLastModified(documents: DocumentMeta[]): DocumentMeta[] {
  return [...documents].sort((a, b) => b.lastModified - a.lastModified);
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const documents = await repository.listDocuments();
      set({ documents: sortByLastModified(documents), loading: false });
    } catch (error) {
      set({ loading: false, error: toUserMessage(error) });
    }
  },

  add: async (sourceUri, name) => {
    try {
      const meta = await repository.addDocument(sourceUri, name);
      set({ documents: sortByLastModified([meta, ...get().documents]), error: null });
      return meta;
    } catch (error) {
      set({ error: toUserMessage(error) });
      return null;
    }
  },

  remove: async (id) => {
    try {
      await repository.removeDocument(id);
      set({ documents: get().documents.filter((d) => d.id !== id), error: null });
    } catch (error) {
      set({ error: toUserMessage(error) });
    }
  },

  touch: async (id) => {
    try {
      await repository.touchDocumentById(id);
      const meta = await repository.getDocument(id);
      if (meta) {
        set({ documents: sortByLastModified(get().documents.map((d) => (d.id === id ? meta : d))) });
      }
    } catch (error) {
      set({ error: toUserMessage(error) });
    }
  },

  setThumbnail: async (id, path) => {
    try {
      await repository.setDocumentThumbnail(id, path);
      set({
        documents: get().documents.map((d) => (d.id === id ? { ...d, thumbnailPath: path } : d)),
        error: null,
      });
    } catch (error) {
      set({ error: toUserMessage(error) });
    }
  },
}));
