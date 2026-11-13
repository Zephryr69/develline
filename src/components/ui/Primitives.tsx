"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { LuCircleAlert, LuInfo, LuTriangleAlert } from "react-icons/lu";
import styles from "./Primitives.module.css";

type Tone = "ok" | "warn" | "error" | "neutral";

export function PageHead({
  crumb,
  title,
  description,
  action,
}: {
  crumb: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.pageHead}>
      <div>
        <div className={styles.crumb}>{crumb}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  maxWidth,
  as: Tag = "div",
  onSubmit,
  id,
  spaced,
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: number;
  as?: "div" | "form";
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  id?: string;
  spaced?: boolean;
}) {
  return (
    <Tag
      id={id}
      onSubmit={onSubmit as never}
      className={`${styles.panel} ${className}`}
      style={{ maxWidth, marginTop: spaced ? 16 : undefined }}
    >
      {children}
    </Tag>
  );
}

export function PanelHead({ children }: { children: React.ReactNode }) {
  return <div className={styles.panelHead}>{children}</div>;
}

export function Grid2({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid2}>{children}</div>;
}

export function Stack({ children }: { children: React.ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}

export function MiniLabel({ children }: { children: React.ReactNode }) {
  return <div className={styles.miniLabel}>{children}</div>;
}

export function Metric({ children }: { children: React.ReactNode }) {
  return <div className={styles.metric}>{children}</div>;
}

export function Badge({ children, tone = "ok" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`${styles.badge} ${tone !== "ok" ? styles[tone] : ""}`}>{children}</span>;
}

export function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" | "error" }) {
  const Icon = tone === "error" ? LuCircleAlert : tone === "warn" ? LuTriangleAlert : LuInfo;
  return (
    <div className={`${styles.notice} ${tone !== "ok" ? styles[`notice_${tone}`] : ""}`} role={tone === "error" ? "alert" : "status"}>
      <Icon />
      <span>{children}</span>
    </div>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.formGrid}>{children}</div>;
}

export function Field({
  label,
  htmlFor,
  full,
  hint,
  children,
}: {
  label?: string;
  htmlFor?: string;
  full?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function FormActions({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <div className={styles.formActions} style={center ? { justifyContent: "center" } : undefined}>{children}</div>;
}

export function ListRow({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return <div className={`${styles.listRow} ${wrap ? styles.wrap : ""}`}>{children}</div>;
}

export function RowMain({ title, sub, mono }: { title: React.ReactNode; sub?: React.ReactNode; mono?: boolean }) {
  return (
    <div className={styles.rowMain}>
      <div className={`${styles.rowTitle} ${mono ? "mono" : ""}`}>{title}</div>
      {sub && <div className={styles.rowSub}>{sub}</div>}
    </div>
  );
}

export function RowSub({ children, top }: { children: React.ReactNode; top?: number }) {
  return <div className={styles.rowSub} style={top ? { marginTop: top } : undefined}>{children}</div>;
}

export function Avatar({ initials, size }: { initials: string; size?: "lg" }) {
  return <div className={`${styles.avatar} ${size === "lg" ? styles.avatarLg : ""}`}>{initials}</div>;
}

export function ProjectIcon({ icon: Icon }: { icon: IconType }) {
  return (
    <div className={styles.projectIcon}>
      <Icon />
    </div>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className={styles.tags}>
      {tags.map((t) => (
        <span key={t} className={styles.tag}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className={styles.progress} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <motion.span initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
    </div>
  );
}

export function ProgressLabel({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className={styles.progressLabel}>
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <Icon />
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function Paragraph({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <p className={`${styles.p} ${small ? styles.small : ""}`}>{children}</p>;
}
