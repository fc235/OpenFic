import { create } from "zustand";

import type { ChapterLineTarget } from "../lib/chapter-navigation";

interface ChapterNavigationRequest extends ChapterLineTarget {
  id: number;
  projectId: string;
  chapterId: string;
  title: string;
}

interface ChapterNavigationState {
  sequence: number;
  request: ChapterNavigationRequest | null;
  begin: () => number;
  publish: (request: ChapterNavigationRequest) => void;
  consume: (id: number) => void;
}

export const useChapterNavigationStore = create<ChapterNavigationState>((set, get) => ({
  sequence: 0,
  request: null,
  begin: () => {
    const sequence = get().sequence + 1;
    set({ sequence, request: null });
    return sequence;
  },
  publish: (request) => {
    if (get().sequence === request.id) set({ request });
  },
  consume: (id) => {
    if (get().request?.id === id) set({ request: null });
  },
}));
