import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Pulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: "cobalt" | "green";
}

const PULSE_COLORS = {
  cobalt: { line: "0, 30, 201", dot: "36, 64, 240" },
  green: { line: "17, 116, 0", dot: "43, 190, 13" },
} as const;

const NODE_COUNT = 32;
const CONNECTION_DISTANCE = 180;
const PULSE_PROBABILITY = 0.012;

export default function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    const nodes: Node[] = [];
    const pulses: Pulse[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function seedNodes() {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius: 1.5 + Math.random() * 1.5,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnPulse() {
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      const dist = Math.hypot(
        nodes[from]!.x - nodes[to]!.x,
        nodes[from]!.y - nodes[to]!.y,
      );
      if (dist > CONNECTION_DISTANCE * 1.6) return;
      pulses.push({
        from,
        to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: Math.random() < 0.45 ? "green" : "cobalt",
      });
    }

    function step(t: number) {
      ctx!.clearRect(0, 0, width, height);

      // Theme-aware ink: bone dots on carbon, carbon dots on paper.
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const lineInk = isLight ? "42, 47, 56" : "212, 207, 196";
      const nodeInk = isLight ? "7, 8, 11" : "242, 239, 233";

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 25000) {
            const force = (25000 - distSq) / 25000;
            n.x -= (dx / Math.sqrt(distSq + 1)) * force * 1.2;
            n.y -= (dy / Math.sqrt(distSq + 1)) * force * 1.2;
          }
        }
        n.x += (n.baseX - n.x) * 0.005;
        n.y += (n.baseY - n.y) * 0.005;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.18;
            ctx!.strokeStyle = `rgba(${lineInk}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      if (Math.random() < PULSE_PROBABILITY) spawnPulse();

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]!;
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const a = nodes[p.from]!;
        const b = nodes[p.to]!;
        const x = a.x + (b.x - a.x) * p.progress;
        const y = a.y + (b.y - a.y) * p.progress;

        const c = PULSE_COLORS[p.color];
        const grad = ctx!.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `rgba(${c.line}, 0)`);
        grad.addColorStop(p.progress, `rgba(${c.line}, 0.85)`);
        grad.addColorStop(Math.min(1, p.progress + 0.05), `rgba(${c.line}, 0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();

        ctx!.fillStyle = `rgba(${c.dot}, 0.95)`;
        ctx!.shadowColor = `rgba(${c.dot}, 0.9)`;
        ctx!.shadowBlur = 12;
        ctx!.beginPath();
        ctx!.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      for (const n of nodes) {
        n.pulsePhase += 0.02;
        const pulse = (Math.sin(n.pulsePhase) + 1) / 2;
        ctx!.fillStyle = `rgba(${nodeInk}, ${0.55 + pulse * 0.35})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx!.fill();
        // alternating cobalt/green halo per node (deterministic by index)
        const isGreen = nodes.indexOf(n) % 3 === 0;
        const halo = isGreen ? "17, 116, 0" : "0, 30, 201";
        ctx!.strokeStyle = `rgba(${halo}, ${0.15 + pulse * 0.25})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius + 4 + pulse * 3, 0, Math.PI * 2);
        ctx!.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    resize();
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
