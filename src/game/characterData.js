/**
 * The 7 Unique Legends with complete weapon archetypes and frame-data setups.
 * Faithfully replicates Brawlhalla stats, true combo setups, and signature attacks.
 */

export const WEAPON_ATTACKS = {
  sword: {
    nLight: {
      name: 'Neutral Light (Triple Slash)',
      startup: 0.08, active: 0.16, recovery: 0.14,
      damage: 12, baseKnockback: 220, scaling: 0.8, angle: -0.25,
      hitbox: { x: 38, y: -4, w: 55, h: 42 },
      swoosh: { radius: 48, sweep: Math.PI * 0.9, rot: 0.2 },
      sound: 'sword'
    },
    sLight: {
      name: 'Side Light (Lunge Slice)',
      startup: 0.1, active: 0.15, recovery: 0.16,
      damage: 14, baseKnockback: 280, scaling: 1.1, angle: -0.2,
      hitbox: { x: 48, y: 0, w: 65, h: 38 },
      swoosh: { radius: 55, sweep: Math.PI * 0.85, rot: 0 },
      stepForward: 220,
      sound: 'sword'
    },
    dLight: {
      name: 'Down Light (Sweep Launch)', // True combo starter into Jump SAir or Recovery!
      startup: 0.09, active: 0.14, recovery: 0.12,
      damage: 11, baseKnockback: 340, scaling: 0.4, angle: -Math.PI / 2.1, // Pops straight up!
      hitbox: { x: 34, y: 22, w: 58, h: 32 },
      swoosh: { radius: 46, sweep: Math.PI * 0.8, rot: 0.8 },
      stepForward: 160,
      isComboStarter: true,
      sound: 'sword'
    },
    sAir: {
      name: 'Side Air (Aerial Cleave)',
      startup: 0.1, active: 0.18, recovery: 0.16,
      damage: 16, baseKnockback: 380, scaling: 1.4, angle: -0.3,
      hitbox: { x: 44, y: -5, w: 62, h: 48 },
      swoosh: { radius: 54, sweep: Math.PI * 1.0, rot: -0.2 },
      sound: 'sword'
    },
    nAir: {
      name: 'Neutral Air (Somersault Spin)',
      startup: 0.08, active: 0.2, recovery: 0.14,
      damage: 14, baseKnockback: 320, scaling: 1.1, angle: -Math.PI / 2,
      hitbox: { x: 0, y: -42, w: 68, h: 60 },
      swoosh: { radius: 52, sweep: Math.PI * 1.4, rot: -Math.PI / 2 },
      sound: 'sword'
    },
    dAir: {
      name: 'Down Air (Downward Spike)',
      startup: 0.11, active: 0.18, recovery: 0.18,
      damage: 15, baseKnockback: 340, scaling: 1.3, angle: Math.PI / 2.2, // Downward launch
      hitbox: { x: 15, y: 38, w: 50, h: 52 },
      swoosh: { radius: 50, sweep: Math.PI * 0.8, rot: Math.PI / 2 },
      sound: 'sword'
    }
  },

  blasters: {
    nLight: {
      name: 'Neutral Light (Fan the Hammer)',
      startup: 0.07, active: 0.18, recovery: 0.14,
      damage: 13, baseKnockback: 200, scaling: 0.85, angle: -0.2,
      hitbox: { x: 45, y: -10, w: 65, h: 36 },
      swoosh: { radius: 50, sweep: Math.PI * 0.6, rot: 0 },
      sound: 'blasters'
    },
    sLight: {
      name: 'Side Light (Dual Spacing Shot)',
      startup: 0.11, active: 0.15, recovery: 0.16,
      damage: 14, baseKnockback: 310, scaling: 1.15, angle: -0.15,
      hitbox: { x: 62, y: -5, w: 75, h: 34 },
      swoosh: { radius: 60, sweep: Math.PI * 0.5, rot: 0 },
      sound: 'blasters'
    },
    dLight: {
      name: 'Down Light (Ground Ricochet)', // True combo starter into SAir or DAir!
      startup: 0.09, active: 0.14, recovery: 0.12,
      damage: 12, baseKnockback: 330, scaling: 0.45, angle: -Math.PI / 2.2, // Pops up!
      hitbox: { x: 42, y: 24, w: 60, h: 30 },
      swoosh: { radius: 46, sweep: Math.PI * 0.7, rot: 0.6 },
      isComboStarter: true,
      sound: 'blasters'
    },
    sAir: {
      name: 'Side Air (Dual Beam Blast)',
      startup: 0.12, active: 0.16, recovery: 0.18,
      damage: 17, baseKnockback: 390, scaling: 1.45, angle: -0.25,
      hitbox: { x: 55, y: -8, w: 70, h: 40 },
      swoosh: { radius: 58, sweep: Math.PI * 0.7, rot: 0 },
      sound: 'blasters'
    },
    nAir: {
      name: 'Neutral Air (Double Anti-Air)',
      startup: 0.09, active: 0.18, recovery: 0.15,
      damage: 14, baseKnockback: 310, scaling: 1.1, angle: -Math.PI / 2,
      hitbox: { x: 0, y: -45, w: 65, h: 58 },
      swoosh: { radius: 50, sweep: Math.PI * 1.1, rot: -Math.PI / 2 },
      sound: 'blasters'
    },
    dAir: {
      name: 'Down Air (Twin Barrel Spike)',
      startup: 0.12, active: 0.17, recovery: 0.18,
      damage: 16, baseKnockback: 360, scaling: 1.35, angle: Math.PI / 2.3,
      hitbox: { x: 10, y: 40, w: 52, h: 55 },
      swoosh: { radius: 48, sweep: Math.PI * 0.7, rot: Math.PI / 2 },
      sound: 'blasters'
    }
  },

  lance: {
    nLight: {
      name: 'Neutral Light (Thruster Jab)',
      startup: 0.09, active: 0.16, recovery: 0.15,
      damage: 13, baseKnockback: 240, scaling: 0.9, angle: -0.3,
      hitbox: { x: 48, y: -8, w: 72, h: 42 },
      swoosh: { radius: 62, sweep: Math.PI * 0.75, rot: 0 },
      sound: 'lance'
    },
    sLight: {
      name: 'Side Light (Rocket Charge Scoop)', // True combo starter into Jump SAir or Recovery!
      startup: 0.12, active: 0.18, recovery: 0.15,
      damage: 15, baseKnockback: 320, scaling: 0.5, angle: -Math.PI / 3, // Scoops upward forward
      hitbox: { x: 55, y: 0, w: 80, h: 45 },
      swoosh: { radius: 68, sweep: Math.PI * 0.8, rot: 0.1 },
      stepForward: 310,
      isComboStarter: true,
      sound: 'lance'
    },
    dLight: {
      name: 'Down Light (Afterburner Sweep)',
      startup: 0.1, active: 0.16, recovery: 0.15,
      damage: 13, baseKnockback: 330, scaling: 0.8, angle: -0.7,
      hitbox: { x: 42, y: 18, w: 68, h: 36 },
      swoosh: { radius: 56, sweep: Math.PI * 0.8, rot: 0.4 },
      sound: 'lance'
    },
    sAir: {
      name: 'Side Air (Rocket Lance Drive)',
      startup: 0.13, active: 0.22, recovery: 0.19,
      damage: 18, baseKnockback: 420, scaling: 1.55, angle: -0.2,
      hitbox: { x: 60, y: -6, w: 85, h: 48 },
      swoosh: { radius: 72, sweep: Math.PI * 0.9, rot: 0 },
      sound: 'lance'
    },
    nAir: {
      name: 'Neutral Air (Gyro Exhaust Spin)',
      startup: 0.09, active: 0.2, recovery: 0.15,
      damage: 15, baseKnockback: 310, scaling: 1.05, angle: -Math.PI / 2,
      hitbox: { x: 0, y: -40, w: 75, h: 65 },
      swoosh: { radius: 60, sweep: Math.PI * 1.4, rot: -Math.PI / 2 },
      sound: 'lance'
    },
    dAir: {
      name: 'Down Air (Divebomb Thruster)',
      startup: 0.14, active: 0.22, recovery: 0.2,
      damage: 17, baseKnockback: 370, scaling: 1.4, angle: Math.PI / 2.6,
      hitbox: { x: 25, y: 45, w: 60, h: 58 },
      swoosh: { radius: 58, sweep: Math.PI * 0.8, rot: Math.PI / 2.5 },
      sound: 'lance'
    }
  },

  katars: {
    nLight: {
      name: 'Neutral Light (Dual Claw Flurry)',
      startup: 0.06, active: 0.15, recovery: 0.12,
      damage: 11, baseKnockback: 200, scaling: 0.75, angle: -0.25,
      hitbox: { x: 32, y: -6, w: 48, h: 38 },
      swoosh: { radius: 42, sweep: Math.PI * 0.9, rot: 0 },
      sound: 'katars'
    },
    sLight: {
      name: 'Side Light (Cross Slash Dash)',
      startup: 0.08, active: 0.14, recovery: 0.13,
      damage: 13, baseKnockback: 250, scaling: 0.9, angle: -0.3,
      hitbox: { x: 40, y: -4, w: 54, h: 36 },
      swoosh: { radius: 48, sweep: Math.PI * 0.85, rot: 0 },
      stepForward: 240,
      sound: 'katars'
    },
    dLight: {
      name: 'Down Light (Pop-up Claw Uppercut)', // True combo starter!
      startup: 0.07, active: 0.13, recovery: 0.11,
      damage: 11, baseKnockback: 320, scaling: 0.4, angle: -Math.PI / 2.1,
      hitbox: { x: 30, y: 16, w: 50, h: 34 },
      swoosh: { radius: 44, sweep: Math.PI * 0.8, rot: 0.7 },
      isComboStarter: true,
      sound: 'katars'
    },
    sAir: {
      name: 'Side Air (Flying Scissor Cross)',
      startup: 0.09, active: 0.16, recovery: 0.14,
      damage: 15, baseKnockback: 360, scaling: 1.35, angle: -0.3,
      hitbox: { x: 38, y: -5, w: 56, h: 44 },
      swoosh: { radius: 50, sweep: Math.PI * 1.0, rot: -0.2 },
      sound: 'katars'
    },
    nAir: {
      name: 'Neutral Air (Cyclone Flip)',
      startup: 0.07, active: 0.18, recovery: 0.13,
      damage: 13, baseKnockback: 290, scaling: 0.95, angle: -Math.PI / 2,
      hitbox: { x: 0, y: -38, w: 62, h: 56 },
      swoosh: { radius: 48, sweep: Math.PI * 1.4, rot: -Math.PI / 2 },
      sound: 'katars'
    },
    dAir: {
      name: 'Down Air (Pounce Talon Drill)',
      startup: 0.1, active: 0.18, recovery: 0.16,
      damage: 15, baseKnockback: 330, scaling: 1.25, angle: Math.PI / 2.4,
      hitbox: { x: 18, y: 35, w: 46, h: 50 },
      swoosh: { radius: 46, sweep: Math.PI * 0.8, rot: Math.PI / 2 },
      sound: 'katars'
    }
  },

  spear: {
    nLight: {
      name: 'Neutral Light (Rapid Spear Thrusts)',
      startup: 0.08, active: 0.17, recovery: 0.14,
      damage: 12, baseKnockback: 220, scaling: 0.8, angle: -0.2,
      hitbox: { x: 46, y: -6, w: 68, h: 36 },
      swoosh: { radius: 58, sweep: Math.PI * 0.7, rot: 0 },
      sound: 'spear'
    },
    sLight: {
      name: 'Side Light (Double Sweep Poke)', // True combo into DLight!
      startup: 0.1, active: 0.16, recovery: 0.14,
      damage: 14, baseKnockback: 260, scaling: 0.6, angle: -0.35,
      hitbox: { x: 54, y: 0, w: 75, h: 38 },
      swoosh: { radius: 64, sweep: Math.PI * 0.8, rot: 0.1 },
      stepForward: 230,
      isComboStarter: true,
      sound: 'spear'
    },
    dLight: {
      name: 'Down Light (Helicopter Vault Spin)', // Iconic Spear bread & butter string starter!
      startup: 0.09, active: 0.18, recovery: 0.13,
      damage: 13, baseKnockback: 350, scaling: 0.42, angle: -Math.PI / 2.15,
      hitbox: { x: 38, y: 15, w: 65, h: 42 },
      swoosh: { radius: 56, sweep: Math.PI * 1.3, rot: 0.5 },
      isComboStarter: true,
      sound: 'spear'
    },
    sAir: {
      name: 'Side Air (Horizontal Spear Vault)',
      startup: 0.11, active: 0.17, recovery: 0.16,
      damage: 16, baseKnockback: 380, scaling: 1.4, angle: -0.25,
      hitbox: { x: 50, y: -6, w: 72, h: 44 },
      swoosh: { radius: 62, sweep: Math.PI * 0.9, rot: -0.1 },
      sound: 'spear'
    },
    nAir: {
      name: 'Neutral Air (Skyward Spin Blade)',
      startup: 0.08, active: 0.2, recovery: 0.15,
      damage: 15, baseKnockback: 320, scaling: 1.1, angle: -Math.PI / 2,
      hitbox: { x: 0, y: -45, w: 70, h: 64 },
      swoosh: { radius: 56, sweep: Math.PI * 1.5, rot: -Math.PI / 2 },
      sound: 'spear'
    },
    dAir: {
      name: 'Down Air (Ground Pike Thrust)',
      startup: 0.12, active: 0.18, recovery: 0.18,
      damage: 16, baseKnockback: 360, scaling: 1.3, angle: Math.PI / 2.3,
      hitbox: { x: 12, y: 44, w: 52, h: 56 },
      swoosh: { radius: 52, sweep: Math.PI * 0.8, rot: Math.PI / 2 },
      sound: 'spear'
    }
  }
};

