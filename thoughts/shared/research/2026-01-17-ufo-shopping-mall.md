---
date: 2026-01-16T19:05:34Z
researcher: Codex
git_commit: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17
branch: main
repository: alien-abductorama
topic: "Between-Wave UFO Shopping Mall + New Shop-Only Items"
tags: [research, gameplay, shop, economy, ufo, items, abilities]
status: draft
last_updated: 2026-01-16
last_updated_by: Codex
last_updated_note: "Rewritten to focus on the between-wave UFO Shopping Mall and new shop-only items."
---

# Research: Between-Wave UFO Shopping Mall + Shop-Only Items

**Date**: 2026-01-16T19:05:34Z  
**Researcher**: Codex  
**Git Commit**: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17  
**Branch**: main  
**Repository**: alien-abductorama

## Research Question
How should the between-wave UFO Shopping Mall work, and how do the new shop-only items (energy cells, bombs, Warp Juke, laser turret) integrate into the existing economy and UI without adding vertical movement or special shop items?

## Summary
Introduce a **30-second between-wave Shopping Mall** where players spend points, with an option to exit without purchasing. The shop is the only source for the new items: **energy cells**, **bombs**, **Warp Juke**, and a **laser turret**. Existing consumables, temporary boosts, upgrades, and abilities remain as described in the original doc, but **exclude special shop items** (no mystery, clearance, or insurance). The design keeps core tension intact while adding meaningful choices between waves.

---

## Shopping Mall: Core Rules

**Time-limited visit**
- Shop opens for **30 seconds** between waves.
- A clear countdown is visible; a short warning at 10 seconds.

**Currency**
- Players spend **points** (score doubles as currency).

**Exit without purchase**
- Players can **leave immediately** without buying anything.
- If timer expires, the shop auto-closes and proceeds to the next wave.

---

## Shop Inventory (Baseline)

Keep the existing structure of:
1. **Consumables**
2. **Temporary boosts**
3. **Permanent upgrades**
4. **Abilities**

Do **not** include special shop items (mystery, clearance, insurance).

---

## New Shop-Only Items

These items **never spawn as random pickups** and are **only available in the Shopping Mall**.

### 1) Energy Cells (Metroid-style reserve)
**Concept**
- Acts as an **automatic reserve** that triggers when available (Metroid-like).
- UI shows **green circles above the shield bar**.
- Starts at **0 cells**; only gained via shop purchases.

**Behavior**
- When the UFO would be destroyed or energy is depleted (final rule to be decided), a cell **auto-consumes** to restore the relevant resource.
- Cells are **always auto-used** when available; no manual activation.

**Constraints**
- Must be **affordable before Wave 3** (1 cell purchase is attainable).
- **Dynamic price scaling**: cost increases as the player buys more cells.
- **Reasonable max** (cap to avoid trivializing difficulty).

**UI**
- Green circles above shield bar, filled = available, empty = used.
- No cells displayed until at least one is purchased.

**Open decision**
- Determine whether auto-use restores **health**, **energy**, or both (single focus recommended for clarity).

---

### 2) Bombs (Shop-only ammo)
**Concept**
- Purchaseable consumable bomb drops.
- **Feel-good physics**: the bomb can bounce slightly before exploding.

**Behavior**
- Player can **buy 1** at a time, with a **max stock of 3**.
- Dropped bombs explode on ground contact or after a short fuse.
- **Beamable targets** (humans, etc.) are blasted away, **spin**, and then disappear.
- **Heavy tanks require 2 bombs** to destroy.
- Heavy tanks show **visible damage** after the first bomb hit.

**Feel**
- Explosion should be chunky and satisfying.
- Optional bounce adds tactile feedback without being chaotic.

---

### 3) Warp Juke (ability unlock)
**Concept**
- One-time **ability unlock**.
- **Double-tap** left or right triggers the move.

**Behavior**
- Costs **25 energy** per use (tuned to feel meaningful without forcing a cooldown).
- Cannot trigger if current energy is below the cost.
- Energy is spent **on activation**, not over time, to keep the input snappy.
- Activating Warp Juke **drops/pauses the beam** so the core "no movement while abducting" rule stays intact.
- **Invulnerable** during the roll, like a roguelite dodge.
- **No separate cooldown**; energy cost is the limiter.

**Visuals**
- **Phase shift / chromatic fluid** effect, like time folds around the UFO.
- Short, snappy animation; feels like slipping between frames.

**Name**
- Warp Juke

---

### 4) Laser Turret (droppable, expensive)
**Concept**
- **Expensive one-slot deployable**: only **1 active turret** at a time.
- Drops to the ground and **fires at targets** on a cooldown.

**Behavior**
- **Attracts enemy fire** and can be destroyed.
- Provides temporary zone control and distraction.

**Constraints**
- **Max 1** turret active.
- **High cost**; power balanced by fragility and limited uptime.

---

## Shop Layout and Flow

**Flow**
1. Wave ends → award points.
2. Enter **SHOP** state for 30 seconds.
3. Player buys items or exits immediately.
4. Transition to next wave.

**UI expectations**
- Points displayed prominently.
- Items show cost, stock, and effect.
- Countdown timer visible.
- Clear affordance to **leave without buying**.


## Economy Notes

**Energy Cells**
- Price should **increase per cell** to prevent snowballing.
- Example: 300 → 500 → 800 → 1200 (tune to match wave scoring).

**Bombs**
- Priced to allow **1 before Wave 3** if player plays well.
- Encourages tactical spending vs saving for upgrades.

**Warp Juke**
- One-time unlock with a **mid-tier cost**.
- 25 energy per use prevents overuse while keeping it available in clutch moments.

**Laser Turret**
- High cost; a **commitment purchase** that changes play style.

---

## Implementation Hooks (Codebase)

**Wave transition**
- Current wave transition logic lives around `js/game.js:3873-3892`.
- Modify transition to enter a new `SHOP` state.

**Shop state**
```javascript
// Add to game states:
'SHOP'

// In game loop:
case 'SHOP':
    updateShop(dt);
    renderShop();
    break;
```

**Shop inventory data**
```javascript
const shopItems = {
    energy_cell: { type: 'consumable', maxStock: 4, priceCurve: [300, 500, 800, 1200] },
    bomb: { type: 'consumable', maxStock: 3, price: 400 },
    warp_juke: { type: 'ability', oneTime: true, price: 800 },
    laser_turret: { type: 'ability', oneTime: true, price: 1400 }
};
```

**UI placement**
- Energy cells rendered above the shield bar (`js/game.js:2991-3031`).
- Bomb stock and turret availability can be displayed near the HUD.

---

## Explicit Exclusions

**Do not add:**
- Vertical movement or vertical dodge options.
- Special shop items (mystery box, clearance sales, insurance).
- Random pickups for the new items (all shop-only).

---

## Open Questions

1. Energy cell auto-use: health restore, energy restore, or both?
2. Exact energy cell max count (3? 4? 5?).
3. Bomb bounce behavior: light ricochet vs single soft bounce.
4. Laser turret firing priority: nearest target vs highest threat.
5. Price curve for energy cells and baseline costs for bombs/turret.
