import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function SectionCard({ title, subtitle, children, actions }: SectionCardProps) {
  return (
    <section className="section-card">
      <header className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="section-actions">{actions}</div>}
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}
