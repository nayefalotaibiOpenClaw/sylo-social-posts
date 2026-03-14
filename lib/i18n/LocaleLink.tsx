"use client";

import Link from "next/link";
import { useLocale } from "./context";
import { localizeHref } from "./utils";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export default function LocaleLink({ href, ...props }: LinkProps) {
  const { locale } = useLocale();
  const localizedHref =
    typeof href === "string" ? localizeHref(href, locale) : href;
  return <Link href={localizedHref} {...props} />;
}
