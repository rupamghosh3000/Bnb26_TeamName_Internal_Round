# StockPulse --- 3D Visual Design System

## Reference: Uploaded Website Design Video

This design specification is based directly on the uploaded reference
website video.

The reference uses: - a very light lavender/lilac ambient background -
large white rounded content surfaces - a restrained purple visual
language - oversized modern typography - generous whitespace -
floating/soft 3D visual objects - rounded cards - editorial-style
layouts rather than dense dashboard layouts - smooth section-to-section
scrolling - subtle depth, glow, blur and elevation - minimal
navigation - large visual storytelling sections - image/3D compositions
integrated into cards - FAQ and footer sections with clean spacing

StockPulse should **take this visual language and interaction
philosophy**, but it must not copy the reference site's branding, text,
assets, logo, or exact layouts.

The result should feel like a **premium 3D financial intelligence
product**, not a generic trading dashboard.

------------------------------------------------------------------------

# 1. Core Design Direction

## Design concept

**"A calm 3D financial intelligence space."**

StockPulse should visually communicate that market data is a living
environment.

Instead of presenting everything as flat cards, the interface should
create depth using:

-   floating market objects
-   layered translucent surfaces
-   3D market spheres/orbs
-   floating stock symbols
-   depth-based charts
-   glass-like panels
-   soft purple atmospheric lighting
-   subtle parallax
-   scroll-driven motion
-   perspective transforms
-   animated data particles

The 3D should support information hierarchy.

Do NOT add 3D simply for decoration.

------------------------------------------------------------------------

# 2. Visual Personality

The website should feel:

-   premium
-   futuristic but not "cyberpunk"
-   financial
-   educational
-   calm
-   intelligent
-   sophisticated
-   spacious
-   trustworthy
-   highly polished

Avoid:

-   crypto-dashboard aesthetics
-   excessive neon
-   black terminal interfaces
-   bright gaming colors
-   overly aggressive red/green trading screens
-   excessive gradients
-   excessive glassmorphism
-   generic AI-generated dashboard layouts
-   dozens of equally sized cards

------------------------------------------------------------------------

# 3. Color System

The primary visual environment should follow the reference's soft
lavender atmosphere.

### Background

Primary background:

`#F2EEFF`

Use a very subtle lavender/white gradient rather than a hard solid
color.

Suggested atmosphere:

``` css
background:
  radial-gradient(
    circle at 50% 0%,
    rgba(255,255,255,0.95),
    rgba(238,232,255,0.92) 45%,
    rgba(225,215,255,0.88) 100%
  );
```

Do not make every section a different gradient.

------------------------------------------------------------------------

## Surface

Primary surface:

`#FFFFFF`

Secondary surface:

`#FAF9FF`

Use large white surfaces against the lavender environment.

------------------------------------------------------------------------

## Primary Purple

Use purple as the main brand/action color.

Suggested range:

-   Deep Purple: `#4B1FA8`
-   Primary Purple: `#6736C7`
-   Soft Purple: `#9A78E8`
-   Lavender: `#D9CCFF`

Purple should be used primarily for:

-   primary CTA
-   active navigation
-   selected states
-   important chart highlights
-   3D lighting
-   AI accents

------------------------------------------------------------------------

## Text

Primary:

`#111018`

Secondary:

`#5E5A69`

Muted:

`#9B97A5`

Do not use pure black everywhere.

------------------------------------------------------------------------

## Financial states

Use color carefully.

Positive: - restrained green

Negative: - restrained red

Neutral: - muted gray/purple

The interface must never rely on color alone.

Example:

`+₹12,450  ↑  +2.41%`

rather than communicating positive performance only through green.

------------------------------------------------------------------------

# 4. Typography

The reference relies heavily on large, clean, geometric typography.

Use a modern sans-serif such as:

-   Inter
-   Manrope
-   Geist
-   Plus Jakarta Sans

Preferred direction:

**Manrope / Inter style**

