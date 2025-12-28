import Chomper from "./classes/plants/Chomper.js";
import MelonPult from "./classes/plants/MelonPult.js";
import PeaShooter from "./classes/plants/PeaShooter.js";
import PotatoMines from "./classes/plants/PotatoMines.js";
import Repeater from "./classes/plants/Repeater.js";
import Spikeweed from "./classes/plants/Spikeweed.js";
import Sunflower from "./classes/plants/Sunflower.js";
import ThreePeaShooter from "./classes/plants/ThreePeaShooter.js";
import WallNut from "./classes/plants/WallNut.js";

import Zombie from "./classes/zombies/Zombie.js";
import NormalZombie from "./classes/zombies/NormalZombie.js";
import BucketHeadZombie from "./classes/zombies/BucketHeadZombie.js";
import ConeHeadZombie from "./classes/zombies/ConeHeadZombie.js";
import BallonZombie from "./classes/zombies/BallonZombie.js";
import DragonZombie from "./classes/zombies/DragonZombie.js";

import Sun from "./classes/Sun.js";
import LawnCleaner from "./classes/LawnCleaner.js";
import {
    getHighScore,
    setHighScore,
    initializeGrid,
    isCollided,
} from "./utils.js";

import {
    canvas,
    ctx,
    CELL_WIDTH,
    CELL_HEIGHT,
    mouseStatus,
    bg,
    GRID_COL_START_POS,
    GRID_ROW_START_POS,
    gameState,
    CELL_PAD,
    PeaShooterCard,
    ThreePeaShooterCard,
    RepeaterCard,
    ChomperCard,
    WallNutCard,
    PotatoMinesCard,
    resourcescard,
    MelonPultCard,
    SpikeweedCard,
    SunflowerCard,
    LAWN_CLEANER_WIDTH,
    Button,
    theme,
    clickSound,
    loadImages,
    loading,
    startMenuBtn,
    ShovelBtn,
    ShovelImg,
    musicImg,
    volumeImg,
} from "./constants.js";

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        startSunCount: 300,
        sunSpawnRate: 300, // Faster sun spawns
        zombieSpawnRate: 550, // Slower zombie spawns
        minSpawnRate: 400,
        spawnRateDecrease: 10,
        zombieHealthMultiplier: 0.7,
        zombieSpeedMultiplier: 1.2, // Still reasonably fast
        // Wave thresholds: when stronger zombies appear (6 waves)
        waveThresholds: [2500, 5000, 9000, 14000, 20000],
        plantCooldown: 3500,
    },
    normal: {
        startSunCount: 200,
        sunSpawnRate: 400,
        zombieSpawnRate: 400, // Faster spawns
        minSpawnRate: 300,
        spawnRateDecrease: 15,
        zombieHealthMultiplier: 1.0,
        zombieSpeedMultiplier: 1.5, // Noticeably faster
        waveThresholds: [1500, 3500, 6500, 10000, 15000],
        plantCooldown: 4500,
    },
    hard: {
        startSunCount: 150,
        sunSpawnRate: 500,
        zombieSpawnRate: 300, // Very fast spawns
        minSpawnRate: 220,
        spawnRateDecrease: 20,
        zombieHealthMultiplier: 1.2, // Tankier
        zombieSpeedMultiplier: 1.8, // Very fast
        waveThresholds: [1000, 2500, 4500, 7500, 12000],
        plantCooldown: 5000,
    }
};

