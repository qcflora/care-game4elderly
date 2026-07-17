<template>
  <canvas ref="canvasRef" class="particle-field" :class="{ 'is-home': variant === 'home' }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  color: string;
}

const props = defineProps<{
  variant?: 'home' | 'game';
}>();

const variant = props.variant ?? 'home';
const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let rafId: number | null = null;
let particles: Particle[] = [];
let width = 0;
let height = 0;

const HOME_COLORS = ['#F2B705', '#FFE082', '#FFF8E1'];
const GAME_COLORS = ['#FFF8E1', '#FFE082', '#F5F0E6'];

function getParticleCount(): number {
  const w = window.innerWidth;
  if (w < 400) return variant === 'home' ? 25 : 18;
  if (w < 768) return variant === 'home' ? 32 : 22;
  return variant === 'home' ? 40 : 28;
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createParticle(resetY = false): Particle {
  const colors = variant === 'home' ? HOME_COLORS : GAME_COLORS;
  return {
    x: randomRange(0, width),
    y: resetY ? height + randomRange(0, 20) : randomRange(0, height),
    radius: randomRange(2, 5),
    opacity: randomRange(0.15, 0.4),
    speed: randomRange(0.3, 0.8),
    swayFreq: randomRange(0.005, 0.015),
    swayAmp: randomRange(0.3, 1.2),
    swayPhase: randomRange(0, Math.PI * 2),
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function initParticles() {
  particles = [];
  const count = getParticleCount();
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  initParticles();
}

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function update() {
  for (const p of particles) {
    p.y -= p.speed;
    p.x += Math.sin(p.y * p.swayFreq + p.swayPhase) * p.swayAmp * 0.1;

    if (p.y < -10) {
      Object.assign(p, createParticle(true));
    }
  }
}

function animate() {
  update();
  draw();
  rafId = requestAnimationFrame(animate);
}

function start() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(animate);
}

function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  resize();
  window.addEventListener('resize', resize);
  start();
});

onUnmounted(() => {
  stop();
  window.removeEventListener('resize', resize);
});
</script>

<style scoped>
.particle-field {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}

.particle-field.is-home {
  z-index: 0;
}

@media (prefers-reduced-motion: reduce) {
  .particle-field {
    display: none;
  }
}
</style>