### Hero

Large:

`72–112px`

Desktop.

### Section heading

`52–76px`

### Page heading

`40–56px`

### Card heading

`20–30px`

### Body

`16–18px`

### Metadata

`12–14px`

Typography should create large visual hierarchy.

Do not make every heading bold.

Use weight and size to establish hierarchy.

------------------------------------------------------------------------

# 5. Layout Philosophy

The reference uses large framed content areas with generous whitespace.

StockPulse should use:

``` text
Lavender ambient background
        ↓
Large rounded white content surface
        ↓
Large visual composition
        ↓
Strong heading
        ↓
Supporting information
        ↓
Next section
```

Avoid:

``` text
Header
12 cards
6 tiny charts
20 buttons
dense sidebar
```

The product dashboard can be information-rich, but the
**marketing/onboarding shell and major feature pages should preserve the
reference's spacious visual language.**

------------------------------------------------------------------------

# 6. Global Container

Desktop:

``` css
max-width: 1440px;
margin: 0 auto;
padding: 0 32px;
```

Major sections:

``` css
min-height: 85vh;
border-radius: 32px;
```

On very large screens, allow the main white surface to breathe rather
than stretching content edge-to-edge.

------------------------------------------------------------------------

# 7. Navigation

The reference has a compact floating navigation bar.

StockPulse should use a similar concept.

## Desktop

A floating pill navigation near the top:

``` text
┌──────────────────────────────────────────────────────────┐
│  STOCKPULSE   Dashboard  Markets  Strategy  AI   ...    │
└──────────────────────────────────────────────────────────┘
```

Characteristics:

-   white/translucent surface
-   rounded corners
-   subtle shadow
-   thin border
-   backdrop blur
-   compact height
-   centered or balanced layout

Do NOT create a traditional huge enterprise sidebar for the main
experience.

------------------------------------------------------------------------

## Logged-in application navigation

The authenticated product can use a compact floating/side navigation
when data density requires it.

Preferred:

-   collapsible navigation rail
-   floating rounded container
-   icons + labels
-   active item uses soft purple surface
-   no harsh rectangular sidebar

------------------------------------------------------------------------

# 8. Hero Section

The landing/dashboard introduction should feel like the reference's
"Explore markets" hero.

Example StockPulse hero:

### Small label

`REAL MARKET INTELLIGENCE`

### Main heading

**Trade ideas.\
Understand markets.**

or:

**Explore markets\
before you trade.**

### Supporting text

Use the virtual portfolio to explore real market movements, sentiment,
risk and historical strategies without risking real capital.

### CTA

`Start Paper Trading`

Secondary:

`Explore Markets`

------------------------------------------------------------------------

# 9. Hero 3D Scene

The hero MUST contain a real 3D visual.

Preferred implementation:

**React Three Fiber + Three.js**

The central object can be:

### "Market Intelligence Core"

A floating translucent 3D sphere/orb representing the market.

Around it:

-   small floating ticker symbols
-   abstract stock-chart ribbons
-   tiny data particles
-   sentiment nodes
-   portfolio rings
-   subtle orbiting elements

Example:

``` text
                  NVDA
                    ◦

        AAPL ○              ○ TCS

              ╭────────╮
              │ MARKET │
              │  CORE  │
              ╰────────╯

          ○ RELIANCE      ○ MSFT

                  INFY
```

The objects should float slowly.

Avoid spinning everything continuously.

------------------------------------------------------------------------

# 10. 3D Style

3D objects should be:

-   soft
-   translucent
-   slightly reflective
-   purple/white
-   minimal
-   premium

Use:

-   soft lighting
-   ambient light
-   rim light
-   subtle bloom
-   depth of field where performance allows
-   shadows
-   transparent materials
-   smooth interpolation

Avoid:

-   metallic cyberpunk objects
-   realistic stock-market buildings
-   complicated 3D scenes
-   excessive particle counts

------------------------------------------------------------------------

