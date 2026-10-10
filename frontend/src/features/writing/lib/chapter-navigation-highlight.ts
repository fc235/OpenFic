import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const chapterNavigationHighlightKey = new PluginKey<DecorationSet>(
  "chapterNavigationHighlight",
);

export const ChapterNavigationHighlight = Extension.create({
  name: "chapterNavigationHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: chapterNavigationHighlightKey,
        state: {
          init: () => DecorationSet.empty,
          apply(transaction, decorations) {
            const target = transaction.getMeta(chapterNavigationHighlightKey) as
              | { from: number; to: number }
              | null
              | undefined;
            if (target === null) return DecorationSet.empty;
            if (target)
              return DecorationSet.create(transaction.doc, [
                Decoration.node(target.from, target.to, {
                  "data-chapter-navigation-highlight": "true",
                }),
              ]);
            return decorations.map(transaction.mapping, transaction.doc);
          },
        },
        props: {
          decorations: (state) => chapterNavigationHighlightKey.getState(state),
        },
      }),
    ];
  },
});
