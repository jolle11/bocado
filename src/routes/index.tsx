import "../landing.css";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Camera,
	Check,
	Heart,
	LockKeyhole,
	Share2,
	Sparkles,
	UtensilsCrossed,
} from "lucide-react";
import { pb } from "#/lib/pocketbase";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title:
					"Bocado | Tu diario de comidas para compartir con tu nutricionista",
			},
			{
				name: "description",
				content:
					"Registra tus comidas de forma sencilla, consulta tu historial y comparte tu diario con tu nutricionista. Empieza gratis con Bocado.",
			},
			{ property: "og:title", content: "Bocado | Tu diario de comidas" },
			{
				property: "og:description",
				content:
					"Un espacio sencillo para registrar lo que comes y compartirlo con tu nutricionista.",
			},
			{ property: "og:locale", content: "es_ES" },
			{ property: "og:image", content: "/logo512.png" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: LandingPage,
});

function LandingPage() {
	const isLoggedIn = typeof window !== "undefined" && pb.authStore.isValid;
	const primaryTo = isLoggedIn ? "/app" : "/register";
	return (
		<div className="landing">
			<header className="landing-nav">
				<Link to="/" className="landing-brand" aria-label="Bocado, inicio">
					<span className="landing-brand-logo">
						<img src="/apple-touch-icon.png" alt="" width="40" height="40" />
					</span>
					<span className="landing-brand-name">bocado</span>
				</Link>
				<nav aria-label="Navegación principal" className="landing-nav-links">
					<a href="#como-funciona">Cómo funciona</a>
					<a href="#para-ti">Para ti</a>
				</nav>
				<Link to={isLoggedIn ? "/app" : "/login"} className="landing-login">
					{isLoggedIn ? "Abrir diario" : "Iniciar sesión"}{" "}
					<ArrowRight size={16} />
				</Link>
			</header>

			<main>
				<section className="landing-hero" aria-labelledby="hero-title">
					<div className="landing-hero-copy">
						<span className="landing-eyebrow">
							<span className="landing-eyebrow-star">✳</span> TU ALIMENTACIÓN,
							MÁS CLARA
						</span>
						<h1 id="hero-title">
							Comer es vivir.
							<br />
							<em>Recordarlo,</em>
							<br />
							más fácil.
						</h1>
						<p>
							Tu diario de comidas, sin complicaciones. Guarda lo que comes,
							reconoce tus hábitos y compártelo con tu nutricionista cuando lo
							necesites.
						</p>
						<div className="landing-actions">
							<Link to={primaryTo} className="landing-button">
								{isLoggedIn ? "Ir a mi diario" : "Empezar gratis"}
								<ArrowRight size={19} />
							</Link>
							<a href="#como-funciona" className="landing-text-link">
								Descubre cómo funciona <span aria-hidden="true">↗</span>
							</a>
						</div>
						<div className="landing-reassurance">
							<span>
								<Check size={14} /> Fácil de usar
							</span>
							<span>
								<Check size={14} /> A tu ritmo
							</span>
							<span>
								<Check size={14} /> Datos bajo tu control
							</span>
						</div>
					</div>
					<div
						className="landing-hero-art"
						role="img"
						aria-label="Ejemplo del diario de comidas de Bocado"
					>
						<div className="landing-orbit landing-orbit-one" />
						<div className="landing-orbit landing-orbit-two" />
						<span className="landing-decoration landing-decoration-one">✳</span>
						<span className="landing-decoration landing-decoration-two">✴</span>
						<div className="landing-phone">
							<div className="landing-phone-top">
								<span>9:41</span>
								<span>●●●</span>
							</div>
							<div className="landing-phone-content">
								<span className="landing-phone-date">
									VIERNES, 25 DE SEPTIEMBRE
								</span>
								<h2>
									Hola, Bruc <span>👋</span>
								</h2>
								<p>Tu día, bocado a bocado.</p>
								<div className="landing-meal-card">
									<span className="landing-meal-emoji">🥑</span>
									<div>
										<small>DESAYUNO · 08:30</small>
										<strong>Tostadas con aguacate</strong>
										<span>Un buen comienzo de día</span>
									</div>
								</div>
								<div className="landing-meal-card">
									<span className="landing-meal-emoji">🥗</span>
									<div>
										<small>COMIDA · 14:15</small>
										<strong>Ensalada mediterránea</strong>
										<span>Fresca y colorida</span>
									</div>
								</div>
								<div className="landing-add">
									<span>＋</span> Añadir comida
								</div>
							</div>
						</div>
						<div className="landing-floating-note">
							<span className="landing-floating-icon">
								<Heart size={18} fill="currentColor" />
							</span>
							<span>
								Pequeños registros.
								<br />
								<strong>Grandes avances.</strong>
							</span>
						</div>
					</div>
				</section>

				<section
					id="como-funciona"
					className="landing-section landing-how"
					aria-labelledby="how-title"
				>
					<div className="landing-section-intro">
						<span className="landing-eyebrow">ASÍ DE SENCILLO</span>
						<h2 id="how-title">
							Un diario que se adapta <em>a ti.</em>
						</h2>
						<p>
							Menos tiempo apuntando. Más claridad para entender tu
							alimentación.
						</p>
					</div>
					<div className="landing-steps">
						<article>
							<span className="landing-step-icon">
								<Camera size={25} />
							</span>
							<span className="landing-step-number">01</span>
							<h3>Registra tus comidas</h3>
							<p>
								Apunta lo que has comido con una foto o una breve descripción.
								Sin cálculos ni reglas complicadas.
							</p>
						</article>
						<article>
							<span className="landing-step-icon">
								<Sparkles size={25} />
							</span>
							<span className="landing-step-number">02</span>
							<h3>Mira tu recorrido</h3>
							<p>
								Vuelve a tus registros por día o por semana y descubre tus
								hábitos con perspectiva.
							</p>
						</article>
						<article>
							<span className="landing-step-icon">
								<Share2 size={25} />
							</span>
							<span className="landing-step-number">03</span>
							<h3>Compártelo fácilmente</h3>
							<p>
								Crea un enlace para que tu nutricionista vea el periodo que
								elijas, cuando tú decidas.
							</p>
						</article>
					</div>
				</section>

				<section
					id="para-ti"
					className="landing-benefit"
					aria-labelledby="benefit-title"
				>
					<div className="landing-benefit-art">
						<div className="landing-plate">
							<span>🍅</span>
							<span>🥬</span>
							<span>🥑</span>
							<span>🍋</span>
						</div>
						<div className="landing-benefit-sticker">
							Hecho para
							<br />
							<em>tu día a día</em> ✳
						</div>
					</div>
					<div className="landing-benefit-copy">
						<span className="landing-eyebrow">UN ESPACIO PARA TI</span>
						<h2 id="benefit-title">
							Tu historia con la comida merece verse <em>completa.</em>
						</h2>
						<p>
							Un registro cotidiano puede hacer más fáciles las conversaciones
							con tu nutricionista. Bocado mantiene tus comidas ordenadas y
							accesibles, para que puedas compartir el contexto que importa.
						</p>
						<div className="landing-benefit-points">
							<span>
								<LockKeyhole size={19} /> Tú decides qué compartes
							</span>
							<span>
								<Heart size={19} /> Sin juicios ni presión
							</span>
							<span>
								<UtensilsCrossed size={19} /> Todo en un mismo lugar
							</span>
						</div>
						<Link to={primaryTo} className="landing-inline-link">
							{isLoggedIn ? "Abrir mi diario" : "Crear mi diario"}{" "}
							<ArrowRight size={19} />
						</Link>
					</div>
				</section>

				<section className="landing-cta" aria-labelledby="cta-title">
					<span className="landing-cta-spark" aria-hidden="true">
						{"\u2733\uFE0E"}
					</span>
					<span className="landing-eyebrow">EMPIEZA HOY</span>
					<h2 id="cta-title">
						Cada bocado cuenta
						<br />
						<em>una historia.</em>
					</h2>
					<p>Empieza a escribir la tuya. Un registro a la vez.</p>
					<Link to={primaryTo} className="landing-button landing-button-light">
						{isLoggedIn ? "Ir a mi diario" : "Crear cuenta gratis"}
						<ArrowRight size={19} />
					</Link>
				</section>
			</main>
			<footer className="landing-footer">
				<Link to="/" className="landing-brand">
					<span className="landing-brand-logo">
						<img src="/apple-touch-icon.png" alt="" width="40" height="40" />
					</span>
					<span className="landing-brand-name">bocado</span>
				</Link>
				<span>Tu diario de comidas, a tu manera.</span>
				<span>© {new Date().getFullYear()} Bocado</span>
			</footer>
		</div>
	);
}