# 11. 3D Market Objects

Possible objects:

### Market Core

Central transparent sphere.

Inside: - moving line chart - glowing data points - small market nodes

### Stock Orbs

Small floating spheres containing:

`TCS`

`AAPL`

`NVDA`

`MSFT`

`RELIANCE`

### Sentiment Nodes

Three small objects:

``` text
BULLISH
NEUTRAL
BEARISH
```

These can subtly move based on current sentiment distribution.

### Portfolio Ring

A circular 3D ring showing portfolio allocation.

### Strategy Cube

A translucent cube containing: - entry - exit - RSI - SMA - risk

This becomes the visual identity of Strategy Lab.

------------------------------------------------------------------------

# 12. Scroll Experience

The reference video strongly emphasizes smooth scrolling.

StockPulse should use scroll-driven storytelling.

Suggested landing flow:

``` text
Hero
  ↓
Live Market Universe
  ↓
Paper Trading
  ↓
Sentiment Intelligence
  ↓
Portfolio Risk
  ↓
Strategy Lab
  ↓
AI Analyst
  ↓
How It Works
  ↓
FAQ
  ↓
Footer
```

Each major section should feel like a new visual chapter.

------------------------------------------------------------------------

# 13. Scroll-Driven 3D

Use scroll position to subtly control:

-   camera position
-   object rotation
-   object scale
-   orbital movement
-   chart progression
-   lighting intensity
-   card depth

Example:

``` text
Scroll 0%
Market Core centered

Scroll 25%
Market Core moves left
News objects appear

Scroll 50%
Portfolio ring appears

Scroll 75%
Strategy object enters

Scroll 100%
AI Analyst sphere becomes central
```

Motion should be smooth and restrained.

------------------------------------------------------------------------

# 14. Section: Live Market Universe

This replaces a conventional "Markets" grid with a visual market
environment.

Heading:

**Markets are moving.\
See why.**

3D scene:

-   floating stock symbols
-   central market pulse
-   animated price curves

Below it:

A clean market table:

  Symbol     Price   Change Sentiment   Volume
  -------- ------- -------- ----------- --------

The table remains 2D for usability.

------------------------------------------------------------------------

# 15. Section: Paper Trading

Use the reference's split layout style.

Left:

Large 3D trading scene.

Right:

``` text
PAPER TRADING

Trade without risking
real capital.

Use virtual cash while
learning how markets move.

[ Start Trading ]
```

3D scene:

-   floating order ticket
-   price chart ribbon
-   virtual cash token
-   buy/sell markers

The 3D visualization should make the concept understandable in seconds.

------------------------------------------------------------------------

# 16. Trade Ticket Design

The actual trading interface should remain practical.

Use a floating white panel.

``` text
┌───────────────────────────────┐
│ TCS                 ₹3,421.20 │
│                               │
│ BUY      SELL                 │
│                               │
│ MARKET   LIMIT                │
│                               │
│ Quantity                 10   │
│                               │
│ Estimated value      ₹34,212  │
│                               │
│ Available cash      ₹9,65,788 │
│                               │
│ [ Place Paper Trade ]         │
└───────────────────────────────┘
```

Add subtle 3D elevation.

Do not turn the order ticket itself into a complicated 3D object.

------------------------------------------------------------------------

# 17. Section: Sentiment Intelligence

Heading:

**Don't just see the price.\
Understand the mood.**

Visual:

A 3D sentiment globe/orb.

Around it:

-   financial news cards
-   sentiment particles
-   ticker labels

Below:

``` text
BULLISH        62%
NEUTRAL        24%
BEARISH        14%
```

Then a 2D price/sentiment chart.

The chart should remain highly readable.

------------------------------------------------------------------------

# 18. Sentiment × Price Visualization

Use a layered chart:

``` text
Price
│       ╭────╮
│   ╭───╯    ╰──╮
│───╯           ╰──
│
└──────────────────── Time

Sentiment
Bullish █████████
Neutral ████
Bearish ██
```

