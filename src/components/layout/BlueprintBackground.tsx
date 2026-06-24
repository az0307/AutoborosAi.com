import { useRef, useEffect } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

class IsoEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  time: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number;
  rafId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.time = 0;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 1;
    this.rafId = 0;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener("resize", this.resize);
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.scale = Math.min(this.width, this.height) / 1000;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  project3D(x: number, y: number, z: number, rotation: number): Point2D {
    const rx = x * Math.cos(rotation) - z * Math.sin(rotation);
    const rz = x * Math.sin(rotation) + z * Math.cos(rotation);
    const sx = rx - y;
    const sy = rz * Math.sin(0.5236) + y * Math.cos(0.5236);
    return {
      x: this.centerX + sx * this.scale,
      y: this.centerY + sy * this.scale,
    };
  }

  drawLine(p1: Point2D, p2: Point2D, alpha: number, width: number) {
    this.ctx.shadowBlur = 0;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }

  drawFrame() {
    const rotation = this.time * 0.005;

    // House Base: wireframe cube
    // Bottom corners (y = 0)
    const b1: Point3D = { x: -100, y: 0, z: -100 };
    const b2: Point3D = { x: 100, y: 0, z: -100 };
    const b3: Point3D = { x: 100, y: 0, z: 100 };
    const b4: Point3D = { x: -100, y: 0, z: 100 };
    // Top corners (y = -120)
    const t1: Point3D = { x: -100, y: -120, z: -100 };
    const t2: Point3D = { x: 100, y: -120, z: -100 };
    const t3: Point3D = { x: 100, y: -120, z: 100 };
    const t4: Point3D = { x: -100, y: -120, z: 100 };

    const pb1 = this.project3D(b1.x, b1.y, b1.z, rotation);
    const pb2 = this.project3D(b2.x, b2.y, b2.z, rotation);
    const pb3 = this.project3D(b3.x, b3.y, b3.z, rotation);
    const pb4 = this.project3D(b4.x, b4.y, b4.z, rotation);
    const pt1 = this.project3D(t1.x, t1.y, t1.z, rotation);
    const pt2 = this.project3D(t2.x, t2.y, t2.z, rotation);
    const pt3 = this.project3D(t3.x, t3.y, t3.z, rotation);
    const pt4 = this.project3D(t4.x, t4.y, t4.z, rotation);

    // Bottom perimeter
    this.drawLine(pb1, pb2, 0.1, 1);
    this.drawLine(pb2, pb3, 0.1, 1);
    this.drawLine(pb3, pb4, 0.1, 1);
    this.drawLine(pb4, pb1, 0.1, 1);
    // Top perimeter
    this.drawLine(pt1, pt2, 0.1, 1);
    this.drawLine(pt2, pt3, 0.1, 1);
    this.drawLine(pt3, pt4, 0.1, 1);
    this.drawLine(pt4, pt1, 0.1, 1);
    // Verticals
    this.drawLine(pb1, pt1, 0.1, 1);
    this.drawLine(pb2, pt2, 0.1, 1);
    this.drawLine(pb3, pt3, 0.1, 1);
    this.drawLine(pb4, pt4, 0.1, 1);

    // Roof Structure: A-frame
    // Ridge line endpoints
    const ridge1: Point3D = { x: -100, y: -180, z: 0 };
    const ridge2: Point3D = { x: 100, y: -180, z: 0 };
    const pr1 = this.project3D(ridge1.x, ridge1.y, ridge1.z, rotation);
    const pr2 = this.project3D(ridge2.x, ridge2.y, ridge2.z, rotation);

    // 8 slanted roof edges + 2 ridge lines
    this.drawLine(pt1, pr1, 0.15, 1.5);
    this.drawLine(pt2, pr2, 0.15, 1.5);
    this.drawLine(pt3, pr2, 0.15, 1.5);
    this.drawLine(pt4, pr1, 0.15, 1.5);
    this.drawLine(pr1, pr2, 0.15, 1.5);

    // Gable end diagonals
    this.drawLine(pt1, pt2, 0.12, 1);
    this.drawLine(pt3, pt4, 0.12, 1);

    // Cross-bracing inside roof volume (6 diagonals)
    this.drawLine(
      this.project3D(-50, -150, -50, rotation),
      this.project3D(50, -150, 50, rotation),
      0.08,
      0.5
    );
    this.drawLine(
      this.project3D(50, -150, -50, rotation),
      this.project3D(-50, -150, 50, rotation),
      0.08,
      0.5
    );
    this.drawLine(
      this.project3D(-75, -135, -75, rotation),
      this.project3D(75, -135, 75, rotation),
      0.08,
      0.5
    );
    this.drawLine(
      this.project3D(75, -135, -75, rotation),
      this.project3D(-75, -135, 75, rotation),
      0.08,
      0.5
    );
    this.drawLine(
      this.project3D(0, -165, -80, rotation),
      this.project3D(0, -165, 80, rotation),
      0.08,
      0.5
    );
    this.drawLine(
      this.project3D(-80, -165, 0, rotation),
      this.project3D(80, -165, 0, rotation),
      0.08,
      0.5
    );
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawFrame();
    this.time += 1;
    this.rafId = requestAnimationFrame(this.render);
  }

  start() {
    this.render();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.resize);
  }
}

export default function BlueprintBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new IsoEngine(canvasRef.current);
    engine.start();
    return () => engine.stop();
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "10%",
          background: "linear-gradient(to bottom, transparent 0%, #09090B 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
