import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: string;
  children: ReactNode;
};

export function EmptyState({ title = "No records match these filters", children }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state__mark" aria-hidden="true">↳</span>
      <div><h3>{title}</h3><p>{children}</p></div>
    </div>
  );
}
