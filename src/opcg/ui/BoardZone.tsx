import type { ReactNode } from "react";

type BoardZoneProps = {
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
};

export function BoardZone({ title, count, children, className = "" }: BoardZoneProps) {
  return (
    <section className={`board-zone ${className}`}>
      <div className="zone-label">
        <span>{title}</span>
        {count !== undefined && <b>{count}</b>}
      </div>
      <div className="zone-content">{children}</div>
    </section>
  );
}
