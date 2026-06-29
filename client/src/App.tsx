import { useGame } from "./useGame";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Home } from "./screens/Home";
import { Lobby } from "./screens/Lobby";
import { Game } from "./screens/Game";
import { Vote } from "./screens/Vote";
import { Reveal } from "./screens/Reveal";
import { End } from "./screens/End";

export default function App() {
  const game = useGame();
  const { room, myId } = game;

  if (!game.connected && !room) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white/60">
          <div className="text-5xl anim-floaty">🕵️</div>
          <div className="animate-pulse">Connexion au serveur…</div>
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <AnimatedBackground />
        <Home onCreate={game.createRoom} onJoin={game.joinRoom} />
        <Toast error={game.error} />
      </>
    );
  }

  const isHost = room.you?.isHost ?? false;

  let screen;
  switch (room.phase) {
    case "lobby":
      screen = (
        <Lobby
          room={room}
          isHost={isHost}
          onAction={game.action}
          onLeave={game.leaveRoom}
        />
      );
      break;
    case "playing":
      screen = (
        <Game room={room} myId={myId} isHost={isHost} onAction={game.action} />
      );
      break;
    case "voting":
      screen = (
        <Vote room={room} myId={myId} isHost={isHost} onAction={game.action} />
      );
      break;
    case "reveal":
    case "misterwhite":
      screen = (
        <Reveal room={room} myId={myId} isHost={isHost} onAction={game.action} />
      );
      break;
    case "ended":
      screen = (
        <End
          room={room}
          isHost={isHost}
          onAction={game.action}
          onLeave={game.leaveRoom}
        />
      );
      break;
    default:
      screen = null;
  }

  return (
    <>
      <AnimatedBackground />
      <div key={room.phase} className="anim-fade-up">
        {screen}
      </div>
      <Toast error={game.error} />
    </>
  );
}

function Toast({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="anim-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 font-semibold text-white shadow-lg"
      style={{
        background: "linear-gradient(120deg, #ff2e9a, #b91c5c)",
        boxShadow: "0 10px 30px -6px rgba(255,46,154,0.7)",
      }}
    >
      ⚠️ {error}
    </div>
  );
}
