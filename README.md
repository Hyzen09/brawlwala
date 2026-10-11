# Brawlhalla Web: Clash of Legends

A high-performance browser-based platform fighter inspired by **Brawlhalla**, reverse-engineered using **REA (Reverse Engineer Anything)** MCP from local game assets, skeletal bone structures, and combat mechanics.

---

## 🔍 Reverse Engineering Findings (via REA MCP)

Inspection of Brawlhalla's native package and asset structures (`Bones_Player.swf`, `Bones_Sword.swf`, `Bones_Spear.swf`, `Bones_Lance.swf`, `Bones_Pistols.swf`, `Bones_Katar.swf`):

1. **Vector-Skeletal Animation Rig**:
   - Rather than rigid static sprites, Brawlhalla animates a modular joint hierarchy (`Torso`, `Pelvis`, `UpperArm`, `Forearm`, `Hand`, `Thigh`, `Calf`, `Boot`, `Cape`, `Weapon`).
   - Movement and attacks articulate through joint matrices with secondary physics (cape trailing billow waves, hair sway, weapon swoosh arcs).
2. **Locomotion & Movement Dynamics**:
   - **Dash Dancing**: Cancelling dashes into opposite directions (`DashPivot`) with turnaround skid friction and skid dust.
   - **Jump Squat**: 3-frame anticipation crouch before liftoff.
   - **Apex Float**: Softer gravity when vertical velocity is near zero ($|v_y| < 90$), allowing precise aerial drifting and spacing.
   - **Fast-Fall Snap**: Tapping Down in air at or after the apex snaps velocity to $760\text{ px/s}$ with a downward wind streak.
   - **Squash and Stretch**: Dynamic deformation matrices on landing, jumping, and hit recoil.
3. **True Combos & Combat Strings**:
   - **Input Buffering**: 8-frame buffer queue allowing frame-perfect combos out of endlag.
   - **True Weapon Combos**:
     - **Sword**: `DLight` (pop-up) $\to$ `Jump SAir` or `Recovery`
     - **Blasters**: `DLight` (pop-up) $\to$ `SAir`
     - **Spear**: `SLight` $\to$ `DLight` (helicopter lift) $\to$ `SAir`
     - **Rocket Lance**: `SLight` (rocket scoop) $\to$ `SAir` or `Recovery`
     - **Katars**: `DLight` $\to$ `SLight` $\to$ `NAir` shred loop
   - **Chase Dodge**: Landing any attack opens a $0.32\text{s}$ Chase Dodge window, granting an invulnerable forward warp to follow up and extend combos!

---

## ⚔️ The 7 Unique Legends

| Legend | Archetype | Weapons | Stats (STR / DEX / DEF / SPD) | Signatures |
| :--- | :--- | :--- | :--- | :--- |
| **Bödvar** | The Bear Warrior | Greatsword & Hammer | **6 / 6 / 5 / 5** | *Bear Claw Uppercut*, *Savage Greatsword Charge*, *Earthshaker Slam* |
| **Cassidy** | The Frontier Marshal | Dual Blasters & Mallet | **6 / 8 / 4 / 4** | *High Noon Fan-the-Hammer*, *Quickdraw Rush*, *Dust Devil Lasso* |
| **Orion** | The Star Knight | Rocket Lance & Spear | **4 / 6 / 6 / 6** | *Cosmic Sky Piercer*, *Rocket Thruster Charge*, *Supernova Burst* |
| **Hattori** | The Demon Bride | Dual Katars & Katana | **4 / 6 / 4 / 8** | *Shadow Teleport Slash*, *Mist Veil Dash*, *Smoke Demon Trap* |
| **Lord Vraxx** | The Alien Overlord | Ray Blasters & Lance | **4 / 8 / 4 / 6** | *Orbital Plasma Cannon*, *Hovercraft Strafe*, *Vaporizer Minefield* |
| **Queen Nai** | The Jaguar Queen | Serpent Spear & Katars | **7 / 4 / 8 / 3** | *Serpent God Eruption*, *Jaguar Leap Pounce*, *Quetzalcoatl Wings* |
| **Sir Roland** | The Golden Paladin | Broadsword & Lance | **5 / 5 / 8 / 4** | *Valiant Holy Cleave*, *Royal Steed Charge*, *Aegis Shield Flare* |

---

## 🎮 Controls

### Player 1 (Keyboard & Gamepad Supported)
- **Move Left / Right**: <kbd>A</kbd> / <kbd>D</kbd> (Smooth acceleration and dash pivots)
- **Ground Dash / Air Dodge / Chase Dodge**: <kbd>L</kbd> or <kbd>Shift</kbd>
- **Jump / Wall Jump**: <kbd>W</kbd> or <kbd>Space</kbd> (Jump squat $\to$ liftoff $\to$ apex float)
- **Fast-Fall / Drop Platform**: <kbd>S</kbd>
- **Light Attack (Combo Starters)**: <kbd>J</kbd> (Neutral, Side, Down, Aerials)
- **Heavy Signature**: <kbd>K</kbd> (NSig, SSig, DSig)
- **Aerial Recovery**: <kbd>W</kbd> + <kbd>K</kbd> (Up + Heavy in air)
- **Ground Pound**: <kbd>S</kbd> + <kbd>K</kbd> (Down + Heavy in air)
- **Toggle Hitboxes**: <kbd>H</kbd>
- **Pause**: <kbd>Esc</kbd>

### Player 2 (Local PvP)
- **Move**: <kbd>◀</kbd> / <kbd>▶</kbd> | **Jump**: <kbd>▲</kbd> | **Drop**: <kbd>▼</kbd>
- **Light**: <kbd>1</kbd> | **Heavy**: <kbd>2</kbd> | **Dash/Dodge**: <kbd>3</kbd>

---

## 🚀 Play Now

Server is running at:
**[http://localhost:3000](http://localhost:3000)**
# brawlwala
