import { Button, Checkbox, Dialog, Flex, Text } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Eye, Folder, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient, fetchProjects } from "@/lib/api-client";

type Resource = "characters" | "worldInfo";
type ProjectRef = { id: string; title: string };
type ReferenceInfo = { sources: ProjectRef[]; used_by: ProjectRef[] };
const referenceUrl = (id: string, resource: Resource) =>
  `/projects/${encodeURIComponent(id)}/references/${resource}`;

export function ProjectReferences({ projectId, resource }: { projectId: string; resource: Resource }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const info = useQuery({
    queryKey: ["project-references", projectId, resource],
    queryFn: async () => (await apiClient.get<ReferenceInfo>(referenceUrl(projectId, resource))).data,
    refetchOnWindowFocus: true,
  });
  return (
    <div className="project-references">
      <Button size="1" variant="soft" disabled={!info.data} onClick={() => setOpen(true)}>
        <Link2 size={14} aria-hidden="true" />
        {t("projectScope.manageShared")}
      </Button>
      {info.isError && <Button size="1" variant="ghost" onClick={() => void info.refetch()}>{t("projectScope.loadFailed")}</Button>}
      {info.data && <Text size="1" color="gray">
        {t("projectScope.sharingCounts", { sources: info.data.sources.length, targets: info.data.used_by.length })}
      </Text>}
      {open && <ReferenceDialog key={`${projectId}:${resource}`} projectId={projectId} resource={resource}
        info={info.data} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ReferenceDialog({ projectId, resource, info, onClose }: {
  projectId: string; resource: Resource; info?: ReferenceInfo; onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<string[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const selected = selection ?? info?.sources.map(p => p.id) ?? [];
  const projects = useQuery({
    queryKey: ["projects", "reference-picker"],
    queryFn: async () => {
      const all: ProjectRef[] = [];
      for (let page = 1; ; page++) {
        const result = await fetchProjects({ page, pageSize: 100 });
        all.push(...result.items.map(p => ({ id: p.id, title: p.title })));
        if (all.length >= result.total || result.items.length === 0) return all;
      }
    },
  });
  const material = useQuery({
    queryKey: ["shared-material", projectId, resource, preview, "brief"],
    queryFn: async () => (await apiClient.get<{ items: { id: string; name: string }[] }>(
      `${referenceUrl(projectId, resource)}/${encodeURIComponent(preview!)}`, { params: { brief: true } })).data,
    enabled: Boolean(preview),
    staleTime: 0,
  });
  const save = useMutation({
    mutationFn: () => apiClient.put(referenceUrl(projectId, resource), { source_project_ids: selected }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project-references"] });
      await queryClient.invalidateQueries({ queryKey: ["shared-material"] });
      onClose();
    },
  });
  return <Dialog.Root open onOpenChange={value => { if (!value && !save.isPending) onClose(); }}>
    <Dialog.Content maxWidth="640px" className="project-reference-dialog">
      <Dialog.Title>{t("projectScope.manageShared")}</Dialog.Title>
      <Dialog.Description size="2">{t("projectScope.sharedHelp")}</Dialog.Description>
      <div className="project-reference-dialog-body">
      <div className="project-reference-list">
        {projects.isPending || !info ? <Text>{t("projectScope.loading")}</Text> :
          projects.data?.filter(p => p.id !== projectId).map(p => <Flex key={p.id} className="project-reference-row" data-selected={selected.includes(p.id)} align="center" gap="2" justify="between">
            <label className="project-reference-choice">
              <Checkbox checked={selected.includes(p.id)} disabled={save.isPending} onCheckedChange={checked =>
                setSelection(checked ? [...selected, p.id] : selected.filter(id => id !== p.id))} />
              <Folder size={16} aria-hidden="true" className="project-reference-folder" />
              <span title={p.title}>{p.title}</span>
            </label>
            {info.sources.some(source => source.id === p.id) && <Button variant="soft" color="gray" size="1" onClick={() => setPreview(p.id)}>
              <Eye size={14} aria-hidden="true" />
              {t("projectScope.preview")}
            </Button>}
          </Flex>)}
      </div>
      {projects.data?.filter(p => p.id !== projectId).length === 0 && <Text as="p" size="2" color="gray" className="project-reference-empty">{t("projectScope.empty")}</Text>}
      {projects.isError && <Text color="red">{t("projectScope.loadFailed")}</Text>}
      {info && info.used_by.length > 0 && <Text as="p" size="1" color="gray" className="project-reference-used-by">
        {t("projectScope.usedBy", { names: info.used_by.map(p => p.title).join("、") })}
      </Text>}
      {preview && <section className="project-reference-preview">
        <Text as="p" size="2" weight="medium" className="project-reference-preview-title">{t("projectScope.previewTitle", { name: info?.sources.find(p => p.id === preview)?.title })}</Text>
        {material.isPending && <p>{t("projectScope.loading")}</p>}
        {material.isError && <p>{t("projectScope.loadFailed")}</p>}
        {material.data?.items.length === 0 && <p>{t("projectScope.empty")}</p>}
        {material.data?.items.map(item => <SharedMaterialItem key={`${preview}:${item.id}`} projectId={projectId}
          resource={resource} sourceId={preview} item={item} />)}
      </section>}
      {save.isError && <Text as="p" color="red" role="alert">{t("projectScope.saveFailed")}</Text>}
      </div>
      <Flex justify="end" gap="3" className="project-reference-dialog-footer">
        <Button variant="soft" disabled={save.isPending} onClick={onClose}>{t("common.cancel")}</Button>
        <Button disabled={!info || projects.isPending || projects.isError || save.isPending} onClick={() => save.mutate()}>{t("common.save")}</Button>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>;
}

function SharedMaterialItem({ projectId, resource, sourceId, item }: {
  projectId: string; resource: Resource; sourceId: string; item: { id: string; name: string };
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const content = useQuery({
    queryKey: ["shared-material", projectId, resource, sourceId, item.id],
    queryFn: async () => (await apiClient.get<{ items: { content: string }[] }>(
      `${referenceUrl(projectId, resource)}/${encodeURIComponent(sourceId)}`, { params: { item_id: item.id } })).data,
    enabled: open,
    staleTime: 0,
  });
  return <details onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><ChevronRight size={14} aria-hidden="true" /><span>{item.name}</span></summary>
    {open && (content.isError ? <Button size="1" variant="ghost" onClick={() => void content.refetch()}>{t("projectScope.loadFailed")}</Button>
      : <pre>{content.isPending ? t("projectScope.loading") : content.data?.items[0]?.content}</pre>)}
  </details>;
}
