# Coordinator Charging UX Redesign

## Problem

The current beam-to-coordinator charging interaction has several UX failures:

1. **No teaching** — The game never tells the player that coordinators need energy or that the beam recharges them.
2. **Weak visual feedback** — The charging indicator is a small orange elliptical glow (30x20px) and a tiny 4px energy bar. Easy to miss entirely.
3. **Confusing dual-purpose beam** — When hovering over a coordinator and pressing space, the beam still shoots all the way to the ground as a full cone. It's unclear you're charging the coordinator vs. just beaming normally.
4. **Coordinators die without explanation** — They explode spectacularly, but the player doesn't connect "I needed to charge that" to "it fell out of the sky."

## Design

### 1. Beam Behavior & Interaction Model

**Proximity snap system:** When the UFO is within ~120-150px horizontal range of a deployed coordinator, pressing spacebar redirects the beam into the coordinator instead of firing the normal abduction cone to the ground. Beam energy drain still applies — the player spends UFO energy to recharge the coordinator, preserving the existing resource tradeoff.

**Outside snap range:** The beam works exactly as it does today — full cone to the ground, abducting targets, spirals and all. The player never loses the ability to manually abduct.

**Coordinator proximity indicator:** When the UFO enters snap range, the coordinator's glow brightens and gains a highlight outline (soft white or cyan border pulse). Signals "I'm in range, press space to charge" without text. Fades when the UFO moves out of range.

**Multiple coordinators:** If the UFO is in range of more than one coordinator, snap to the one with the lowest energy. The system auto-prioritizes what needs juice most.

### 2. Charging Beam Visual

**Energy conduit:** When the beam redirects into a coordinator, it renders as a thick rod (~8-12px wide) instead of the normal cone. The rod follows a sinusoidal wave along its length — oscillating side to side as it travels from the UFO down to the coordinator. The wave animates smoothly, giving the feel of energy flowing through a conduit.

**Color and feel:** Warm gold/orange palette, distinct from the cyan/magenta abduction beam. Matches the coordinator energy bar color language and immediately reads as "power transfer, not tractor beam." Soft glow/bloom around the rod. Small energy particles travel along the sine path toward the coordinator, reinforcing the direction of flow.

**Coordinator reaction:** While being charged, the coordinator's body glow intensifies and pulses in sync with the energy arriving. The energy bar visibly fills. Satisfying feedback loop — energy rod connecting, particles flowing in, coordinator getting brighter and fuller.

**Sound:** Distinct from the normal beam loop (sawtooth at 150Hz). A warm electrical hum that rises in pitch as the coordinator approaches full charge. Satisfying "full" chime when it tops off.

### 3. Coordinator Energy Display

**Upgraded energy bar:** Replace the current 4px-tall, 40px-wide bar with 60px wide, 6-8px tall. Thin dark border/background for readability. Color progression: green (>50%) to yellow (25-50%) to red (<25%). Subtle inner glow matching its color.

**Body glow system:** The coordinator's glow aura scales with energy level:
- **Full charge:** Vibrant and bright type color (cyan for harvester, orange for attack), rich saturation, visible pulsing aura.
- **Depleting:** Glow dims and desaturates proportionally.
- **Below 25%:** Washed out and feeble, flickering intermittently.

Energy state is readable at a glance without looking at the bar — bright coordinator is healthy, dim one needs attention.

**Charging shimmer:** When actively being charged, the energy bar gains a bright white shimmer/highlight that sweeps across it (progress bar shine animation). Immediate confirmation that energy is going in.

### 4. LOW_ENERGY Distress System

**SOS beacon (at 25% energy):** The coordinator emits a pulsing red ring that expands outward — like a radar ping — every ~2 seconds. Ring starts at coordinator size, expands to ~80-100px radius, then fades out. Accompanied by a short two-tone warning beep (distinct, not annoying). Visible even in heavy combat because it's a moving/expanding element.

**HUD directional indicator:** When any coordinator is in LOW_ENERGY state, a small arrow icon appears near the UFO pointing toward it. Arrow uses the coordinator's type color (cyan or orange) with a red pulsing outline. If the coordinator is off-screen, the arrow sits at the screen edge in that direction. Multiple low-energy coordinators show multiple arrows.

**Escalation (below ~10%, DYING state):** Beep frequency increases (every 1 second), arrow flashes more urgently. Gives the player a final "last chance" window before the explosion. Feels like a crisis you can still save, not a sudden death.

### 5. Teaching the Mechanic

**First coordinator deploy hint:** When the player deploys their very first coordinator, after it enters ACTIVE state, a tutorial-style hint appears (matching Wave 1 hint visual language — semi-transparent black rounded rect, pulsing glow):

```
[SPACE] RECHARGE YOUR COORDINATOR
```

With an arrow pointing at the coordinator. Stays visible until the player actually charges the coordinator for the first time (beam connects and energy increases). Dismisses with particle burst. One-time teaching moment — never shows again.

**Energy bar callout:** Alongside the hint, the coordinator's energy bar briefly flashes or scales up to draw attention. Player connects "that bar is energy, it drains, I need to refill it."

**Natural reinforcement:** After the one-time tutorial, the distress system (SOS beacon + HUD arrows + warning beeps) handles all ongoing reminders. The player learns the loop: deploy coordinator, it works autonomously, energy drains, distress signal fires, fly over and charge it, repeat.

## Implementation Notes

### Files likely affected
- `js/game.js` — Beam rendering, beam interaction logic, coordinator class, tutorial system, HUD rendering

### Key changes
- Beam update logic: add proximity snap detection before normal beam cone
- New `renderChargingBeam()` function for the sinusoidal energy conduit
- Coordinator class: upgraded energy bar rendering, glow scaling, SOS beacon, proximity highlight
- HUD: directional arrows for low-energy coordinators
- Tutorial system: first-deploy hint trigger and dismissal
- Audio: new charging hum sound, full-charge chime, distress beep