Do not imply that sentiment caused price movement.

Use labels such as:

`Observed movement`

`Sentiment shift`

------------------------------------------------------------------------

# 19. Section: Portfolio Intelligence

Heading:

**Know what your portfolio\
is really carrying.**

Use a large split layout.

Left:

3D floating portfolio allocation ring.

Right:

Large metrics:

``` text
₹10,84,320
Portfolio Value

+₹84,320
Total Return

18.4%
Largest Position

12.7%
Volatility
```

Below:

2D performance chart.

------------------------------------------------------------------------

# 20. Risk Visualization

Risk should have a distinct visual identity.

Use a 3D transparent sphere/grid representing portfolio exposure.

Inside:

-   concentration nodes
-   allocation slices
-   volatility waves

Then show actual calculated metrics in 2D.

Example:

``` text
Portfolio Risk

Volatility       12.7%
Max Drawdown      8.4%
Concentration    Medium
Cash Exposure    21.2%
```

The 3D visualization is explanatory; the numeric metrics are
authoritative.

------------------------------------------------------------------------

# 21. Stress Test Experience

Heading:

**What happens if the market moves?**

Use a large 3D portfolio object.

Interactive controls:

``` text
Market Shock

-10%    -5%    0%    +5%
```

When changed:

-   portfolio 3D ring reacts
-   estimated portfolio impact updates
-   holdings table updates

Clearly label:

`Hypothetical scenario — not a forecast`

------------------------------------------------------------------------

# 22. Section: Strategy Lab

This should be one of the strongest visual sections.

Heading:

**Build.\
Test.\
Learn.**

3D visual:

A floating transparent strategy cube.

Cube faces contain:

``` text
ENTRY
SMA 50 > SMA 200
```

``` text
EXIT
RSI > 70
```

``` text
RISK
STOP 5%
```

The cube rotates subtly based on scroll.

------------------------------------------------------------------------

# 23. Strategy Builder UI

Keep the builder visual rather than code-based.

Example:

``` text
WHEN

[ SMA ] [ 50 ] [ crosses above ] [ SMA ] [ 200 ]

AND

[ RSI ] [ 14 ] [ < ] [ 70 ]

THEN

[ BUY ]
```

Exit:

``` text
WHEN

[ SMA ] [ 50 ] [ crosses below ] [ SMA ] [ 200 ]

OR

[ Stop Loss ] [ 5% ]
```

This should look like a premium visual rule builder.

------------------------------------------------------------------------

# 24. Backtest Results

Use large, spacious metric blocks.

``` text
BACKTEST

Initial Capital       ₹1,00,000
Final Capital         ₹1,18,430
Total Return              18.43%
Win Rate                   61%
Max Drawdown               9.2%
Profit Factor              1.72
Trades                       42
```

Then:

-   equity curve
-   buy/sell markers
-   trade table

Do not use giant 3D charts where precision matters.

------------------------------------------------------------------------

# 25. Strategy Comparison

Use floating layered panels.

Example:

``` text
Strategy A
18.4% return
9.2% drawdown

Strategy B
14.8% return
6.4% drawdown

Buy & Hold
16.2% return
11.1% drawdown
```

Do not label one as "best".

The UI should present historical metrics for user interpretation.

------------------------------------------------------------------------

# 26. Section: AI Analyst

Heading:

**Ask the market.\
Understand the answer.**

3D scene:

A floating AI intelligence orb.

Around it:

-   market data cards
-   news cards
-   portfolio nodes
-   strategy nodes

Example interaction:

``` text
Why did TCS move today?

AI ANALYST

Observed:
TCS moved +2.4% during today's session.

Possible contributing factors:
• Positive sector movement
• Increased trading volume
• Recent positive news sentiment

Evidence:
3 relevant headlines
Sentiment: Bullish

Uncertainty:
The available data does not establish
that any single factor caused the move.
```

