import { GameProvider } from "./state/GameContext";
import { GamePage } from "./pages/GamePage";

export const App: React.FC = () => (
  <GameProvider>
    <GamePage />
  </GameProvider>
);
