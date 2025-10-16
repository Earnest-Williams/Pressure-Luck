import type { PropsWithChildren, ReactNode } from "react";

export type CardProps = PropsWithChildren<{
  title: string;
  footer?: ReactNode;
}>;

const Card: React.FC<CardProps> = ({ title, footer, children }) => (
  <div className="card">
    <div className="card-title">{title}</div>
    <div>{children}</div>
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

export default Card;
