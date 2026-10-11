/**
 * Input manager handling keyboard bindings for P1 and P2 + HTML5 Gamepad API
 */

export class InputManager {
  constructor() {
    this.keys = {};
    this.prevKeys = {};

    // Default Bindings
    this.bindings = {
      p1: {
        left: ['KeyA', 'a'],
        right: ['KeyD', 'd'],
        up: ['KeyW', 'w'],
        down: ['KeyS', 's'],
        jump: ['KeyW', 'w', 'Space'],
        light: ['KeyJ', 'j'],
        heavy: ['KeyK', 'k'],
        dodge: ['KeyL', 'l', 'ShiftLeft', 'ShiftRight']
      },
      p2: {
        left: ['ArrowLeft'],
        right: ['ArrowRight'],
        up: ['ArrowUp'],
        down: ['ArrowDown'],
        jump: ['ArrowUp'],
        light: ['Digit1', 'Numpad1'],
        heavy: ['Digit2', 'Numpad2'],
        dodge: ['Digit3', 'Numpad3', 'ControlRight', 'Slash']
      }
    };

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.keys[e.key] = true;

      // Prevent scrolling on arrows & space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.keys[e.key] = false;
    });
  }

  update() {
    // Poll Gamepads if connected
    this.pollGamepads();
  }

  pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;

    const gp = gamepads[0];
    const threshold = 0.35;

    // Map primary gamepad to P1
    if (gp.axes[0] < -threshold || gp.buttons[14]?.pressed) this.keys['GP_P1_LEFT'] = true;
    else this.keys['GP_P1_LEFT'] = false;

    if (gp.axes[0] > threshold || gp.buttons[15]?.pressed) this.keys['GP_P1_RIGHT'] = true;
    else this.keys['GP_P1_RIGHT'] = false;

    if (gp.axes[1] < -threshold || gp.buttons[12]?.pressed) this.keys['GP_P1_UP'] = true;
    else this.keys['GP_P1_UP'] = false;

    if (gp.axes[1] > threshold || gp.buttons[13]?.pressed) this.keys['GP_P1_DOWN'] = true;
    else this.keys['GP_P1_DOWN'] = false;

    // A/Cross: Jump (btn 0), X/Square: Light (btn 2), Y/Triangle: Heavy (btn 3), B/Circle/Triggers: Dodge (btn 1, 6, 7)
    this.keys['GP_P1_JUMP'] = gp.buttons[0]?.pressed || false;
    this.keys['GP_P1_LIGHT'] = gp.buttons[2]?.pressed || false;
    this.keys['GP_P1_HEAVY'] = gp.buttons[3]?.pressed || false;
    this.keys['GP_P1_DODGE'] = gp.buttons[1]?.pressed || gp.buttons[5]?.pressed || gp.buttons[7]?.pressed || false;
  }

  isDown(player, action) {
    const list = this.bindings[player][action];
    const gpKey = `GP_${player.toUpperCase()}_${action.toUpperCase()}`;
    if (this.keys[gpKey]) return true;

    return list.some(k => !!this.keys[k]);
  }

  isKey(keyName) {
    return !!this.keys[keyName];
  }

  getState(player) {
    return {
      left: this.isDown(player, 'left'),
      right: this.isDown(player, 'right'),
      up: this.isDown(player, 'up'),
      down: this.isDown(player, 'down'),
      jump: this.isDown(player, 'jump'),
      light: this.isDown(player, 'light'),
      heavy: this.isDown(player, 'heavy'),
      dodge: this.isDown(player, 'dodge')
    };
  }
}

export const input = new InputManager();
