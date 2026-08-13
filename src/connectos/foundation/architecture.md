# ConnectOS Foundation Architecture

## Principles
- Preserve existing functionality while extending the platform.
- Keep personalization as the central state that influences every recommendation.
- Separate UI, domain logic, data adapters, and external integrations.
- Treat public professional/company data as public or licensed data only.
- Never expose private personal information.

## Core domains
- Identity and profile
- Onboarding and goals
- Strategy and planning
- Career builder
- Business builder
- Opportunities
- Networking
- Circles
- Intelligence feed
- Company intelligence
- Notifications
- Subscriptions

## Navigation contract
Home, Strategy, Opportunities, Network, and Circles remain the primary navigation. Profile, search, notifications, settings, saved items, subscription, legal, and account deletion remain in the sidebar.

## Future integration boundary
External market, news, company, and professional data must enter through provider adapters. The AI layer consumes normalized records and produces personalized explanations and actions.