class Game {
    constructor() {
        // Get canvas relative position
        this.canvasPosition = canvas.getBoundingClientRect();
        this.animationId = undefined;

        // Get dom elements
        this.startMenu = document.querySelector(".start-menu");
        this.startBtn = document.querySelector(".start-menu__btn");
        this.difficultySelect = document.querySelector(".difficulty-select");
        this.difficultyBtns = document.querySelectorAll(".difficulty-btn");
        this.endMenu = document.querySelector(".end-menu");
        this.endBtn = document.querySelector(".end-menu__btn");
        this.endScore = document.querySelector(".end-menu__score");
        this.endHighscore = document.querySelector(".end-menu__highscore");

        // Difficulty setting
        this.difficulty = "normal";
        this.diffSettings = DIFFICULTY_SETTINGS.normal;

        // Level system
        this.gameLevel = 1;
        this.zombiesKilled = 0;
        this.zombiesToKill = 0; // Set per level
        this.levelComplete = false;
        this.showingLevelComplete = false;
        this.levelCompleteTimer = 0;

        // Initialize variables
        this.grids = [];
        this.zombies = [];
        this.suns = [];
        this.projectiles = [];
        this.plants = [];
        this.lawnCleaners = [];

        this.score = 0;
        this.highScore = 0;
        this.sunCounts = 200;
        this.zombiesSpawnRate = 450;
        this.zombiesPositions = [];
        this.plantCooldownTime = 5000; // In millisecond
        this.selectedPlant = 0;
        this.selectedPlantHoverImg = undefined;
        this.frames = 1;

        // Booleans
        this.shovelSelected = false;
        this.music = true;
        this.volume = true;

        // Boundaries
        this.shovelBoundary = {
            x: 200,
            y: 15,
            w: 85,
            h: 85,
        };
        this.musicBoundary = {
            x: canvas.width - 300,
            y: 15,
            w: 40,
            h: 40,
        };

        this.volumeBoudnary = {
            x: canvas.width - 350,
            y: 15,
            w: 40,
            h: 40,
        };

        this.speedBoundary = {
            x: canvas.width - 400,
            y: 15,
            w: 40,
            h: 40,
        };

        // Game speed multiplier
        this.gameSpeed = 1;
        this.speedOptions = [1, 2, 3];
        this.speedIndex = 0;

        // Hover tooltip state
        this.hoveredPlant = null;

        // Zombies organized by waves (weak to strong)
        // Note: Zombie class = Football Zombie (strong!), NormalZombie = basic weak zombie
        this.zombieWaves = [
            // Wave 1: Only basic weak zombies
            [NormalZombie],
            // Wave 2: Add cone heads
            [NormalZombie, NormalZombie, ConeHeadZombie],
            // Wave 3: Add bucket heads
            [NormalZombie, ConeHeadZombie, ConeHeadZombie, BucketHeadZombie],
            // Wave 4: Add balloon zombies
            [NormalZombie, ConeHeadZombie, BucketHeadZombie, BallonZombie],
            // Wave 5: Add football zombies
            [NormalZombie, ConeHeadZombie, BucketHeadZombie, BallonZombie, Zombie],
            // Wave 6: All zombies including dragon
            [NormalZombie, ConeHeadZombie, BucketHeadZombie, BallonZombie, Zombie, DragonZombie],
        ];
        this.currentWave = 0;

        this.plantsTypes = [
            {
                card: SunflowerCard,
                blueprint: Sunflower,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: PeaShooterCard,
                blueprint: PeaShooter,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: RepeaterCard,
                blueprint: Repeater,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: ThreePeaShooterCard,
                blueprint: ThreePeaShooter,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: ChomperCard,
                blueprint: Chomper,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: WallNutCard,
                blueprint: WallNut,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: PotatoMinesCard,
                blueprint: PotatoMines,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: SpikeweedCard,
                blueprint: Spikeweed,
                canPlant: true,
                cooldownStart: 0,
            },
            {
                card: MelonPultCard,
                blueprint: MelonPult,
                canPlant: true,
                cooldownStart: 0,
            },
        ];
    }

    // Apply difficulty settings
    applyDifficultySettings() {
        this.sunCounts = this.diffSettings.startSunCount;
        this.zombiesSpawnRate = this.diffSettings.zombieSpawnRate;
        this.plantCooldownTime = this.diffSettings.plantCooldown;
        this.currentWave = 0;
        this.setupLevel();
    }

    // Setup level parameters
    setupLevel() {
        // Zombies to kill increases with level
        this.zombiesToKill = 10 + (this.gameLevel - 1) * 8; // Level 1: 10, Level 2: 18, Level 3: 26...
        this.zombiesKilled = 0;
        this.levelComplete = false;
        this.showingLevelComplete = false;

        // Adjust difficulty per level
        const levelMultiplier = 1 + (this.gameLevel - 1) * 0.1;
        this.zombiesSpawnRate = Math.floor(this.diffSettings.zombieSpawnRate / levelMultiplier);

        console.log(`Level ${this.gameLevel}: Kill ${this.zombiesToKill} zombies!`);
    }

