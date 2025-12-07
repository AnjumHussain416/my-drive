import { Logo } from "@/public/assets";
export const dynamic = "force-static";
export default function Home() {
  return (
    <div
      className="relative w-full min-h-screen"
      style={{
        // Composite background: a light gray -> white -> light gray sweep,
        // with a radial white center to blend the logo's white background.
        background:
          "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(210,210,210,0.8) 0%, rgba(255,255,255,1) 50%, rgba(226,232,240,0.95) 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={Logo.src} width={360} height={360} alt="Good-Logo" />
      </div>
    </div>
  );
}