The AI interface must visually distinguish: - facts - analysis -
uncertainty

------------------------------------------------------------------------

# 27. AI Chat UI

Do not build a generic ChatGPT clone.

Use an analytical workspace.

Left: - conversation

Right: - contextual data cards

Example:

``` text
┌─────────────────────┬─────────────────────────┐
│ AI conversation     │ Evidence                │
│                     │                         │
│ Why did TCS move?   │ TCS +2.4%              │
│                     │ Volume +18%             │
│ AI answer...        │ Sentiment Bullish       │
│                     │ 3 News items             │
└─────────────────────┴─────────────────────────┘
```

This reinforces the product's "AI grounded in market data" identity.

------------------------------------------------------------------------

# 28. Section: Trade Journal

Use an editorial notebook-like design.

Heading:

**Trade. Reflect. Improve.**

Cards can show:

``` text
TCS
BUY → SELL

Entry      ₹3,180
Exit       ₹3,420
P&L        +₹2,400

Why I entered
"Strong momentum after earnings."

What happened
...

AI Review
...
```

Use subtle depth and floating paper-card effects.

------------------------------------------------------------------------

# 29. Alerts

Use floating alert cards.

Example:

``` text
TARGET HIT

TCS

Target
₹3,400

Current
₹3,421

Triggered
10:42 AM
```

When triggered: - subtle animation - no aggressive flashing - optional
soft particle burst

------------------------------------------------------------------------

# 30. FAQ Section

The reference has a spacious centered FAQ layout.

StockPulse should replicate the **layout philosophy**, not the exact
content.

Heading:

**Questions about\
StockPulse?**

Questions:

-   What is paper trading?
-   Is the market data real?
-   Is real money involved?
-   How does sentiment work?
-   What does the AI Analyst use?
-   How does Strategy Lab backtest strategies?
-   Are backtest results predictions?
-   How are risk metrics calculated?

Use accordion rows with: - large click target - plus/minus icon - smooth
expansion

------------------------------------------------------------------------

# 31. Footer

Use the reference's spacious multi-column footer style.

Columns:

### PRODUCT

-   Dashboard
-   Markets
-   Paper Trading
-   Portfolio
-   Risk
-   Strategy Lab
-   AI Analyst

### LEARNING

-   Market Pulse
-   Trade Journal
-   Strategy Guides
-   Risk Concepts

### PRODUCT INFORMATION

-   About StockPulse
-   How It Works
-   Data Sources
-   AI Methodology

### LEGAL

-   Terms
-   Privacy
-   Risk Disclosure
-   Data Disclaimer

Include a clear statement:

> StockPulse is a paper-trading and market-learning platform. It does
> not execute real-money trades and its historical analyses are not
> predictions of future performance.

------------------------------------------------------------------------

# 32. Card Design

Cards should feel like physical surfaces floating slightly above the
background.

Recommended:

``` css
border-radius: 24px;
background: rgba(255,255,255,0.82);
border: 1px solid rgba(255,255,255,0.8);
box-shadow:
  0 20px 60px rgba(70,40,130,0.08);
backdrop-filter: blur(18px);
```

Do not use huge shadows.

Depth should be subtle.

------------------------------------------------------------------------

# 33. 3D Card Interaction

Cards can respond slightly to cursor movement.

Example:

-   pointer enters
-   card rotates max ±3°
-   shadow changes
-   inner 3D object shifts by 4--8px

Never allow extreme tilting.

Use spring-based interpolation.

------------------------------------------------------------------------

# 34. Motion System

Animations should be slow and intentional.

### Ambient

`8–20 seconds`

### Card entrance

`500–800ms`

### Hover

`200–350ms`

### Page transitions

`500–900ms`

### 3D object rotation

Slow continuous movement.

Avoid: - constant fast spinning - bouncing UI - excessive particles -
animation on every element simultaneously

------------------------------------------------------------------------

# 35. Scroll Animation Rules

