import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVolume,
  deleteVolume,
  fetchChapters,
  moveVolume,
  updateVolume,
} from "@/lib/api-client";
import type { VolumeCreate, VolumeUpdate } from "@/lib/chapter.types";
import type { ProjectListResponse } from "@/lib/project.types";

import { projectsQueryKey } from "../../projects/hooks/use-projects";
import {
  importDocumentsIntoProject,
  type DocumentImportOptions,
  type DocumentImportPlacement,
} from "../../projects/lib/import-api";

export function useVolumeTree(projectId: string) {
  return useQuery({
    queryKey: ["volume-tree", projectId],
    queryFn: () => fetchChapters(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVolume(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VolumeCreate) => createVolume(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volume-tree", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ volumeId, data }: { volumeId: string; data: VolumeUpdate }) =>
      updateVolume(volumeId, data),
    onSuccess: (volume) => {
      queryClient.invalidateQueries({ queryKey: ["volume-tree", volume.projectId] });
    },
  });
}

export function useDeleteVolume(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ volumeId, cascade = false }: { volumeId: string; cascade?: boolean }) =>
      deleteVolume(volumeId, cascade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volume-tree", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useMoveVolume(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ volumeId, newOrder }: { volumeId: string; newOrder: number }) =>
      moveVolume(volumeId, { newOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volume-tree", projectId] });
    },
  });
}

/** Import parsed documents into this project and refresh only its affected views. */
export function useImportDocumentsIntoProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      placement,
      options,
    }: {
      files: File[];
      placement: DocumentImportPlacement;
      options: DocumentImportOptions;
    }) => importDocumentsIntoProject(projectId, files, placement, options),
    onSuccess: async (result) => {
      queryClient.setQueriesData<ProjectListResponse>({ queryKey: projectsQueryKey }, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  chapterCount: project.chapterCount + result.chapter_count,
                  wordCount: project.wordCount + result.total_word_count,
                }
              : project,
          ),
        };
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["volume-tree", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
    },
  });
}