    // Check if level is complete
    checkLevelComplete() {
        if (this.zombiesKilled >= this.zombiesToKill && !this.levelComplete && this.zombies.length === 0) {
            this.levelComplete = true;
            this.showingLevelComplete = true;
            this.levelCompleteTimer = 180; // 3 seconds at 60fps
            console.log(`Level ${this.gameLevel} Complete!`);
        }
    }

    // Advance to next level
    nextLevel() {
        this.gameLevel++;
        this.frames = 1;
        this.currentWave = 0;

        // Bonus sun for completing level
        const bonus = 50 + this.gameLevel * 25;
        this.sunCounts += bonus;

        // Clear remaining projectiles
        this.projectiles = [];

        // Setup new level
        this.setupLevel();

        console.log(`Starting Level ${this.gameLevel}! Bonus: +${bonus} sun`);
    }

    // Get current wave based on frames
    updateWave() {
        const thresholds = this.diffSettings.waveThresholds;
        let newWave = 0;
        for (let i = 0; i < thresholds.length; i++) {
            if (this.frames >= thresholds[i]) {
                newWave = i + 1;
            }
        }
        if (newWave !== this.currentWave) {
            this.currentWave = newWave;
            console.log(`Wave ${this.currentWave + 1} started!`);
        }
    }

    // Get available zombie types for current wave
    getAvailableZombies() {
        const waveIndex = Math.min(this.currentWave, this.zombieWaves.length - 1);
        return this.zombieWaves[waveIndex];
    }

