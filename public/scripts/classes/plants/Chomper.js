import Plant from "./Plant.js";
import { CELL_WIDTH, chomp, ChomperSprite } from "../../constants.js";

export default class Chomper extends Plant {
    static cost = 50;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.cooldownTime = 600; // Base cooldown in frames (~10 sec at 60fps)
        this.attackRange = 50; // Base attack range
        this.cooldownEndFrame = 0; // Track when cooldown ends
    }

    getPlantName() {
        return "Chomper";
    }

    applyUpgrade() {
        // Reduce cooldown by 15% per level
        this.cooldownTime = Math.floor(600 * Math.pow(0.85, this.level - 1));
        // Increase attack range by 20 per level
        this.attackRange = 50 + (this.level - 1) * 20;
    }

    getUpgradeBenefit() {
        return "-15% Cooldown, +Range";
    }

    initPlantAnimation() {
        // Animation support variables
        this.startFrameX = 0;
        this.startFrameY = 0;
        this.endFrameX = 2;
        this.endFrameY = 2;
        this.minFrame = 0;
        this.maxFrame = 10;
        this.frameX = this.startFrameX;
        this.frameY = this.startFrameY;
        this.spriteW = 130;
        this.spriteH = 114;
        this.animationSpeed = 5;

        // Offset for drawing image
        this.offsetX = 0;
        this.offsety = 30;
        this.offsetW = 50;
        this.offsetH = 50;
    }

    // Loads the sprite of the zombie
    loadSprite() {
        this.plantType = ChomperSprite;
    }

    updateAnimation() {
        if (this.attackNow) {
            // If attacking show attack animation
            this.startFrameX = 3;
            this.startFrameY = 2;
            this.endFrameX = 5;
            this.endFrameY = 4;

            // Stop the attacking mode after the animation is finished
            this.attackNow = false;
        } else if (this.cooldown) {
            // If in cooldown shows the digesting animation
            this.startFrameX = 6;
            this.startFrameY = 4;
            this.endFrameX = 10;
            this.endFrameY = 5;
        } else if (!this.attackNow && !this.cooldown) {
            // Shows idle animation if neither are true
            this.startFrameX = 0;
            this.startFrameY = 0;
            this.endFrameX = 2;
            this.endFrameY = 2;
        }
    }

    attack() {
        // Check if cooldown has ended (frames-based, respects game speed)
        if (this.cooldown && this.game.frames >= this.cooldownEndFrame) {
            this.cooldown = false;
            this.frameX = 0;
            this.frameY = 0;
        }

        if (this.attacking && !this.cooldown) {
            this.game.zombies.every((zombie) => {
                if (
                    zombie.y === this.y &&
                    zombie.x - (this.x + this.w) <= CELL_WIDTH - this.attackRange &&
                    zombie.x - (this.x + this.w) >= -CELL_WIDTH
                ) {
                    // Set the attacking mode true
                    this.attackNow = true;
                    this.cooldown = true;

                    // Set cooldown end frame (respects game speed)
                    this.cooldownEndFrame = this.game.frames + this.cooldownTime;

                    // Set the frame on attacking animation frame
                    this.frameX = 9;
                    this.frameY = 3;

                    // Eat the zombie
                    this.game.volume && chomp.play();
                    zombie.delete = true;
                    this.game.score += 10;

                    // stop the loop
                    return false;
                }

                // continue the loop
                return true;
            });
        }
    }
}
