import { useCallback, useEffect, useRef, useState } from "react";

interface Particle {
	id: number;
	text: string;
	rotation: number;
}

interface ParticlePhysics {
	x: number;
	y: number;
	vx: number;
	vy: number;
	el: HTMLSpanElement | null;
}

const COPIES_PER_BURST = 8;
const LIFETIME_MS = 2500;
const VIEWPORT_MARGIN = 24;
const BASE_SPEED_MIN = 80;
const BASE_SPEED_MAX = 240;
const SPEED_MULTIPLIER = 6;
const ROTATION_SPEED_MULTIPLIER = 0.1;
const MAX_FRAME_DELTA_S = 0.05;

type Listener = (text: string, x: number, y: number) => void;

const listeners = new Set<Listener>();
let nextParticleId = 0;

export function explodeText(text: string, x: number, y: number) {
	for (const listener of listeners) {
		listener(text, x, y);
	}
}

function randomSign() {
	return Math.random() < 0.5 ? -1 : 1;
}

function createParticle(text: string): {
	particle: Particle;
	physics: Omit<ParticlePhysics, "x" | "y" | "el">;
} {
	const angle = Math.random() * Math.PI * 2;
	const speed =
		(BASE_SPEED_MIN + Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN)) *
		SPEED_MULTIPLIER;

	return {
		particle: {
			id: nextParticleId++,
			text,
			rotation:
				randomSign() *
				360 *
				(2 + Math.random() * 2) *
				ROTATION_SPEED_MULTIPLIER,
		},
		physics: {
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
		},
	};
}

export function TextExplosionLayer() {
	const [particles, setParticles] = useState<Particle[]>([]);
	const physicsRef = useRef(new Map<number, ParticlePhysics>());
	const rafRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number | null>(null);

	const attachParticleEl = useCallback(
		(id: number, el: HTMLSpanElement | null) => {
			const physics = physicsRef.current.get(id);
			if (!physics) {
				return;
			}
			physics.el = el;
			if (el) {
				el.style.transform = `translate(-50%, -50%) translate(${physics.x}px, ${physics.y}px)`;
			}
		},
		[],
	);

	useEffect(() => {
		const tick = (time: number) => {
			const last = lastTimeRef.current ?? time;
			const dt = Math.min((time - last) / 1000, MAX_FRAME_DELTA_S);
			lastTimeRef.current = time;

			const maxX = window.innerWidth - VIEWPORT_MARGIN;
			const maxY = window.innerHeight - VIEWPORT_MARGIN;

			for (const physics of physicsRef.current.values()) {
				physics.x += physics.vx * dt;
				physics.y += physics.vy * dt;

				if (physics.x < VIEWPORT_MARGIN) {
					physics.x = VIEWPORT_MARGIN;
					physics.vx = Math.abs(physics.vx);
				} else if (physics.x > maxX) {
					physics.x = maxX;
					physics.vx = -Math.abs(physics.vx);
				}

				if (physics.y < VIEWPORT_MARGIN) {
					physics.y = VIEWPORT_MARGIN;
					physics.vy = Math.abs(physics.vy);
				} else if (physics.y > maxY) {
					physics.y = maxY;
					physics.vy = -Math.abs(physics.vy);
				}

				if (physics.el) {
					physics.el.style.transform = `translate(-50%, -50%) translate(${physics.x}px, ${physics.y}px)`;
				}
			}

			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const listener: Listener = (text, x, y) => {
			const burst = Array.from({ length: COPIES_PER_BURST }, () =>
				createParticle(text),
			);

			for (const { particle, physics } of burst) {
				physicsRef.current.set(particle.id, { ...physics, x, y, el: null });
			}

			setParticles((prev) => [...prev, ...burst.map((b) => b.particle)]);

			const burstIds = new Set(burst.map((b) => b.particle.id));
			window.setTimeout(() => {
				setParticles((prev) =>
					prev.filter((particle) => !burstIds.has(particle.id)),
				);
				for (const id of burstIds) {
					physicsRef.current.delete(id);
				}
			}, LIFETIME_MS);
		};
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);

	if (particles.length === 0) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
			{particles.map((particle) => (
				<span
					key={particle.id}
					ref={(el) => attachParticleEl(particle.id, el)}
					className="text-explosion-particle"
					style={
						{ animationDuration: `${LIFETIME_MS}ms` } as React.CSSProperties
					}
				>
					<span
						className="text-explosion-particle-inner"
						style={
							{
								animationDuration: `${LIFETIME_MS}ms`,
								"--rot": `${particle.rotation}deg`,
							} as React.CSSProperties
						}
					>
						{particle.text}
					</span>
				</span>
			))}
		</div>
	);
}
