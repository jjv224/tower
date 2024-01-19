import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { JetLagGameConfig } from "../jetlag/Config";
import { FilledBox, FilledPolygon, ImageSprite } from "../jetlag/Components/Appearance";
//import { TiltMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody } from "../jetlag/Components/RigidBody";
import { Destination, Enemy, Hero, Obstacle } from "../jetlag/Components/Role";
import { Actor } from "../jetlag/Entities/Actor";
import { KeyCodes } from "../jetlag/Services/Keyboard";
import { ManualMovement, PathMovement, ChaseMovement } from "../jetlag/Components/Movement";
import { Goodie } from "../jetlag/Components/Role";
import { Path } from "../jetlag/Components/Movement";
import { AnimationState, AnimationSequence } from "../jetlag/Config";
import { TextSprite } from "../jetlag/Components/Appearance";
import { Scene } from "../jetlag/Entities/Scene";
import { PolygonBody } from "../jetlag/Components/RigidBody";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
    pixelMeterRatio = 100;
    screenDimensions = { width: 1600, height: 900 };
    adaptToScreenSize = true;
    canVibrate = true;
    forceAccelerometerOff = true;
    storageKey = "--no-key--";
    hitBoxes = true;
    resourcePrefix = "./assets/";
    musicNames = ["doop.mp3"];
    soundNames = [];
    imageNames = ["player_e.png", "mustard_ball.png", "noise.png", "playerClear_e.png",
        "purple_ball.png", "red_ball.png", "wall_internal.png", "wall_down.png",
        "wall_up.png", "wall_left.png", "wall_right.png", "wall_topright.png",
        "wall_topleft.png", "wall_bottomleft.png", "wall_bottomright.png",
        "playerClear_Ewalk.png", "playerClear_Wwalk.png", "playerClear_w",
        "player_w.png", "player_Wwalk.png", "player_Ewalk.png"];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
    //Maze
    if (level == 1) {
        // Define the maze layout with walls, a hero, a destination, and a goodie
        const mazeLayout = [
            "#dd#############################################################",
            "r  lddddddddddd##########ddddddddddddddddddddddddddddddddddd####",
            "r  [ddd]       [dddddddd]                                   [###",
            "r                                                            l##",
            "r  {uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu  uuuuuuuuuu}uu####",
            "r  l#########################################  ###########dd####",
            "r  [ddddddddddddddddddddddddddddddddddddddddd  dddddddddd]  [dd#",
            "ruu##########################################                  l",
            "r########################r                                     l",
            "r###uuuuuuuuuuuuuuuuuuuuur  {uuuuuuuuuuuuuuuuuuuuuuuuuuuu}  {uu#",
            "r########################r  l############################r  l###",
            "r########################r  l############################r  l###",
            "r#########################uu#############################r  l###",
            "rdddddddddddddddddddddddddddddddddddddddddddddddddddddddd]  [dd#",
            "r                                                              l",
            "r                                                              l",
            "r}  {uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu  {uuuu}  {uuu",
            "r]  l#################r          #############      l####r  l###",
            "r   l#################r                             l####r  l###",
            "r  {##################r          {uuuuuuuuuuuuuuu}  l####r  l###",
            "r  l##################r          l###############r  l####r  l###",
            "r  [###################uuu}  {uuu################r  l####r  l###",
            "r     l###################r  l###################r  l####r  l###",
            "ru}  {ddd##dd##ddddddddddd]  [ddddddddddddddddddd]  [dddd]  [dd#",
            "rd]      lr  lr                                                l",
            "r        lr  lr                                                l",
            "#uuuuuuuu#r  l#uuuuuuuuuuu}  uuuuuu  uuuuuuuuuuuuuuu  uuu}  {uuu",
            "#ddddddddd]  [dddddddddddd]  dddddd  ddddddddddddddd  ddd]  [ddd",
            "r                                                              l",
            "r                                                              l",
            "r  {uuuuuuuuuuuuuuu}  {uuuuuuuuuu}  uuuuuuuuuuuuuuuuuuuuuuuuuuu#",
            "r  [ddddddddddddddd]  l##########r  [ddddddddddddddddddddd######",
            "r                     l##########r                        l#####",
            "r                     l##########r                        l#####",
            "r  {uuuuuuuuuuuuuuuuuu############uuuuuuuuuuuuuuuuuuuuuuuu######",
            "r  l############################################################",
        ];

        for (let row = 0; row < mazeLayout.length; row++) {
            for (let col = 0; col < mazeLayout[row].length; col++) {
                if (mazeLayout[row][col] === "#") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_internal.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "u") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_up.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "d") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_down.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "l") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_left.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "r") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_right.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "{") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_topleft.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "}") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_topright.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "[") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_bottomleft.png" }),
                        role: new Obstacle(),
                    });
                }
                if (mazeLayout[row][col] === "]") {
                    new Actor({
                        rigidBody: new BoxBody({ cx: col + 0.5, cy: row + 0.5, width: 1, height: 1 }),
                        appearance: new ImageSprite({ width: 1, height: 1, img: "wall_bottomright.png" }),
                        role: new Obstacle(),
                    });
                }
            }
        }
    }

    //animation properties
    let animations = new Map();
    animations.set(AnimationState.WALK_W, AnimationSequence.makeSimple({
        timePerFrame: 75, repeat: true,
        images: ["player_w.png", "player_Wwalk.png"]
    }));
    animations.set(AnimationState.WALK_E, AnimationSequence.makeSimple({
        timePerFrame: 75, repeat: true,
        images: ["player_e.png", "player_Ewalk.png"]
    }));
    //properties of our hero
    let hero = new Actor({
        appearance: new ImageSprite({ width: 0.48, height: 0.8, img: "player_e.png" }),
        rigidBody: new BoxBody({ cx: 2, cy: 35, width: 0.48, height: 0.8 }, { disableRotation: true }),
        role: new Hero({ strength: 1 }),
        movement: new ManualMovement(),
        extra: {}
    });

    //Allows hero to change and complete level
    let onCollect = (_g: Actor, h: Actor) => {
        let s = ++(h.role as Hero).strength;
        (h.appearance as ImageSprite).setImage("playerClear_e.png");
        h.extra.collected = true;
        // Put a message on the screen to help the player along
        let tip = new Actor({
            appearance: new TextSprite({ center: false, face: "Arial", color: "#6600ed", size: 20, z: 2 }, () => "You have found the power-up!"),
            rigidBody: new BoxBody({ cx: 13.1, cy: 0.05, width: .1, height: .1 }, { scene: stage.hud }),
        });
        return true;
    }

    //Updates tip upon collecting power-up


    //item that causes hero to change
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 60, cy: 3, radius: .5 }),
        role: new Goodie({ onCollect })
    });

    //item that is the destination for the hero
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
        rigidBody: new CircleBody({ cx: 57, cy: 33, radius: 0.4 }),
        role: new Destination({ onAttemptArrival: (h: Actor) => h.extra.collected }),
    });

    //enemy at the end of first path
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
        rigidBody: new CircleBody({ radius: 0.5, cx: 4, cy: 14 }),
        role: new Enemy(),
    });

    //enemy that travels near destination
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
        rigidBody: new CircleBody({ radius: 0.5, cx: 44, cy: 29 }),
        role: new Enemy(),
        movement: new PathMovement(new Path().to(36, 29).to(24, 29).to(36, 29), 3, true),
    });

    //chase enemy
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "red_ball.png" }),
        rigidBody: new CircleBody({ cx: 32, cy: 18, radius: 0.4 }, { dynamic: true }),
        movement: new ChaseMovement({ target: hero, speed: 1 }),
        role: new Enemy(),
    });

    // Set up a way to quickly get the goodie counts by pressing the '?' key
    //stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SLASH, () =>
    //window.alert(`${stage.score.getGoodieCount(0)});


    //movement settings

    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(-6));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(6));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(-6));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(6));

    // By default, the camera is centered on the point 8, 4.5f.  We can instead
    // have the camera stay centered on the hero, so that we can keep seeing the
    // hero as it moves around the world.
    stage.world.camera.setCameraFocus(hero);

    //
    // This code uses "for loops".  The outer loop will run 4 times (0, 16, 32,
    // 48).  Each time, the inner loop will run 4 times (0, 9, 18, 27), drawing
    // a total of 16 images.
    for (let x = 0; x < 64; x += 16) {
        for (let y = 0; y < 36; y += 9) {
            // This is kind of neat: a picture is just an actor without a role or rigidBody
            new Actor({
                appearance: new ImageSprite({ width: 16, height: 9, img: "noise.png", z: -2 }),
                rigidBody: new BoxBody({ cx: x + 8, cy: y + 4.5, width: 16, height: 9 }, { collisionsEnabled: false }),
            });
        }
    }

    // Draw four walls, covering the four borders of the world
    new Actor({
        appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
        rigidBody: new BoxBody({ cx: 32, cy: -.05, width: 64, height: .1 }),
        role: new Obstacle(),
    });
    new Actor({
        appearance: new FilledBox({ width: 64, height: .1, fillColor: "#ff0000" }),
        rigidBody: new BoxBody({ cx: 32, cy: 36.05, width: 64, height: .1 }),
        role: new Obstacle(),
    });
    new Actor({
        appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
        rigidBody: new BoxBody({ cx: -.05, cy: 18, width: .1, height: 36 }),
        role: new Obstacle(),
    });
    new Actor({
        appearance: new FilledBox({ width: .1, height: 36, fillColor: "#ff0000" }),
        rigidBody: new BoxBody({ cx: 64.05, cy: 18, width: .1, height: 36 }),
        role: new Obstacle(),
    });

    // Set up some boundaries on the camera, so we don't show beyond the borders
    // of our background:
    stage.world.camera.setBounds(0, 0, 64, 36);

    // Put a message on the screen to help the player along
    new Actor({
        appearance: new TextSprite({ center: false, face: "Arial", color: "#88001b", size: 20, z: 2 }, () => "Have you found the power-up?"),
        rigidBody: new BoxBody({ cx: 9.5, cy: 0.05, width: .1, height: .1 }, { scene: stage.hud }),
    });

    // Set up win conditions and win behavior
    stage.score.setVictoryDestination(1);
    stage.score.onWin = { level: level, builder: builder }

    //enters win screen
    stage.score.winSceneBuilder = (overlay: Scene) => {
        new Actor({
            appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
            gestures: {
                tap: () => {
                    stage.clearOverlay();
                    stage.switchTo(stage.score.onWin.builder, stage.score.onWin.level);
                    return true;
                }
            }
        });
        new Actor({
            appearance: new TextSprite({ center: true, face: "Arial", color: " #FFFFFF", size: 28 }, "You climbed the first floor!"),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay })
        });
        new Actor({
            appearance: new ImageSprite({ width: 0.6, height: 1, z: 1, img: "playerClear_Ewalk.png" }),
            rigidBody: new BoxBody({ cx: 8, cy: 4, width: 0.6, height: 1 }, { scene: overlay }),
            movement: new PathMovement(new Path().to(8, 8).to(12, 4), 3, true),
        })
        new Actor({
            rigidBody: new PolygonBody({ cx: 8, cy: 8, vertices: [0.5, 0.5, 4.5, -3.5, 4.5, 0.5] }, { scene: overlay }),
            appearance: new FilledPolygon({ vertices: [0.5, 0.5, 4.5, -3.5, 4.5, 0.5], fillColor: "#fff000", lineWidth: 4, lineColor: "#000000" }),
        })
    };

    //lose the level
    stage.score.loseSceneBuilder = (overlay: Scene) => {
        new Actor({
            appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
            gestures: {
                tap: () => {
                    stage.clearOverlay();
                    stage.switchTo(stage.score.onLose.builder, stage.score.onLose.level);
                    return true;
                }
            }
        });
        new Actor({
            appearance: new TextSprite({ center: true, face: "Arial", color: " #FFFFFF", size: 28 }, "Defeat!"),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay })
        });
    };

    stage.score.onLose = { level, builder }

    // add zoom buttons. We are using blank images, which means that the buttons
    // will be invisible... that's nice, because we can make the buttons big
    // (covering the entire screen.  When debug rendering
    // is turned on, we'll be able to see an outline of the two rectangles. You
    // could also use images, but if you did, you'd probably want to use some
    // transparency so that they don't cover up the gameplay.

    // Note: these go on the HUD
    //new Actor({
    //  appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
    //  rigidBody: new BoxBody({ cx: 8, cy: 4, width: 16, height: 9 }, { scene: stage.hud }),
    //  gestures: {
    //      tap: () => {
    //          console.log(stage.world.camera.getScale())
    //          if (stage.world.camera.getScale() > 40) {
    //              stage.world.camera.setScale(stage.world.camera.getScale() / 2);
    //              return true;
    //
    //              } else {
    //                if (stage.world.camera.getScale() < 40) stage.world.camera.setScale(stage.world.camera.getScale() * 2);
    //              return true;
    //        }
}
//   }
//  });
//}


// call the function that starts running the game in the `game - player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);