Use Intersection Observer or GSAP/Framer Motion.

Preferred behavior:

``` text
section enters viewport
        ↓
heading fades + rises
        ↓
3D object settles into position
        ↓
supporting cards appear
        ↓
charts animate
```

Do not animate all elements from zero opacity.

The page must remain readable if animations are disabled.

------------------------------------------------------------------------

# 36. 3D Technical Implementation

Preferred stack:

-   React Three Fiber
-   Three.js
-   Drei
-   Framer Motion or GSAP for DOM animation

Use 3D only where it creates product identity.

Suggested component architecture:

``` text
components/
├── 3d/
│   ├── MarketCore.tsx
│   ├── FloatingTicker.tsx
│   ├── SentimentOrb.tsx
│   ├── PortfolioRing.tsx
│   ├── StrategyCube.tsx
│   ├── AIOrb.tsx
│   └── ParticleField.tsx
│
├── sections/
│   ├── HeroSection.tsx
│   ├── MarketUniverse.tsx
│   ├── PaperTradingSection.tsx
│   ├── SentimentSection.tsx
│   ├── PortfolioSection.tsx
│   ├── RiskSection.tsx
│   ├── StrategySection.tsx
│   ├── AISection.tsx
│   ├── JournalSection.tsx
│   ├── FAQSection.tsx
│   └── Footer.tsx
```

------------------------------------------------------------------------

# 37. 3D Performance

3D must not destroy usability.

Requirements:

-   lazy-load heavy 3D scenes
-   use instancing for repeated objects
-   keep particle counts low
-   use compressed textures
-   avoid unnecessary high-poly models
-   pause animation when offscreen
-   reduce effects on mobile
-   provide reduced-motion behavior

Mobile may use simplified 3D rather than removing the entire visual
identity.

------------------------------------------------------------------------

# 38. Mobile Design

The reference's spacious visual style should remain.

Mobile:

``` text
Hero
  ↓
3D Market Core
  ↓
CTA
  ↓
Feature section
  ↓
2D data
```

Do not force desktop compositions into mobile.

For complex 3D scenes: - reduce object count - reduce camera movement -
simplify lighting - reduce particle effects

------------------------------------------------------------------------

# 39. Dashboard Adaptation

The actual authenticated dashboard is more data-dense than the marketing
experience.

However, it must still use the same visual language:

-   lavender environment
-   white rounded surfaces
-   purple accents
-   floating panels
-   subtle 3D hero visual
-   clean typography
-   generous spacing

Dashboard structure:

``` text
Top navigation
        ↓
3D portfolio header
        ↓
Key metrics
        ↓
Performance chart
        ↓
Market Pulse
        ↓
Positions
        ↓
Watchlist
        ↓
Recent trades
        ↓
AI insight
```

------------------------------------------------------------------------

# 40. Data Visualization Rules

Charts must prioritize accuracy over decoration.

Use 2D charts for: - price - portfolio performance - drawdown -
allocation - backtests - sentiment timeline

3D should be used for: - conceptual market visualization -
portfolio/risk visualization - strategy identity - AI identity -
onboarding storytelling

Never make a precise financial number difficult to read because of 3D
styling.

------------------------------------------------------------------------

# 41. Loading States

Use elegant skeletons.

For 3D: - show a static simplified placeholder - progressively load the
scene

For market data:

``` text
Loading market data...
```

Never show random numbers while loading.

------------------------------------------------------------------------

# 42. Empty States

Example:

### Empty Portfolio

**Your portfolio starts here.**

Explore a market and place your first paper trade.

`Explore Markets`

Use a small floating 3D market orb.

------------------------------------------------------------------------

# 43. Error States

Example:

**Market data unavailable**

The provider did not return a valid update.

`Last valid update: 2:42 PM`

`Retry`

Never display fake prices to make the screen look populated.

------------------------------------------------------------------------

# 44. Stale Data

