/**
 * General Settings Component
 *
 * 通用设置面板，包含语言、主题、字体设置。
 */

import { Box, Flex, SegmentedControl, Switch, Text, TextArea, TextField } from "@radix-ui/themes";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LabeledSelect } from "@/components/select";
import { toast } from "@/components/toast";
import { supportedLanguages, type LanguageCode } from "@/i18n";

import type { Settings, ThemeMode } from "../lib/settings.types";
import { getCodeFontOptions, getFontOptions } from "../lib/settings.types";

interface GeneralSettingsProps {
  /** 当前设置 */
  settings: Settings;
  /** 设置变更回调 */
  onSettingsChange: (settings: Settings) => void;
  isSaving?: boolean;
}

interface FontSizeFieldProps {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  disabled?: boolean;
}

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 28;

function FontSizeField({ label, value, onCommit, disabled = false }: FontSizeFieldProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setDraft(String(value));
      return;
    }
    const nextValue = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(parsed)));
    if (nextValue === value) {
      setDraft(String(value));
      return;
    }
    onCommit(nextValue);
  };

  const stepBy = (delta: number) => {
    const base = Number.isFinite(Number(draft)) ? Number(draft) : value;
    const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, base + delta));
    setDraft(String(next));
    inputRef.current?.focus();
  };

  const stepperButton = (direction: "up" | "down") => {
    const isUp = direction === "up";
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label={isUp ? t("settings.increaseFontSize") : t("settings.decreaseFontSize")}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => stepBy(isUp ? 1 : -1)}
        className="font-size-stepper-btn"
      >
        {isUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
    );
  };

  return (
    <Flex
      direction="column"
      gap="2"
    >
      <Text
        size="2"
        weight="medium"
        color="gray"
      >
        {label}
      </Text>
      <TextField.Root
        type="number"
        min={MIN_FONT_SIZE}
        max={MAX_FONT_SIZE}
        value={draft}
        ref={inputRef}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        disabled={disabled}
        className="font-size-field"
        style={{ width: 200 }}
      >
        <TextField.Slot
          side="right"
          className="font-size-stepper-slot"
        >
          <Flex
            direction="column"
            className="font-size-stepper"
          >
            {stepperButton("up")}
            {stepperButton("down")}
          </Flex>
        </TextField.Slot>
        <TextField.Slot side="right">px</TextField.Slot>
      </TextField.Root>
    </Flex>
  );
}

