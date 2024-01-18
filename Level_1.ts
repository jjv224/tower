import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { JetLagGameConfig } from "../jetlag/Config";
import { FilledBox, ImageSprite } from "../jetlag/Components/Appearance";
//import { TiltMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody } from "../jetlag/Components/RigidBody";
import { Destination, Hero, Obstacle } from "../jetlag/Components/Role";
import { Actor } from "../jetlag/Entities/Actor";
import { KeyCodes } from "../jetlag/Services/Keyboard";
import { ManualMovement } from "../jetlag/Components/Movement";
import { Goodie } from "../jetlag/Components/Role";

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
    musicNames = [];
    soundNames = [];
    imageNames = ["player.png", "mustard_ball.png", "noise.png", "playerClear.png", "purple_ball.png"];
}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {
    //properties of our hero
    let hero = new Actor({
        appearance: new ImageSprite({ width: 0.6, height: 1, img: "player.png" }),
        rigidBody: new BoxBody({ cx: 2, cy: 3, width: 0.6, height: 1 }, { disableRotation: true }),
        role: new Hero({ strength: 1 }),
        movement: new ManualMovement(),
        extra: {}
    });

    //Allows hero to change and complete level
    let onCollect = (_g: Actor, h: Actor) => {
        let s = ++(h.role as Hero).strength;
        (h.appearance as ImageSprite).setImage("playerClear.png");
        h.extra.collected = true;
        return true;
    }

    //item that causes hero to change
    new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
        rigidBody: new CircleBody({ cx: 3, cy: 15, radius: .5 }),
        role: new Goodie({ onCollect })
    });

    //item that is the destination for the hero
    new Actor({
        appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
        rigidBody: new CircleBody({ cx: 15, cy: 8, radius: 0.4 }),
        role: new Destination({ onAttemptArrival: (h: Actor) => h.extra.collected }),
    });


    // Set up a way to quickly get the goodie counts by pressing the '?' key
    //stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SLASH, () =>
    //window.alert(`${stage.score.getGoodieCount(0)});


    //blocks for testing
    new Actor({
        rigidBody: new BoxBody({ cx: 3, cy: 8, width: 1, height: 1 }),
        appearance: new FilledBox({ width: 1, height: 1, fillColor: "#000000", lineWidth: 4, lineColor: "#00ff00" }),
        role: new Obstacle(),
    })
    new Actor({
        rigidBody: new BoxBody({ cx: 3, cy: 11, width: 1, height: 1 }),
        appearance: new FilledBox({ width: 1, height: 1, fillColor: "#000000", lineWidth: 4, lineColor: "#00ff00", z: 1 }),

        //movement settings
    })
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(0));
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(0));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(-10));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(10));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(-10));
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(10));

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



    // Set up win conditions and win behavior
    stage.score.setVictoryDestination(1);
    stage.score.onWin = { level: level, builder: builder }

    // add zoom buttons. We are using blank images, which means that the buttons
    // will be invisible... that's nice, because we can make the buttons big
    // (covering the entire screen.  When debug rendering
    // is turned on, we'll be able to see an outline of the two rectangles. You
    // could also use images, but if you did, you'd probably want to use some
    // transparency so that they don't cover up the gameplay.

    // Note: these go on the HUD
    new Actor({
        appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4, width: 16, height: 9 }, { scene: stage.hud }),
        gestures: {
            tap: () => {
                if (stage.world.camera.getScale() > 40) {
                    stage.world.camera.setScale(stage.world.camera.getScale() - 40);
                    return true;

                } else {
                    if (stage.world.camera.getScale() < 40) stage.world.camera.setScale(stage.world.camera.getScale() + 40);
                    return true;
                }
            }
        }
    });




}

// call the function that starts running the game in the `game - player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);