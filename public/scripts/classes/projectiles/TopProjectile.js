import { CELL_HEIGHT } from "../../constants.js";
import Projectile from "./Projectile.js";

export default class TopProjectile extends Projectile {
    constructor(game, x, y, w, h) {
        super(game, x, y, w, h);
        this.topPos = y - CELL_HEIGHT;
    }
    update() {
        this.x += this.speed * this.game.gameSpeed;
        if (this.y > this.topPos) {
            this.y -= this.speed * this.game.gameSpeed;
        }
        this.draw();
        this.checkCollision();
    }
}
