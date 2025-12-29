import Plant from "./Plant.js";
import { isCollided } from "../../utils.js";
import { SpikeweedSprite } from "../../constants.js";

export default class Spikeweed extends Plant {
    static cost = 20;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.damagePerTick = 0.12; // Base damage per tick
        this.hitCooldown = 30; // Frames between hit effects
        this.hitCooldownEnd = 0;
    }

    getPlantName() {
        return "Spikeweed";
    }

    applyUpgrade() {
        // Increase damage by 50% per level
        this.damagePerTick = 0.12 * (1 + (this.level - 1) * 0.5);
    }

    getUpgradeBenefit() {
        return "+50% Damage";
    }

    initPlantAnimation() {
        // Animation support variables
        this.startFrameX = 0;
        this.startFrameY = 0;
        this.endFrameX = 9;
        this.endFrameY = 1;
        this.minFrame = 0;
        this.maxFrame = 10;
        this.frameX = this.startFrameX;
        this.frameY = this.startFrameY;
        this.spriteW = 100;
        this.spriteH = 41;
        this.animationSpeed = 5;

        // Offset for drawing image
        this.offsetX = 0;
        this.offsety = -75;
        this.offsetW = 20;
        this.offsetH = -50;

        this.hit = false;
    }

    // Loads the sprite of the zombie
    loadSprite() {
        this.plantType = SpikeweedSprite;
    }

    handleCollision() {
        // Check if hit cooldown ended
        if (this.hit && this.game.frames >= this.hitCooldownEnd) {
            this.hit = false;
        }

        this.game.zombies.forEach((zombie) => {
            if (isCollided(this, zombie)) {
                zombie.health -= this.damagePerTick * this.game.gameSpeed;
                if (!this.hit) {
                    zombie.hit = true;
                    this.hit = true;
                    this.hitCooldownEnd = this.game.frames + this.hitCooldown;
                }
            }
        });
    }
}
