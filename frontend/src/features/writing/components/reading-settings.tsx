import { Button, Flex } from "@radix-ui/themes";
import { useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_READING_PREFERENCES,
  isReadingKeyAllowed,
  normalizeReadingPreferences,
  type ReadingPreferences,
} from "../lib/reading-mode";

const keyLabels: Record<string, string> = {
  ArrowLeft: "←",
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  " ": "Space",
};

function displayKeys(keys: string[]): string {
  return keys.map((key) => keyLabels[key] ?? key).join(" / ");
}

export function ReadingSettings({
  preferences,
  onChange,
  onClose,
}: {
  preferences: ReadingPreferences;
  onChange: (value: ReadingPreferences) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [interval, setInterval] = useState(String(preferences.autoTurnSeconds));
  const [error, setError] = useState<"keyConflict" | "intervalRange" | null>(null);

  useEffect(() => {
    setInterval(String(preferences.autoTurnSeconds));
  }, [preferences.autoTurnSeconds]);

  function captureKey(event: KeyboardEvent<HTMLInputElement>, direction: "previous" | "next") {
    if (
      event.key === "Tab" ||
      event.key === "Enter" ||
      event.key === "Escape" ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.nativeEvent.isComposing ||
      event.repeat
    )
      return;
    if (!isReadingKeyAllowed(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const opposite = direction === "previous" ? preferences.nextKeys : preferences.previousKeys;
    if (opposite.some((binding) => binding.toLowerCase() === key.toLowerCase())) {
      setError("keyConflict");
      return;
    }
    setError(null);
    onChange({ ...preferences, [direction === "previous" ? "previousKeys" : "nextKeys"]: [key] });
  }

  function saveInterval() {
    const value = Number(interval);
    if (
      !interval.trim() ||
      !Number.isFinite(value) ||
      value < 1 ||
      value > 3600 ||
      !Number.isInteger(value)
    ) {
      setInterval(String(preferences.autoTurnSeconds));
      setError("intervalRange");
      return;
    }
    setError(null);
    setInterval(String(value));
    onChange(normalizeReadingPreferences({ ...preferences, autoTurnSeconds: value }));
  }

  function reset() {
    const defaults = normalizeReadingPreferences(DEFAULT_READING_PREFERENCES);
    setInterval(String(defaults.autoTurnSeconds));
    setError(null);
    onChange(defaults);
  }

  return (
    <section
      className="reading-settings"
      aria-label={t("reading.settings")}
    >
      <h2>{t("reading.settings")}</h2>
      <p>{t("reading.keyHint")}</p>
      <div className="reading-settings-grid">
        <label className="reading-settings-field">
          {t("reading.previousKey")}
          <input
            type="text"
            readOnly
            value={displayKeys(preferences.previousKeys)}
            onKeyDown={(event) => captureKey(event, "previous")}
          />
        </label>
        <label className="reading-settings-field">
          {t("reading.nextKey")}
          <input
            type="text"
            readOnly
            value={displayKeys(preferences.nextKeys)}
            onKeyDown={(event) => captureKey(event, "next")}
          />
        </label>
        <label className="reading-settings-field">
          {t("reading.interval")}
          <input
            type="number"
            min={1}
            max={3600}
            step={1}
            value={interval}
            onChange={(event) => setInterval(event.target.value)}
            onBlur={saveInterval}
          />
        </label>
      </div>
      {error && (
        <p
          className="reading-settings-error"
          role="alert"
        >
          {t(`reading.${error}`)}
        </p>
      )}
      <Flex
        gap="3"
        mt="3"
        wrap="wrap"
      >
        <Button
          type="button"
          variant="soft"
          color="gray"
          onClick={reset}
        >
          {t("reading.reset")}
        </Button>
        <Button
          type="button"
          variant="soft"
          onClick={onClose}
          aria-label={t("reading.closeSettings")}
        >
          {t("reading.closeSettings")}
        </Button>
      </Flex>
    </section>
  );
}
