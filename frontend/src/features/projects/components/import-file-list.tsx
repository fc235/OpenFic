import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { FileText, GripVertical, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useTranslation } from "react-i18next";

import "./import-dialog.css";

const SUPPORTED_FILE_PATTERN = /\.(txt|md|zip|epub)$/i;
const MAX_DOCUMENT_IMPORT_FILES = 100;

interface ImportFileListProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function isSupportedDocumentFile(file: File): boolean {
  return SUPPORTED_FILE_PATTERN.test(file.name);
}

interface SortableFileRowProps {
  file: File;
  fileId: string;
  index: number;
  disabled: boolean;
  onRemove: () => void;
}

function SortableFileRow({ file, fileId, index, disabled, onRemove }: SortableFileRowProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fileId,
    disabled,
  });

  return (
    <Flex
      ref={setNodeRef}
      className="import-dialog-file-row"
      align="center"
      gap="2"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        variant="ghost"
        color="gray"
        size="1"
        disabled={disabled}
        aria-label={t("import.documents.reorderFiles")}
        className="import-dialog-file-drag-handle"
      >
        <GripVertical size={16} />
      </IconButton>
      <Text
        size="2"
        color="gray"
        className="import-dialog-file-index"
      >
        {index + 1}
      </Text>
      <FileText
        size={18}
        className="import-dialog-file-icon"
      />
      <Text
        size="2"
        weight="medium"
        className="import-dialog-file-name"
      >
        {file.name}
      </Text>
      <Tooltip content={t("import.documents.removeFile", { name: file.name })}>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          disabled={disabled}
          aria-label={t("import.documents.removeFile", { name: file.name })}
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </IconButton>
      </Tooltip>
    </Flex>
  );
}

/** Select, order, and remove the documents submitted to an import endpoint. */
export function ImportFileList({ files, onChange, disabled = false }: ImportFileListProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const idsByFile = useRef(new Map<File, string>());
  const nextId = useRef(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const getFileId = useCallback((file: File) => {
    const existingId = idsByFile.current.get(file);
    if (existingId) return existingId;

    nextId.current += 1;
    const fileId = `import-file-${nextId.current}`;
    idsByFile.current.set(file, fileId);
    return fileId;
  }, []);

  const addFiles = useCallback(
    (addedFiles: File[]) => {
      const supportedFiles = addedFiles.filter(isSupportedDocumentFile);
      if (files.length + supportedFiles.length > MAX_DOCUMENT_IMPORT_FILES) {
        setFileError(t("import.documents.invalidFileTotal"));
        return;
      }
      supportedFiles.forEach(getFileId);
      if (supportedFiles.length > 0) {
        setFileError(
          supportedFiles.length === addedFiles.length
            ? null
            : t("import.documents.invalidFileType"),
        );
        onChange([...files, ...supportedFiles]);
      } else if (addedFiles.length > 0) {
        setFileError(t("import.documents.invalidFileType"));
      }
    },
    [files, getFileId, onChange, t],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(event.target.files ?? []));
      event.target.value = "";
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) addFiles(Array.from(event.dataTransfer.files));
    },
    [addFiles, disabled],
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const oldIndex = files.findIndex((file) => getFileId(file) === active.id);
      const newIndex = files.findIndex((file) => getFileId(file) === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        onChange(arrayMove(files, oldIndex, newIndex));
      }
    },
    [files, getFileId, onChange],
  );

  const fileIds = files.map(getFileId);

  return (
    <Flex
      direction="column"
      gap="3"
    >
      <input
        ref={inputRef}
        className="import-dialog-file-input"
        type="file"
        accept=".txt,.md,.zip,.epub"
        multiple
        disabled={disabled}
        onChange={handleInputChange}
      />
      <Box
        className="import-dialog-file-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Button
          type="button"
          variant="soft"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={16} />
          {t("import.documents.addFiles")}
        </Button>
        <Text
          size="1"
          color="gray"
        >
          {t("import.documents.supportedFormats")}
        </Text>
      </Box>
      {fileError && (
        <Text
          size="1"
          color="red"
        >
          {fileError}
        </Text>
      )}

      {files.length > 0 && (
        <>
          <Text
            size="1"
            color="gray"
          >
            {t("import.documents.fileOrderHint")}
          </Text>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fileIds}
              strategy={verticalListSortingStrategy}
            >
              <Flex
                direction="column"
                className="import-dialog-file-list"
              >
                {files.map((file, index) => (
                  <SortableFileRow
                    key={fileIds[index]}
                    file={file}
                    fileId={fileIds[index]}
                    index={index}
                    disabled={disabled}
                    onRemove={() =>
                      onChange(files.filter((_, currentIndex) => currentIndex !== index))
                    }
                  />
                ))}
              </Flex>
            </SortableContext>
          </DndContext>
        </>
      )}
    </Flex>
  );
}
