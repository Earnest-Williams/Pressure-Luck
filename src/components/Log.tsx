import { Card } from "./Card";

interface LogProps {
  entries: string[];
}

export const Log: React.FC<LogProps> = ({ entries }) => (
  <Card title="Log">
    <ul className="space-y-1 text-sm text-white/80">
      {entries.map((entry, idx) => (
        <li key={idx}>• {entry}</li>
      ))}
    </ul>
  </Card>
);
