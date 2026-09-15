import { Flex, Text, Tooltip } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchModels, fetchProviders } from "@/features/settings/lib/model-api";
import { apiClient } from "@/lib/api-client";

import { getDeepSeekPricingPeriod } from "../lib/deepseek-pricing-period";

function isOfficialDeepSeekUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "api.deepseek.com" &&
      (!url.port || url.port === "443") &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      ["", "/v1", "/beta", "/anthropic"].includes(url.pathname.replace(/\/+$/, ""))
    );
  } catch {
    return false;
  }
}

interface BalanceResponse {
  is_available: boolean;
  balance_infos: {
    currency: "CNY" | "USD";
    total_balance: string;
    granted_balance: string;
    topped_up_balance: string;
  }[];
}

export function DeepSeekBalance({ modelId, isRunning }: { modelId: string; isRunning: boolean }) {
  const models = useQuery({ queryKey: ["models"], queryFn: () => fetchModels() });
  const providers = useQuery({ queryKey: ["model-providers"], queryFn: fetchProviders });
  const model = models.data?.find((item) => item.id === modelId);
  const provider = providers.data?.find((item) => item.id === model?.providerId);
  if (!provider || !isOfficialDeepSeekUrl(provider.url)) return null;
  return (
    <OfficialBalance
      key={`${provider.id}:${provider.updatedAt}`}
      providerId={provider.id}
      updatedAt={provider.updatedAt}
      isRunning={isRunning}
    />
  );
}

function OfficialBalance({
  providerId,
  updatedAt,
  isRunning,
}: {
  providerId: string;
  updatedAt: string;
  isRunning: boolean;
}) {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now);
  const [pricingVariant, setPricingVariant] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setNow(Date.now());
          schedule();
        },
        60_000 - (Date.now() % 60_000),
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  const period = getDeepSeekPricingPeriod(new Date(now));
  const balance = useQuery({
    queryKey: ["deepseek-balance", providerId, updatedAt],
    queryFn: async () =>
      (
        await apiClient.get<BalanceResponse>(
          `/model-providers/${encodeURIComponent(providerId)}/balance`,
        )
      ).data,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: false,
  });
  const wasRunning = useRef(isRunning);
  const { refetch } = balance;
  useEffect(() => {
    if (wasRunning.current && !isRunning) void refetch();
    wasRunning.current = isRunning;
  }, [isRunning, refetch]);
  const amounts = balance.data?.balance_infos ?? [];
  const details = amounts
    .map((item) =>
      t("assistant.deepseekBalanceDetails", {
        currency: item.currency,
        total: item.total_balance,
        granted: item.granted_balance,
        toppedUp: item.topped_up_balance,
      }),
    )
    .join("\n");
  const description = balance.isError
    ? t("assistant.deepseekBalanceError")
    : `${t("assistant.deepseekBalanceAccount")}\n${details}${balance.data?.is_available === false ? `\n${t("assistant.deepseekBalanceUnavailable")}` : ""}`;
  const pricingKey = `assistant.deepseekPricing${period === "peak" ? "Peak" : "OffPeak"}${pricingVariant === 0 ? "" : pricingVariant + 1}`;
  return (
    <Tooltip
      onOpenChange={(open) => {
        if (open) {
          setNow(Date.now());
          setPricingVariant(Math.floor(Math.random() * 5));
        }
      }}
      content={
        <Flex
          as="span"
          direction="column"
          gap="2"
          style={{ maxWidth: 320 }}
        >
          <Text weight="medium">{t(pricingKey)}</Text>
          <Text size="1">{t("assistant.deepseekPricingSchedule")}</Text>
          <Text
            size="1"
            style={{ whiteSpace: "pre-line" }}
          >
            {description}
          </Text>
        </Flex>
      }
    >
      <button
        type="button"
        className="ai-sidebar-balance ai-sidebar-token-metric"
        onClick={() => {
          if (!balance.isFetching) void balance.refetch();
        }}
        aria-disabled={balance.isFetching}
        aria-label={t("assistant.deepseekBalanceRefresh")}
      >
        <Text
          as="span"
          size="1"
        >
          {t("assistant.deepseekBalance")}{" "}
          {balance.isError
            ? "—"
            : balance.isPending
              ? "…"
              : amounts.length === 0
                ? "—"
                : amounts
                    .map((item) => `${item.currency === "CNY" ? "¥" : "$"}${item.total_balance}`)
                    .join(" / ")}
        </Text>
      </button>
    </Tooltip>
  );
}
