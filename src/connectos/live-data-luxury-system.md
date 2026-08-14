# ConnectOS — Live Intelligence + Luxury Visual System

## Visual direction
ConnectOS should feel like a private intelligence terminal designed by a world-class luxury digital studio, not a generic AI SaaS dashboard.

### Luxury palette families
- Obsidian / Champagne: near-black surfaces, warm ivory typography, restrained champagne accents.
- Midnight / Platinum: deep midnight surfaces, cool platinum text, subtle silver highlights.
- Espresso / Gold: dark espresso surfaces, warm cream typography, muted antique-gold accents.
- Forest / Ivory: deep forest surfaces, ivory typography, restrained mineral-gold accents.
- Burgundy / Pearl: dark burgundy surfaces, pearl typography, muted rose-metal accents.

Users can switch themes instantly. Keep contrast accessible and avoid neon colors, rainbow gradients, excessive glass, or overdecorated cards.

## Motion language
- cinematic page entrances
- slow ambient background movement
- elegant section reveals
- responsive hover depth
- subtle magnetic controls
- smooth chart transitions
- intelligent loading shimmer
- micro-interactions that communicate state
- reduced-motion mode

Motion must remain fast and purposeful. No distracting perpetual animation.

## Live intelligence architecture
Create provider interfaces for:
- X/Twitter public data/news integration
- Instagram public profile/content metadata where the official API permits it
- market and financial data providers
- company/business data
- public professional directories
- public news sources

### Security
- Never expose provider secrets in the browser.
- All external APIs go through a server-side/provider layer.
- Use environment variables for credentials.
- Apply rate limits, retries, caching, freshness timestamps, and provider health checks.
- Clearly attribute sources.
- Never scrape private accounts or private data.
- Respect each platform's API permissions, terms, and rate limits.

## 24/7 intelligence behavior
The platform should continuously refresh eligible public data through server-side jobs/webhooks where supported. If a source is unavailable, show the last successful update time and gracefully fall back to cached data rather than pretending it is live.

## Product behavior
Live data feeds:
- personalized Feed
- company intelligence
- professional discovery
- leaderboards
- opportunities
- networking suggestions
- AI assistant context
- market/news briefing

Every user receives a different intelligence layer based on onboarding goals, industry, location, skills, risk tolerance, and interests.

## Quality bar
The final experience must look expensive, calm, cinematic, intelligent, and highly intentional. Avoid the common AI-app look: excessive purple gradients, glowing blobs, giant rounded cards everywhere, generic robot imagery, and dashboard clutter.