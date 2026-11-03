import type { ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  className?: string;
}

export function Table({
  children,
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  className = "",
  ...props
}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={`
          w-full text-left text-sm font-mono
          ${bordered ? "border border-border" : "border-collapse"}
          ${className}
        `}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function TableHeader({ children, sticky = false, className = "", ...props }: TableHeaderProps) {
  return (
    <thead
      className={`
        bg-surface-elevated border-b border-border
        ${sticky ? "sticky top-0 z-[var(--z-sticky)]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "", ...props }: TableBodyProps) {
  return <tbody className={`divide-y divide-border ${className}`} {...props}>{children}</tbody>;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  selected?: boolean;
  clickable?: boolean;
  hoverable?: boolean;
  className?: string;
}

export function TableRow({
  children,
  selected = false,
  clickable = false,
  hoverable = true,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`
        transition-colors duration-fast
        ${selected ? "bg-court-green-50 dark:bg-court-green-900/20" : ""}
        ${hoverable && !selected ? "hover:bg-surface-sunken hover:border-l-4 hover:border-court-green-500" : ""}
        ${clickable ? "cursor-pointer select-none" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function TableHead({
  children,
  width,
  align = "left",
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <th
      scope="col"
      style={{ width }}
      className={`
        px-4 py-3 font-semibold text-text-secondary uppercase tracking-wider text-xs
        text-${align}
        ${className}
      `}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function TableCell({
  children,
  align = "left",
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      className={`
        px-4 py-3 text-text-primary tabular-nums
        text-${align}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  colSpan: number;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function TableEmpty({ colSpan, title, description, action, className = "" }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={`py-12 text-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-medium text-text-primary">{title}</p>
          {description && <p className="text-sm text-text-secondary">{description}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

interface TableLoadingProps {
  colSpan: number;
  rows?: number;
  className?: string;
}

export function TableLoading({ colSpan, rows = 5, className = "" }: TableLoadingProps) {
  return (
    <tbody className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={colSpan} className="px-4 py-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded skeleton" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}