export const CHARACTERS = [
  {
    id: 'bodvar',
    name: 'BÖDVAR',
    title: 'The Bear Warrior',
    lore: 'Born of a Viking warrior and a she-bear, Bödvar conquered the mortal realm and kicked down the gates of Valhalla itself.',
    weapons: 'Greatsword & Hammer',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    skinColor: '#fed7aa',
    hairColor: '#b45309',
    capeColor: '#1e3a8a',
    stats: { str: 6, dex: 6, def: 5, spd: 5 },
    weaponType: 'sword',
    sigNames: {
      neutral: 'Bear Claw Uppercut',
      side: 'Savage Greatsword Charge',
      down: 'Earthshaker Hammer Slam'
    }
  },
  {
    id: 'cassidy',
    name: 'CASSIDY',
    title: 'The Frontier Marshal',
    lore: 'At fifteen, Cassidy took down the bloodthirsty Bill Gang with dual peacemakers and lassoed a tornado into submission.',
    weapons: 'Dual Blasters & Mallet',
    primaryColor: '#ea580c',
    secondaryColor: '#fef08a',
    skinColor: '#fde047',
    hairColor: '#78350f',
    capeColor: '#9a3412',
    stats: { str: 6, dex: 8, def: 4, spd: 4 },
    weaponType: 'blasters',
    sigNames: {
      neutral: 'High Noon Fan-the-Hammer',
      side: 'Wild West Quickdraw Rush',
      down: 'Dust Devil Lasso Spin'
    }
  },
  {
    id: 'orion',
    name: 'ORION',
    title: 'The Star Knight',
    lore: 'A mysterious golden automaton forged in nebulae. His armor burns with the eternal starlight of distant supernovas.',
    weapons: 'Rocket Lance & Spear',
    primaryColor: '#eab308',
    secondaryColor: '#0284c7',
    skinColor: '#facc15',
    hairColor: '#38bdf8',
    capeColor: '#0369a1',
    stats: { str: 4, dex: 6, def: 6, spd: 6 },
    weaponType: 'lance',
    sigNames: {
      neutral: 'Cosmic Sky Piercer',
      side: 'Rocket Thruster Charge',
      down: 'Supernova Burst'
    }
  },
  {
    id: 'hattori',
    name: 'HATTORI',
    title: 'The Demon Bride',
    lore: 'Trained in secret shinobi arts, Hattori bartered her soul to a demon king to master the impossible shadow strike.',
    weapons: 'Dual Katars & Katana',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    skinColor: '#cbd5e1',
    hairColor: '#18181b',
    capeColor: '#581c87',
    stats: { str: 4, dex: 6, def: 4, spd: 8 },
    weaponType: 'katars',
    sigNames: {
      neutral: 'Shadow Teleport Slash',
      side: 'Mist Veil Dash',
      down: 'Smoke Demon Trap'
    }
  },
  {
    id: 'vraxx',
    name: 'LORD VRAXX',
    title: 'The Alien Overlord',
    lore: 'Supreme ruler of Galactic Sector 9. Lord Vraxx fights with high-tech laser blasters and unbridled galactic arrogance.',
    weapons: 'Ray Blasters & Lance',
    primaryColor: '#10b981',
    secondaryColor: '#84cc16',
    skinColor: '#4ade80',
    hairColor: '#14532d',
    capeColor: '#064e3b',
    stats: { str: 4, dex: 8, def: 4, spd: 6 },
    weaponType: 'blasters',
    sigNames: {
      neutral: 'Orbital Plasma Cannon',
      side: 'Hover Hovercraft Strafe',
      down: 'Vaporizer Minefield'
    }
  },
  {
    id: 'nai',
    name: 'QUEEN NAI',
    title: 'The Jaguar Queen',
    lore: 'The living avatar of eleven Aztec serpent gods. Queen Nai wields ritual obsidian daggers with superhuman durability.',
    weapons: 'Serpent Spear & Katars',
    primaryColor: '#f97316',
    secondaryColor: '#14b8a6',
    skinColor: '#b45309',
    hairColor: '#0f172a',
    capeColor: '#0d9488',
    stats: { str: 7, dex: 4, def: 8, spd: 3 },
    weaponType: 'spear',
    sigNames: {
      neutral: 'Serpent God Eruption',
      side: 'Jaguar Leap Pounce',
      down: 'Quetzalcoatl Wings'
    }
  },
  {
    id: 'roland',
    name: 'SIR ROLAND',
    title: 'The Golden Paladin',
    lore: 'The most decorated knight in Britannia. Roland single-handedly defeated dragons and legions beneath his radiant crest.',
    weapons: 'Broadsword & Lance',
    primaryColor: '#f43f5e',
    secondaryColor: '#fbbf24',
    skinColor: '#fed7aa',
    hairColor: '#fbbf24',
    capeColor: '#be123c',
    stats: { str: 5, dex: 5, def: 8, spd: 4 },
    weaponType: 'sword',
    sigNames: {
      neutral: 'Valiant Holy Sword Cleave',
      side: 'Royal Steed Lance Charge',
      down: 'Aegis Shield Flare'
    }
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export function getWeaponAttacks(weaponType) {
  return WEAPON_ATTACKS[weaponType] || WEAPON_ATTACKS.sword;
}
