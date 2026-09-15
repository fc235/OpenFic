import { Box, Button, Flex, Select, Switch, Text } from "@radix-ui/themes";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { DesktopPreferences, DesktopPreferencesPatch } from "@/lib/desktop-appearance-bridge";

export function DesktopSettings() {
  const { t } = useTranslation();
  const host = window.openficDesktopHost;
  const [preferences, setPreferences] = useState<DesktopPreferences>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const revision = useRef(0);
  const mutating = useRef(false);

  useEffect(() => {
    if (!host?.getDesktopPreferences) return;
    let disposed = false;
    let polling = false;
    const refresh = async () => {
      if (polling || mutating.current) return;
      polling = true;
      const currentRevision = revision.current;
      try {
        const state = await host.getDesktopPreferences!();
        if (!disposed && currentRevision === revision.current) setPreferences(state);
      } catch (cause) {
        if (!disposed && currentRevision === revision.current) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      } finally {
        polling = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [host]);

  if (!host?.getDesktopPreferences) return null;

  const save = async (patch: DesktopPreferencesPatch) => {
    if (!host.saveDesktopPreferences || mutating.current) return;
    mutating.current = true;
    revision.current += 1;
    setSaving(true);
    setError("");
    try {
      setPreferences(await host.saveDesktopPreferences(patch));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      mutating.current = false;
      setSaving(false);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const disabled = saving || !preferences || !host.saveDesktopPreferences;
  return (
    <Flex
      direction="column"
      gap="3"
      mt="3"
      role="region"
      aria-label={t("settings.desktop.title")}
    >
      <Text
        size="3"
        weight="medium"
      >
        {t("settings.desktop.title")}
      </Text>
      {(error || preferences?.error) && (
        <Text
          color="red"
          size="2"
          role="alert"
        >
          {t("settings.desktop.error", { message: error || preferences?.error })}
        </Text>
      )}
      {!preferences && !error && (
        <Text
          size="2"
          color="gray"
        >
          {t("settings.desktop.loading")}
        </Text>
      )}
      <Flex
        direction="column"
        gap="2"
      >
        <Text
          as="label"
          htmlFor="desktop-close-behavior"
          size="2"
          color="gray"
        >
          {t("settings.desktop.closeBehavior")}
        </Text>
        <Select.Root
          value={preferences?.closeBehavior ?? "ask"}
          disabled={disabled}
          onValueChange={(closeBehavior) =>
            void save({ closeBehavior: closeBehavior as DesktopPreferences["closeBehavior"] })
          }
        >
          <Select.Trigger
            id="desktop-close-behavior"
            style={{ width: 200 }}
          />
          <Select.Content>
            <Select.Item value="ask">{t("settings.desktop.ask")}</Select.Item>
            <Select.Item value="quit">{t("settings.desktop.quit")}</Select.Item>
            <Select.Item value="frontend">{t("settings.desktop.frontend")}</Select.Item>
          </Select.Content>
        </Select.Root>
        <Text
          size="1"
          color="gray"
        >
          {t("settings.desktop.closeHint")}
        </Text>
      </Flex>
      <Flex
        align="center"
        gap="3"
      >
        <Switch
          id="desktop-lan"
          checked={preferences?.lanEnabled ?? false}
          disabled={disabled || !preferences?.localBackend}
          onCheckedChange={(lanEnabled) => void save({ lanEnabled })}
        />
        <Text
          as="label"
          htmlFor="desktop-lan"
          size="2"
        >
          {t("settings.desktop.lan")}
        </Text>
      </Flex>
      {preferences && (
        <>
          <Text
            size="2"
            color="gray"
            role="status"
          >
            {t(
              preferences.backendRunning ? "settings.desktop.running" : "settings.desktop.stopped",
            )}
          </Text>
          {!preferences.localBackend && (
            <Text
              size="2"
              color="gray"
            >
              {t("settings.desktop.remote")}
            </Text>
          )}
          {preferences.lanPending && (
            <Text
              size="2"
              color="orange"
              role="status"
            >
              {t("settings.desktop.pending")}
            </Text>
          )}
          {preferences.localBackend &&
            preferences.lanEnabled &&
            !preferences.lanPending &&
            preferences.backendRunning &&
            preferences.addresses.length === 0 && (
              <Text
                size="2"
                color="gray"
              >
                {t("settings.desktop.noAddress")}
              </Text>
            )}
          {preferences.localBackend &&
            preferences.backendRunning &&
            preferences.addresses.map(({ name, url }) => (
              <Flex
                key={`${name}:${url}`}
                gap="3"
                align="center"
                wrap="wrap"
                p="3"
                style={{ border: "1px solid var(--gray-5)", borderRadius: "var(--radius-3)" }}
              >
                <Box style={{ background: "white", padding: 8, borderRadius: 4 }}>
                  <QRCodeSVG
                    value={url}
                    size={112}
                    title={t("settings.desktop.qr", { name })}
                  />
                </Box>
                <Flex
                  direction="column"
                  gap="2"
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <Text
                    size="2"
                    weight="medium"
                  >
                    {name}
                  </Text>
                  <Text
                    size="2"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {url}
                  </Text>
                  <Button
                    variant="soft"
                    size="1"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => void copy(url)}
                  >
                    {t(copied === url ? "settings.desktop.copied" : "settings.desktop.copy")}
                  </Button>
                </Flex>
              </Flex>
            ))}
          {preferences.localBackend && (
            <Text
              size="1"
              color="gray"
            >
              {t("settings.desktop.lanHint")}
            </Text>
          )}
        </>
      )}
    </Flex>
  );
}