export function GeneralSettings({
  settings,
  onSettingsChange,
  isSaving = false,
}: GeneralSettingsProps) {
  const { t } = useTranslation();
  const [quickStartPromptDraft, setQuickStartPromptDraft] = useState(settings.quickStartPrompt);

  useEffect(() => {
    setQuickStartPromptDraft(settings.quickStartPrompt);
  }, [settings.quickStartPrompt]);

  /** 更新语言 */
  const handleLanguageChange = (language: string) => {
    onSettingsChange({ ...settings, language: language as LanguageCode });
  };

  /** 更新主题 */
  const handleThemeChange = (theme: string) => {
    onSettingsChange({ ...settings, theme: theme as ThemeMode });
  };

  /** 更新字体 */
  const handleFontChange = (fontFamily: string) => {
    onSettingsChange({ ...settings, fontFamily });
  };

  /** 更新代码字体 */
  const handleCodeFontChange = (codeFontFamily: string) => {
    onSettingsChange({ ...settings, codeFontFamily });
  };

  /** 更新基础字号 */
  const handleBaseFontSizeCommit = (value: number) => {
    onSettingsChange({ ...settings, baseFontSize: value });
  };

  /** 更新编辑器字号 */
  const handleEditorFontSizeCommit = (value: number) => {
    onSettingsChange({ ...settings, editorFontSize: value });
  };

  const commitQuickStartPrompt = () => {
    if (quickStartPromptDraft === settings.quickStartPrompt) return;
    if (settings.quickStartEnabled && !quickStartPromptDraft.trim()) {
      toast.error(t("settings.quickStartPromptRequired"));
      setQuickStartPromptDraft(settings.quickStartPrompt);
      return;
    }
    onSettingsChange({ ...settings, quickStartPrompt: quickStartPromptDraft });
  };

  const handleQuickStartEnabledChange = (enabled: boolean) => {
    if (enabled && !quickStartPromptDraft.trim()) {
      toast.error(t("settings.quickStartPromptRequired"));
      return;
    }
    onSettingsChange({
      ...settings,
      quickStartEnabled: enabled,
      quickStartPrompt: quickStartPromptDraft,
    });
  };

  return (
    <Box>
      <Flex
        direction="column"
        gap="4"
      >
        {/* 语言设置 */}
        <LabeledSelect
          label={t("settings.language")}
          labelColor="gray"
          value={settings.language}
          options={supportedLanguages.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }))}
          onChange={handleLanguageChange}
          disabled={isSaving}
          triggerStyle={{ width: 200 }}
        />

        {/* 主题设置 */}
        <Flex
          direction="column"
          gap="2"
        >
          <Text
            size="2"
            weight="medium"
            color="gray"
          >
            {t("settings.theme")}
          </Text>
          <SegmentedControl.Root
            value={settings.theme}
            onValueChange={handleThemeChange}
            disabled={isSaving}
            style={{ width: 200 }}
          >
            <SegmentedControl.Item value="light">{t("settings.themeLight")}</SegmentedControl.Item>
            <SegmentedControl.Item value="dark">{t("settings.themeDark")}</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>

        {/* 字体设置 */}
        <LabeledSelect
          label={t("settings.fontFamily")}
          labelColor="gray"
          value={settings.fontFamily}
          options={getFontOptions(t)}
          onChange={handleFontChange}
          disabled={isSaving}
          triggerStyle={{ width: 200 }}
        />

        {/* 代码字体设置 */}
        <LabeledSelect
          label={t("settings.codeFontFamily")}
          labelColor="gray"
          value={settings.codeFontFamily || "JetBrains Mono Variable"}
          options={getCodeFontOptions(t)}
          onChange={handleCodeFontChange}
          disabled={isSaving}
          triggerStyle={{ width: 200 }}
        />

        {/* 基础字号设置 */}
        <FontSizeField
          label={t("settings.baseFontSize")}
          value={settings.baseFontSize}
          onCommit={handleBaseFontSizeCommit}
          disabled={isSaving}
        />

        {/* 编辑器字号设置 */}
        <FontSizeField
          label={t("settings.editorFontSize")}
          value={settings.editorFontSize}
          onCommit={handleEditorFontSizeCommit}
          disabled={isSaving}
        />

        <Flex
          direction="column"
          gap="3"
          mt="4"
        >
          <Text
            size="3"
            weight="medium"
          >
            {t("settings.quickStartTitle")}
          </Text>
          <Flex
            align="center"
            justify="between"
            gap="4"
          >
            <Box>
              <Text
                size="2"
                weight="medium"
                as="div"
              >
                {t("settings.quickStartEnabled")}
              </Text>
              <Text
                size="1"
                color="gray"
                as="div"
                mt="1"
              >
                {t("settings.quickStartDescription")}
              </Text>
            </Box>
            <Switch
              checked={settings.quickStartEnabled}
              onCheckedChange={handleQuickStartEnabledChange}
              disabled={isSaving}
              aria-label={t("settings.quickStartEnabled")}
            />
          </Flex>
          <Box>
            <Text
              as="label"
              htmlFor="quick-start-prompt"
              size="2"
              weight="medium"
              color="gray"
            >
              {t("settings.quickStartPrompt")}
            </Text>
            <TextArea
              id="quick-start-prompt"
              mt="2"
              value={quickStartPromptDraft}
              onChange={(event) => setQuickStartPromptDraft(event.target.value)}
              onBlur={commitQuickStartPrompt}
              placeholder={t("settings.quickStartPromptPlaceholder")}
              disabled={isSaving}
              rows={6}
            />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
