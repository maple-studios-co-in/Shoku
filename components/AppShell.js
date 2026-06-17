import BottomNav from "./BottomNav";
import CartBar from "./CartBar";

// Mobile-first centered column. On desktop it sits in the middle of the canvas.
export default function AppShell({ children, nav = true }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      {nav && <CartBar />}
      {nav && <BottomNav />}
    </div>
  );
}
