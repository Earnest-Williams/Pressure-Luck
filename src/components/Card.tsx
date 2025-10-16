import { PropsWithChildren, ReactNode } from "react";

interface CardProps {
  title: string;
  footer?: ReactNode;
}

export const Card: React.FC<PropsWithChildren<CardProps>> = ({ title, children, footer }) => (
  <div className="rounded-2xl shadow-lg p-4 bg-white/5 border border-white/10">
    <div className="text-sm uppercase tracking-wide text-white/70 mb-2">{title}</div>
    <div>{children}</div>
    {footer && <div className="mt-3 pt-3 border-t border-white/10 text-sm">{footer}</div>}
  </div>
);
