import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		/* Mono throughout. `sans` and `mono` both resolve to the text face so
  		   existing markup needs no churn; `display` is the characterful cut. */
  		fontFamily: {
  			sans: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  			mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  			display: ['var(--font-display)', 'var(--font-mono)', 'ui-monospace', 'monospace'],
  		},
  		/* The type scale — seven steps, each with a job. Replaces the 20 ad-hoc
  		   `text-[Npx]` sizes the first pass accumulated. */
  		fontSize: {
  			display: ['3.5rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
  			title: ['2rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  			stat: ['1.5rem', { lineHeight: '1', letterSpacing: '-0.01em' }],
  			lead: ['1.25rem', { lineHeight: '1.55' }],
  			body: ['0.875rem', { lineHeight: '1.4' }],
  			meta: ['0.75rem', { lineHeight: '1.35' }],
  			label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.06em' }]
  		},
  		keyframes: {
  			oneko: {
  				'0%, 50%': {
  					backgroundPosition: '-64px 0'
  				},
  				'50.0001%, 100%': {
  					backgroundPosition: '-64px -32px'
  				}
  			},
  		},
  		animation: {
  			oneko: 'oneko 1s infinite'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			/* `chart-1..5` used to live here pointing at --chart-* variables that
  			   were never defined in globals.css, so every one of them compiled to
  			   an invalid colour. Nothing consumed them. */
  			/* Dossier tokens — see the token table in globals.css */
  			faint: 'hsl(var(--faint))',
  			inset: 'hsl(var(--inset))',
  			rule: 'hsl(var(--rule))',
  			hair: 'hsl(var(--hair))',
  			track: 'hsl(var(--track))',
  			rowhover: 'hsl(var(--rowhover))',
  			field: 'hsl(var(--field))',
  			chip: 'hsl(var(--chip))',
  			flag: {
  				DEFAULT: 'hsl(var(--flag-bg))',
  				wash: 'hsl(var(--flag-wash))',
  				rule: 'hsl(var(--flag-rule))',
  				fg: 'hsl(var(--flag-fg))'
  			},
  			tier: {
  				'1': 'hsl(var(--tier-1))',
  				'2': 'hsl(var(--tier-2))',
  				'3': 'hsl(var(--tier-3))',
  				'4': 'hsl(var(--tier-4))'
  			}
  		},
  		/* Radius is 0 everywhere — rule 2, no exceptions. Overriding the whole
  		   scale rather than the token means a stray `rounded-md` inherited from a
  		   shadcn primitive renders square instead of having to be hunted down.
  		   `calc(var(--radius) - 2px)` would have produced an invalid -2px. */
  		borderRadius: {
  			none: '0',
  			sm: '0',
  			DEFAULT: '0',
  			md: '0',
  			lg: '0',
  			xl: '0',
  			'2xl': '0',
  			'3xl': '0',
  			full: '0'
  		}
  	}
  },
  /* `tailwind-clip-path` and `tailwindcss-textshadow` were loaded but never
     used — the sidebar's clip-path swipe uses core arbitrary-value syntax, and
     no element ever had a text shadow. Both npm deps are now unreferenced. */
  plugins: [require("tailwindcss-animate")],
};
export default config;