    adddListeners() {
        // Get the new relative position of the canvas on resize
        window.addEventListener("resize", () => {
            this.canvasPosition = canvas.getBoundingClientRect();
        });

        // Handle difficulty selection
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                this.difficulty = btn.dataset.difficulty;
                this.diffSettings = DIFFICULTY_SETTINGS[this.difficulty];
                this.applyDifficultySettings();
                this.difficultySelect.classList.add("hide");
                this.startMenu.classList.add("hide");
                theme.play();
                theme.volume = 0.3;
                theme.loop = true;
                this.animate();
            });
        });

        // Plays the game when start button is clicked (legacy, now shows difficulty)
        this.startBtn.addEventListener("click", () => {
            this.startMenu.classList.add("hide");
            theme.play();
            theme.volume = 0.3;
            theme.loop = true;
            this.animate();
        });

        // Adds the restart button listener - shows difficulty selection
        this.endMenu.addEventListener("click", () => {
            this.endMenu.classList.add("hide");
            this.reset();
            this.init();
            // Show start menu with difficulty selection
            this.startMenu.classList.remove("hide");
            this.difficultySelect.classList.remove("hide");
        });

        // Updates the mouse status everytime the mouse moves
        canvas.addEventListener("mousemove", (e) => {
            mouseStatus.x = e.x - this.canvasPosition.left;
            mouseStatus.y = e.y - this.canvasPosition.top;
        });

        // Updates the position of the mouseState variable when mouse moves
        canvas.addEventListener("mouseleave", () => {
            mouseStatus.x = 0;
            mouseStatus.y = 0;
        });

        // Sets the mouse status as clicked when clicked
        canvas.addEventListener("mousedown", () => {
            mouseStatus.clicked = true;
        });

        // Sets the mouse status as unclicked when click is removed
        canvas.addEventListener("mouseup", () => {
            mouseStatus.clicked = false;
        });

        // Adds click listener on canvas
        canvas.addEventListener("click", this.onClick.bind(this));

        // Right-click to cancel plant selection
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.selectedPlant = -1;
            this.shovelSelected = false;
        });

        // Escape to cancel plant selection
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.selectedPlant = -1;
                this.shovelSelected = false;
            }
        });
    }

    // Functions to do on click event
    onClick() {
        this.volume && clickSound.play();
        let cellPosX;
        let cellPosY;

        // Find the collided cell and extracts it's position
        this.grids.every((cell) => {
            if (isCollided(cell, mouseStatus)) {
                cellPosX = cell.x + CELL_PAD;
                cellPosY = cell.y + CELL_PAD;
                return false; // Stops the loop
            }
            return true; // Continues iterating through the loop
        });

        // Stops from placing the plants outside of the grid
        if (
            cellPosX === undefined ||
            cellPosY === undefined ||
            cellPosX < GRID_COL_START_POS ||
            cellPosY < GRID_ROW_START_POS
        ) {
            // Unselect the shovel if selected
            if (
                this.shovelSelected &&
                !isCollided(mouseStatus, this.shovelBoundary)
            ) {
                this.shovelSelected = false;
            }
            return;
        }

        // Checks whether there is already a plant in selected cell
        for (let i = 0; i < this.plants.length; i++) {
            if (
                this.plants[i].x === cellPosX &&
                this.plants[i].y === cellPosY
            ) {
                // If the shovel is selected then remove the plant
                if (this.shovelSelected) {
                    this.plants.splice(i, 1);
                    this.shovelSelected = false;
                    return;
                }

                // Try to upgrade the plant if it's upgradeable
                const plant = this.plants[i];
                if (plant.upgradeable && plant.canUpgrade(this.sunCounts)) {
                    const cost = plant.getUpgradeCost();
                    this.sunCounts -= cost;
                    plant.upgrade();
                }
                return;
            }
        }

        //If the user has required number of sun then the plant is placed at the selected cell position
        let CurrentPlant = this.plantsTypes[this.selectedPlant];
        if (
            !this.shovelSelected &&
            CurrentPlant &&
            CurrentPlant.canPlant &&
            CurrentPlant.blueprint.cost <= this.sunCounts
        ) {
            this.plants.push(
                new CurrentPlant.blueprint(
                    this,
                    cellPosX,
                    cellPosY,
                    CELL_WIDTH - 25,
                    CELL_HEIGHT - 25
                )
            );

            // Subtract the cost of the plant from the sun count
            this.sunCounts -= CurrentPlant.blueprint.cost;

            // Make the plant cannot be placed again until the cooldown time
            CurrentPlant.canPlant = false;
            CurrentPlant.cooldownStart = Date.now();
            setTimeout(() => {
                CurrentPlant.canPlant = true;
            }, this.plantCooldownTime);
        }

        this.shovelSelected = false;
    }

    // Initializes the lawn cleaners
    initializeLawnCleaners() {
        for (
            let row = GRID_ROW_START_POS;
            row < canvas.height - CELL_HEIGHT;
            row += CELL_HEIGHT
        ) {
            this.lawnCleaners.push(
                new LawnCleaner(
                    this,
                    350,
                    row + 30,
                    LAWN_CLEANER_WIDTH,
                    LAWN_CLEANER_WIDTH
                )
            );
        }
    }

    //Draws the grid
    drawGrid() {
        this.grids.forEach((gridCell) => {
            gridCell.draw();
        });
    }

    // Draws the plants
    manageAllPlants() {
        this.plants.forEach((plant) => {
            plant.update();
        });

        // Removes plants whose health are below 0
        this.plants = this.plants.filter((plant) => plant.health > 0);
    }

    // Manages all the zombies on the ground
    manageAllZombies() {
        this.zombies.forEach((zombie) => {
            // Updates the zombies positions and animations
            zombie.update();

            // If zombie reaches the house then the game is set as over
            if (zombie.x < GRID_COL_START_POS - LAWN_CLEANER_WIDTH) {
                gameState.current = gameState.gameOver;
            }

            // If the zomibes health is 0 then the zombie is set as dying and
            // attacking is set as false
            if (zombie.health <= 0 && !zombie.die) {
                zombie.die = true;
                zombie.attacking = false;
                this.zombiesKilled++;
                this.score += 10;
            }
        });

        // Randomly select the row at which the new zombie will spawn
        let selectedRow =
            Math.floor(Math.random() * 5) * CELL_HEIGHT +
            GRID_ROW_START_POS +
            CELL_PAD;

        // Update current wave based on game progress
        this.updateWave();

        // Check if level is complete
        this.checkLevelComplete();

        // Stop spawning if we've spawned enough zombies for this level
        const totalSpawned = this.zombiesKilled + this.zombies.length;
        if (totalSpawned >= this.zombiesToKill || this.levelComplete) {
            return; // Don't spawn more zombies
        }

        // If frames is equal to zombie spawn rate spawn zombie
        if (this.frames % this.zombiesSpawnRate === 0) {
            // Get available zombies for current wave
            const availableZombies = this.getAvailableZombies();

            // Choose a random zombie type from available pool
            let choice = Math.floor(Math.random() * availableZombies.length);

            // Create the zombie
            const zombie = new availableZombies[choice](
                this,
                canvas.width,
                selectedRow,
                CELL_WIDTH,
                CELL_HEIGHT
            );

            // Apply difficulty modifiers
            zombie.health *= this.diffSettings.zombieHealthMultiplier;
            zombie.velocity *= this.diffSettings.zombieSpeedMultiplier;
            zombie.increment = zombie.velocity;

            this.zombies.push(zombie);
            this.zombiesPositions.push(selectedRow);

            // Decreases the zombie spawn rate gradually based on difficulty
            const minRate = this.diffSettings.minSpawnRate;
            const decrease = this.diffSettings.spawnRateDecrease;
            this.zombiesSpawnRate -= this.zombiesSpawnRate > minRate ? decrease : 0;
        }
    }

    // Manages all the projectiles
    manageAllProjectiles() {
        this.projectiles.forEach((projectile) => {
            projectile.update();
        });
    }

    // Manages all the suns
    manageSuns() {
        const sunRate = this.diffSettings ? this.diffSettings.sunSpawnRate : 400;
        if (this.frames % sunRate === 0) {
            // Randomly select the position for the sun to spawn
            let x =
                Math.random() * (canvas.width - CELL_WIDTH * 2) +
                GRID_COL_START_POS;

            // Gradually bring the sun from the top to the position
            let y = Math.random() * 5 * CELL_HEIGHT + GRID_ROW_START_POS;
            this.suns.push(new Sun(this, x, y, 0));
        }

        // Updates the position of the sun
        this.suns.forEach((sun) => {
            sun.update();

            // If the mouse is hovered over the sun then the sun is collected
            if (isCollided(sun, mouseStatus)) {
                this.sunCounts += sun.value;
                sun.collect = true;
            }
        });
    }

    // Manages all the lawn cleaners
    manageLawnCleaners() {
        this.lawnCleaners.forEach((lawncleaner) => {
            lawncleaner.update();
        });
    }

    // Cleans all the orphan objects
    cleanOrphanObjects() {
        // Clears orphan projectiles
        this.projectiles = this.projectiles.filter(
            (projectile) => !projectile.delete
        );

        // Clears orphan suns
        this.suns = this.suns.filter((sun) => !sun.delete);

        // Clears orphan zombies
        this.zombies = this.zombies.filter((zombie) => !zombie.delete);
    }

    // Shows all the resources
    showResources() {
        // Draws the sun counts
        ctx.drawImage(resourcescard, 20, 15, 145, 45);
        ctx.fillStyle = "black";
        ctx.font = "30px Creepster";
        ctx.fillText(this.sunCounts, 79, 48);

        // Draws the HighScore
        ctx.font = "25px Creepster";
        ctx.fillStyle = "#ffe9ac";
        ctx.drawImage(Button, canvas.width - 225, 10, 225, 60);
        ctx.fillText(`High Score: ${this.highScore}`, canvas.width - 195, 44);

        // Draws the Score
        ctx.fillStyle = "#ffe9ac";
        ctx.drawImage(Button, 20, 70, 135, 50);
        ctx.fillText(`Score ${this.score}`, 39, 101);

        // Draws Level and Progress
        ctx.font = "22px Creepster";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Level ${this.gameLevel}`, canvas.width - 200, 85);

        // Progress bar
        const progress = Math.min(this.zombiesKilled / this.zombiesToKill, 1);
        const barWidth = 150;
        const barHeight = 15;
        const barX = canvas.width - 210;
        const barY = 95;

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = progress >= 1 ? "#4CAF50" : "#FFC107";
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Kill count
        ctx.font = "14px Creepster";
        ctx.fillStyle = "#fff";
        ctx.fillText(`${this.zombiesKilled}/${this.zombiesToKill}`, barX + barWidth + 10, barY + 12);

        // Difficulty indicator
        ctx.font = "16px Creepster";
        const diffColors = { easy: "#4CAF50", normal: "#FFC107", hard: "#F44336" };
        ctx.fillStyle = diffColors[this.difficulty] || "#fff";
        ctx.fillText(`${this.difficulty.toUpperCase()}`, canvas.width - 80, 125);
    }

    // Show level complete screen
    showLevelComplete() {
        if (!this.showingLevelComplete) return;

        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Victory text
        ctx.font = "80px Creepster";
        ctx.fillStyle = "#4CAF50";
        ctx.textAlign = "center";
        ctx.fillText(`LEVEL ${this.gameLevel} COMPLETE!`, canvas.width / 2, canvas.height / 2 - 50);

        // Bonus info
        const bonus = 50 + (this.gameLevel + 1) * 25;
        ctx.font = "40px Creepster";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(`Bonus: +${bonus} sun`, canvas.width / 2, canvas.height / 2 + 30);

        ctx.font = "30px Creepster";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Next level starting...`, canvas.width / 2, canvas.height / 2 + 90);

        ctx.textAlign = "left";

        // Timer countdown
        this.levelCompleteTimer--;
        if (this.levelCompleteTimer <= 0) {
            this.showingLevelComplete = false;
            this.nextLevel();
        }
    }

    // Draws the plant cards for selecting the plants
    showCards() {
        this.plantsTypes.forEach((plant, idx) => {
            //  Sets the default boundary
            let cardBoundary = {
                x: 20,
                y: GRID_ROW_START_POS + 80 * idx,
                w: 100,
                h: 59,
            };

            // Sets the y position of the card
            let cardY = GRID_ROW_START_POS + 80 * idx;

            // Calculate card dimensions
            let cardW = idx === this.selectedPlant ? cardBoundary.w + 15 : cardBoundary.w;
            let cardH = idx === this.selectedPlant ? cardBoundary.h + 8 : cardBoundary.h;

            // Draws the card
            ctx.drawImage(
                plant.card,
                0,
                plant.canPlant || idx === 8 ? 1 : 61,
                cardBoundary.w,
                cardBoundary.h,
                cardBoundary.x,
                cardY,
                cardW,
                cardH
            );

            // Draw cooldown overlay animation
            if (!plant.canPlant && plant.cooldownStart > 0) {
                let elapsed = Date.now() - plant.cooldownStart;
                let remaining = this.plantCooldownTime - elapsed;
                let progress = Math.max(0, remaining / this.plantCooldownTime);

                // Draw dark overlay that shrinks from top to bottom
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                let overlayHeight = cardH * progress;
                ctx.fillRect(cardBoundary.x, cardY, cardW, overlayHeight);

                // Draw remaining seconds text
                if (remaining > 0) {
                    let seconds = Math.ceil(remaining / 1000);
                    ctx.fillStyle = "#fff";
                    ctx.font = "bold 20px Creepster";
                    ctx.fillText(seconds + "s", cardBoundary.x + cardW / 2 - 10, cardY + cardH / 2 + 5);
                }
            }

            // Adds the cost of the plant
            ctx.fillStyle = "black";
            ctx.font = "30px Creepster";
            ctx.fillText(
                plant.blueprint.cost,
                cardBoundary.x + cardBoundary.w - 32,
                cardBoundary.y + cardBoundary.h - 18
            );

            // Clicked plant is selected from the card
            if (isCollided(mouseStatus, cardBoundary)) {
                canvas.style.cursor = "pointer";
                if (mouseStatus.clicked) {
                    this.selectedPlant = idx;
                }
            }
        });
    }

    manageShovel() {
        // Selects the shovel when clicked on the shovel button
        if (
            isCollided(mouseStatus, this.shovelBoundary) &&
            mouseStatus.clicked
        ) {
            this.shovelSelected = true;
        }

        // Draws the shovel button if the shovel is not selected else
        // the shovel is drawn where the mouse position is
        if (!this.shovelSelected) {
            ctx.drawImage(ShovelBtn, 200, 15, 85, 85);
        } else {
            ctx.drawImage(
                ShovelImg,
                mouseStatus.x - this.shovelBoundary.w / 2,
                mouseStatus.y - this.shovelBoundary.h / 2,
                this.shovelBoundary.w,
                this.shovelBoundary.h
            );
        }
    }

    // Check plant hover and draw tooltip
    managePlantHover() {
        this.hoveredPlant = null;

        // Check if mouse is over any plant
        for (const plant of this.plants) {
            const plantBounds = {
                x: plant.x,
                y: plant.y,
                w: plant.w,
                h: plant.h
            };

            if (isCollided(mouseStatus, plantBounds)) {
                this.hoveredPlant = plant;
                break;
            }
        }

        // Draw tooltip if hovering over an upgradeable plant
        if (this.hoveredPlant && this.hoveredPlant.upgradeable) {
            const plant = this.hoveredPlant;
            const tooltipX = plant.x + plant.w / 2;
            const tooltipY = plant.y - 10;

            // Tooltip background
            const tooltipW = 120;
            const tooltipH = plant.level < plant.maxLevel ? 55 : 40;

            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.beginPath();
            ctx.roundRect(tooltipX - tooltipW / 2, tooltipY - tooltipH, tooltipW, tooltipH, 8);
            ctx.fill();

            // Tooltip text
            ctx.fillStyle = "#fff";
            ctx.font = "16px Creepster";
            ctx.textAlign = "center";

            // Plant name and level
            const levelText = `${plant.getPlantName()} Lv.${plant.level}`;
            ctx.fillText(levelText, tooltipX, tooltipY - tooltipH + 20);

            // Upgrade cost (if not max level)
            if (plant.level < plant.maxLevel) {
                const cost = plant.getUpgradeCost();
                const canAfford = this.sunCounts >= cost;
                ctx.fillStyle = canAfford ? "#ffcc00" : "#ff6666";
                ctx.fillText(`Upgrade: ${cost}`, tooltipX, tooltipY - tooltipH + 42);
            } else {
                ctx.fillStyle = "#00ff00";
                ctx.fillText("MAX LEVEL", tooltipX, tooltipY - tooltipH + 20);
            }

            ctx.textAlign = "left";
            canvas.style.cursor = "pointer";
        }
    }

    // Manages Sound
    manageVolume() {
        if (
            isCollided(mouseStatus, this.volumeBoudnary) &&
            mouseStatus.clicked
        ) {
            this.volume = !this.volume;
            mouseStatus.clicked = false;
        }

        // Draws the volume icon
        ctx.drawImage(
            volumeImg,
            this.volumeBoudnary.x,
            this.volumeBoudnary.y,
            this.volumeBoudnary.w,
            this.volumeBoudnary.h
        );

        if (!this.volume) {
            ctx.fillStyle = "black";
            ctx.lineWidth = "4";
            ctx.beginPath();
            ctx.moveTo(
                this.volumeBoudnary.x + this.volumeBoudnary.w,
                this.volumeBoudnary.y
            );
            ctx.lineTo(
                this.volumeBoudnary.x,
                this.volumeBoudnary.y + this.volumeBoudnary.h
            );
            ctx.stroke();
        }
    }

    // Manage game speed
    manageSpeed() {
        // Toggle speed on click
        if (
            isCollided(mouseStatus, this.speedBoundary) &&
            mouseStatus.clicked
        ) {
            this.speedIndex = (this.speedIndex + 1) % this.speedOptions.length;
            this.gameSpeed = this.speedOptions[this.speedIndex];
            mouseStatus.clicked = false;
        }

        // Draw speed button
        const x = this.speedBoundary.x;
        const y = this.speedBoundary.y;
        const w = this.speedBoundary.w;
        const h = this.speedBoundary.h;

        // Button background
        ctx.fillStyle = this.gameSpeed > 1 ? "#4CAF50" : "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Speed text
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${this.gameSpeed}x`, x + w / 2, y + h / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
    }

    // Manage the music on and off function
    manageMusic() {
        // Toggles the music status
        if (
            isCollided(mouseStatus, this.musicBoundary) &&
            mouseStatus.clicked
        ) {
            this.music ? theme.pause() : theme.play();
            this.music = !this.music;

            // resets the mouse clicked status to false so that the
            // button is clicked only once
            mouseStatus.clicked = false;
        }

        // Draws the music icon
        ctx.drawImage(
            musicImg,
            this.musicBoundary.x,
            this.musicBoundary.y,
            this.musicBoundary.w,
            this.musicBoundary.h
        );
        if (!this.music) {
            ctx.fillStyle = "black";
            ctx.lineWidth = "4";
            ctx.beginPath();
            ctx.moveTo(
                this.musicBoundary.x + this.musicBoundary.w,
                this.musicBoundary.y
            );
            ctx.lineTo(
                this.musicBoundary.x,
                this.musicBoundary.y + this.musicBoundary.h
            );
            ctx.stroke();
        }
    }

    // Creates an animation loop
    animate() {
        ctx.fillStyle = "black";
        canvas.style.cursor = "default";

        // Draws the background image
        ctx.drawImage(bg, 0, 0, canvas.width + 573, canvas.height);

        // Draws the grid
        this.drawGrid();

        // Manages the objects in the game
        this.manageAllPlants();
        this.manageAllZombies();
        this.manageAllProjectiles();
        this.showResources();
        this.manageSuns();
        this.manageLawnCleaners();

        // Cleans the objects
        this.cleanOrphanObjects();

        // Displays the cards
        this.showCards();

        // Manage the shovel
        this.manageShovel();

        // Manage plant hover tooltip
        this.managePlantHover();

        // Manage the music
        this.manageMusic();

        // Manage volume
        this.manageVolume();

        // Manage game speed
        this.manageSpeed();

        // Show level complete screen if applicable
        this.showLevelComplete();

        // Increases frame by gameSpeed on every loop (used as a timer)
        if (!this.showingLevelComplete) {
            this.frames += this.gameSpeed;
        }

        // No longer auto-end game by time - now level-based

        // If the game is over it stops the animationFrame
        if (gameState.current !== gameState.gameOver) {
            // Continues the loop
            this.animationId = window.requestAnimationFrame(
                this.animate.bind(this)
            );
        } else if (gameState.current === gameState.gameOver) {
            // Pause the sound
            theme.pause();

            // Game is set as over]
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

            // Shows the game end menu
            this.endMenu.classList.remove("hide");

            // Posts the highscore value on the backend
            setHighScore(this.score);

            // Shows the score on the dom
            this.endScore.innerHTML = `Score: ${this.score}`;

            // Shows the high score
            this.endHighscore.innerHTML =
                this.score >= this.highScore
                    ? `High Score: ${this.score}`
                    : `High Score: ${this.highScore}`;
        }
    }

    // Resets all the varibales to initial value for reset
    reset() {
        this.zombies = [];
        this.suns = [];
        this.projectiles = [];
        this.plants = [];
        this.lawnCleaners = [];
        this.grids = [];

        this.frames = 1;
        this.score = 0;
        this.currentWave = 0;
        this.gameLevel = 1;
        this.zombiesKilled = 0;
        this.levelComplete = false;
        this.showingLevelComplete = false;

        // Apply difficulty settings
        this.applyDifficultySettings();

        console.log("music is ", this.music);
        console.log("theme is ", theme);
        this.music ? theme.play() : theme.pause();
        gameState.current = gameState.gamePlaying;
        window.cancelAnimationFrame(this.animationId);
    }

    // Initializes grids
    async init() {
        // Fetches data from the server
        this.highScore = await getHighScore();

        // Initializes Grid
        this.grids = initializeGrid(this);

        // LawnCleaners
        this.initializeLawnCleaners();

        // Add listeners
        this.adddListeners();
    }
}

const startGame = async () => {
    // Load Images
    await loadImages();

    // Hide loading
    loading.style.display = "none";

    // Show difficulty selection instead of start button
    const difficultySelect = document.querySelector(".difficulty-select");
    difficultySelect.classList.remove("hide");

    // Creates a game object
    const game = new Game();
    game.init();
};

startGame();