Every market-data area should visibly communicate freshness.

Example:

`LIVE`

or

`DELAYED · Updated 12:42:18`

or

`MARKET CLOSED · Last update 4:00 PM`

------------------------------------------------------------------------

# 45. Accessibility

3D is supplementary.

The entire product must remain usable without 3D.

Requirements:

-   keyboard navigation
-   visible focus
-   semantic HTML
-   screen-reader labels
-   text alternatives for 3D scenes
-   chart summaries
-   sufficient contrast
-   reduced-motion support
-   no information conveyed only through animation
-   no information conveyed only through color

For example:

A 3D portfolio ring must have a corresponding textual allocation table.

------------------------------------------------------------------------

# 46. Interaction Principle

The reference design feels premium because it is restrained.

StockPulse should follow:

**One strong visual idea per section.**

Do not create:

-   3D orb
-   3 charts
-   7 cards
-   particle field
-   floating icons
-   animated text

all in the same viewport.

Instead:

``` text
ONE 3D HERO
+
ONE STRONG MESSAGE
+
ONE SUPPORTING DATA VISUAL
+
ONE CTA
```

------------------------------------------------------------------------

# 47. What Must NOT Be Copied

The reference is a visual inspiration only.

Do not copy: - brand name - logo - exact typography treatment - exact
text - exact imagery - exact card compositions - exact animations -
exact navigation labels - exact page structure

Create a distinct StockPulse identity using the same broad principles: -
lavender environment - premium whitespace - rounded white surfaces -
purple accents - 3D objects - scroll storytelling - editorial layouts -
subtle depth

------------------------------------------------------------------------

# 48. Final Visual Target

The final experience should feel approximately like:

``` text
                    STOCKPULSE
              ─────────────────────

             [ floating navigation ]

                     ◦
                 ◦       ◦
                    ╭───╮
              ◦    │ 3D │    ◦
                   │MARKET│
                    ╰───╯

             Explore markets.
             Understand movement.

             [ Start Paper Trading ]


        ┌─────────────────────────────────┐
        │                                 │
        │     LIVE MARKET UNIVERSE        │
        │                                 │
        │       3D VISUAL + DATA         │
        │                                 │
        └─────────────────────────────────┘


        ┌───────────────┬─────────────────┐
        │               │                 │
        │   3D TRADE    │  PAPER TRADE    │
        │   VISUAL      │  EXPLANATION    │
        │               │                 │
        └───────────────┴─────────────────┘


        ┌─────────────────────────────────┐
        │       SENTIMENT INTELLIGENCE    │
        │                                 │
        │      3D ORB + PRICE CHART       │
        └─────────────────────────────────┘


        ┌─────────────────────────────────┐
        │       PORTFOLIO INTELLIGENCE    │
        │                                 │
        │       3D RISK VISUAL            │
        │       + ACTUAL METRICS          │
        └─────────────────────────────────┘


        ┌─────────────────────────────────┐
        │          STRATEGY LAB           │
        │                                 │
        │       3D STRATEGY CUBE          │
        │       + BACKTEST RESULTS        │
        └─────────────────────────────────┘


        ┌─────────────────────────────────┐
        │           AI ANALYST             │
        │                                 │
        │        3D AI INTELLIGENCE       │
        │        + EVIDENCE PANEL         │
        └─────────────────────────────────┘


                   FAQ

                   FOOTER
```

## Final implementation instruction

**Do not interpret this as a request for a generic dashboard.**

The visual identity must be driven by the uploaded reference:

> **soft lavender environment + large white rounded surfaces + premium
> typography + spacious editorial composition + subtle purple accents +
> floating 3D objects + smooth scroll storytelling**

Then adapt that language specifically to StockPulse's:

> **real market data + paper trading + sentiment + risk + Strategy Lab +
> AI Analyst**

The result should look like a premium product website that happens to
contain a sophisticated financial application---not like an admin
dashboard with a few decorative 3D elements added afterward.
