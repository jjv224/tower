import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { FilledBox, FilledCircle, FilledPolygon, ImageSprite, TextSprite } from "../jetlag/Components/Appearance";
//import { TiltMovement } from "../jetlag/Components/Movement";
import { BoxBody, CircleBody, PolygonBody } from "../jetlag/Components/RigidBody";
import { Destination, Enemy, Hero, Obstacle, Projectile } from "../jetlag/Components/Role";
import { Actor } from "../jetlag/Entities/Actor";
import { KeyCodes } from "../jetlag/Services/Keyboard";
import { ChaseMovement, GravityMovement, ManualMovement, Path, PathMovement, ProjectileMovement, TiltMovement } from "../jetlag/Components/Movement";
import { Goodie } from "../jetlag/Components/Role";
import { AnimationSequence, AnimationState, JetLagGameConfig, Sides } from "../jetlag/Config";
import { Scene } from "../jetlag/Entities/Scene";
import { drawMuteButton } from "./common";
import { chooserBuilder } from "./chooser";
import { TimedEvent } from "../jetlag/Systems/Timer";
import { b2Vec2 } from "@box2d/core";
import { DIRECTION } from "../jetlag/Components/StateManager";
import { GridSystem } from "../jetlag/Systems/Grid"
import { ActorPoolSystem } from "../jetlag/Systems/ActorPool"
import { AnimatedSprite } from "../jetlag/Components/Appearance";
import { MusicComponent } from "../jetlag/Components/Music";
import { splashBuilder } from "./splash";

/**
 * gameBuilder is for drawing the playable levels of the game
 *
 * We currently have 9 levels, which is just enough to let the chooser be
 * interesting.
 *
 * @param level Which level should be displayed
 */
/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
export function builder(level: number) {

    stage.gameMusic?.play();

    new Actor({
        appearance: new ImageSprite({ img: "pause.png", width: 1, height: 1 }),
        rigidBody: new BoxBody({ cx: .5, cy: 1.5, width: 1, height: 1 }, { scene: stage.hud }),
        gestures: { tap: () => { if (level != 9) pauseGame(level); return true; } }
      });
    
      // Put the level number in the top left corner
      new Actor({
        appearance: new TextSprite({ center: false, face: "arial", color: "#872436", size: 32, z: 2 }, () => "Level " + level),
        rigidBody: new BoxBody({ cx: .25, cy: 0.25, width: .1, height: .1, }),
      });

      if (level != 2) {
        stage.score.onLose = { level: level, builder: builder };
        stage.score.onWin = { level: level + 1, builder: builder };
      }
      else {
        stage.score.onLose = { level: level, builder: builder };
        stage.score.onWin = { level: 1, builder: splashBuilder };
      }
    

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
        
    } else if (level == 2){

        welcomeMessage("Collect Two Keys, and Avoid Enemies...\nYou've Powered Up and Can Now Shoot Fireballs Using (Space)");
        drawMuteButton({ cx: 15, cy: 8, width: .75, height: .75, scene: stage.world });
      
        if (stage.gameMusic === undefined)
          stage.gameMusic = new MusicComponent(stage.musicLibrary.getMusic("doopdoop.ogg"));
        stage.gameMusic.play();
      
      
        // Draw a grid on the screen, covering the whole visible area
        //GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 64, y: 64 });
      
        // Based on the values in the Config object, we can expect to have a
        // screen that is a 16:9 ratio.  It will seem that the viewable area is 16
        // meters by 9 meters.  We'll make the "world" twice as wide.  All this
        // really means is that the camera won't show anything outside of the range
        // (0,0):(32,9):
        stage.world.camera.setBounds(0, 0, 64, 64);
      
        // Draw four walls, covering the four borders of the world
        new Actor({
          appearance: new FilledBox({ width: 64, height: .1, fillColor: "#494949" }),
          rigidBody: new BoxBody({ cx: 32, cy: .05, width: 64, height: .1 }),
          role: new Obstacle(),
        });
        new Actor({
          appearance: new FilledBox({ width: 64, height: .1, fillColor: "#494949" }),
          rigidBody: new BoxBody({ cx: 32, cy: 63.95, width: 64, height: .1 }),
          role: new Obstacle(),
        });
        new Actor({
          appearance: new FilledBox({ width: .1, height: 64, fillColor: "#494949" }),
          rigidBody: new BoxBody({ cx: .05, cy: 32, width: .1, height: 64 }),
          role: new Obstacle(),
        });
        new Actor({
          appearance: new FilledBox({ width: .1, height: 64, fillColor: "#494949" }),
          rigidBody: new BoxBody({ cx:63.95, cy: 32, width: .1, height: 64 }),
          role: new Obstacle(),
        });
      
        //Animate walk
        let animations = new Map();
        animations.set(AnimationState.WALK_E, AnimationSequence.makeSimple({
          timePerFrame: 100, repeat: true,
          images: ["player.png", "player_walk_new.png"]
        }));
        animations.set(AnimationState.WALK_W, AnimationSequence.makeSimple({
          timePerFrame: 100, repeat: true,
          images: ["player_w.png", "player_wwalk.png"]
        }));
        animations.set(AnimationState.JUMP_E, AnimationSequence.makeSimple({
          timePerFrame: 75, repeat: true,
          images: ["player_walk_new.png"]
        }));
        animations.set(AnimationState.JUMP_W, AnimationSequence.makeSimple({
          timePerFrame: 75, repeat: true,
          images: ["player_wwalk.png"]
        }));
      
        animations.set(AnimationState.IDLE_W, new AnimationSequence(true).to("player_w.png", 250).to("idle_w.png", 250));
        animations.set(AnimationState.IDLE_E, new AnimationSequence(true).to("player.png", 250).to("player_idle.png", 250));
        animations.set(AnimationState.JUMP_IDLE_E, new AnimationSequence(true).to("player_walk.png", 250).to("player_wwalk.png", 250));
        animations.set(AnimationState.JUMP_IDLE_W, new AnimationSequence(true).to("player_walk.png", 250).to("player_wwalk.png", 250));
      
        // Make a hero
        let h = new Actor({
          appearance: new AnimatedSprite({ width: 2.5, height: 2.5, animations }),
          rigidBody: new BoxBody({ cx: 2, cy: 63, width: 0.6, height: 1.5 }, { disableRotation: true }),
          role: new Hero({ strength: 1 }),
          movement: new ManualMovement(),
          extra: {} 
        });
        (h.appearance as AnimatedSprite).stateSelector = AnimatedSprite.sideViewAnimationTransitions;
      
        
        //Actor Pool to create three reusable projectiles
        let projectiles = new ActorPoolSystem();
          for (let i = 0; i < 3; ++i) {
            let appearance = new ImageSprite({ img: "projectile.png", width: 1.5, height: 1.5, z: 0 });
            let rigidBody = new CircleBody({ radius: 0.25, cx: -100, cy: -100 });
            rigidBody.setCollisionsEnabled(false);
            let reclaimer = (actor: Actor) => { projectiles.put(actor); }
            let role = new Projectile({ damage: 2, disappearOnCollide: true, reclaimer });
            // Put in some code for eliminating the projectile quietly if it has
            // traveled too far
            let range = 5;
            role.prerenderTasks.push((_elapsedMs: number, actor?: Actor) => {
              if (!actor) return;
              if (!actor.enabled) return;
              let role = actor.role as Projectile;
              let body = actor.rigidBody.body;
              let dx = Math.abs(body.GetPosition().x - role.rangeFrom.x);
              let dy = Math.abs(body.GetPosition().y - role.rangeFrom.y);
              if ((dx * dx + dy * dy) > (range * range)) reclaimer(actor);
            });
            let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement(), role });
            p.rigidBody.body.SetGravityScale(0);
            projectiles.put(p);
          }
      
          stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
            if (h.state.current.last_ew == DIRECTION.W || h.state.current.direction == DIRECTION.W || h.state.current.direction == DIRECTION.NW || h.state.current.direction == DIRECTION.SW)
              (projectiles.get()?.role as (Projectile | undefined))?.tossFrom(h, -.5, .3, -5, 0);
            else
              (projectiles.get()?.role as (Projectile | undefined))?.tossFrom(h, .5, .3, 5, 0)
          });
      

        /*stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => {
          let p = new Actor({
            appearance: new ImageSprite({ width: 1.5, height: 1.5, img: "projectile.png" }),
            rigidBody: new CircleBody({ cx: h.rigidBody.getCenter().x + .2, cy: h.rigidBody.getCenter().y, radius: .1 }),
            
            movement: new ProjectileMovement({multiplier: 2,fixedVectorVelocity: 3}),
            role: new Projectile()
          });
          p.rigidBody.body.SetGravityScale(0);
          // We can use "tossFrom" to throw in a specific direction, starting at a
          // point, such as the hero's center.
          (p.role as Projectile).tossFrom(h, .2, 0, 5, 0);
        });*/
      
        // This game will be a platformer/side scroller, so we want gravity
        // downward:
        stage.world.setGravity(0, 12);
      
        // Let the camera follow the hero
        stage.world.camera.setCameraFocus(h);
      
        stage.backgroundColor = "#8B8B8B";
      
        new Actor({
          appearance: new ImageSprite({ width: 1.5, height: 1.5, img: "key.png" }),
          rigidBody: new BoxBody({ cx: 14.25, cy: 0.5, width: 2, height: 2}, {scene: stage.hud}),
          role: new Goodie(),
        });
        
        new Actor({
          appearance: new TextSprite({ center: false, face: "Arial", size: 36, color: "#ffffff" }, () => ": " + stage.score.getGoodieCount(0) + " / 2"),
          rigidBody: new CircleBody({ radius: .01, cx: 15, cy: 0.25 }, { scene: stage.hud }),
          role: new Goodie(),
        });
      
      
        // Set up arrow keys to control the hero
        stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => { (h.movement as ManualMovement).updateXVelocity(-5); });
        stage.keyboard.setKeyUpHandler(KeyCodes.KEY_A, () => { (h.movement as ManualMovement).updateXVelocity(0); });
        stage.keyboard.setKeyDownHandler(KeyCodes.KEY_D, () => { (h.movement as ManualMovement).updateXVelocity(5); });
        stage.keyboard.setKeyUpHandler(KeyCodes.KEY_D, () => { (h.movement as ManualMovement).updateXVelocity(0); });
        stage.keyboard.setKeyDownHandler(KeyCodes.KEY_W, () => (h.role as Hero).jump(0, -9));
      
      
        // Make a destination
        new Actor({
          appearance: new FilledCircle({ radius: .5, fillColor: "#00ff00", lineWidth: 3, lineColor: "#004400" }),
          rigidBody: new CircleBody({ cx: 31, cy: 6, radius: .5 }),
          role: new Destination(),
        });
      
        // Set up "winning"
        stage.score.setVictoryDestination(1);
      
        //Platforms
        function platform(cx: number, cy: number) {
          new Actor({
            appearance: new FilledBox({ z: -1, width: 2, height: 0.2, fillColor: "#494949" }),
            rigidBody: new BoxBody({ cx, cy, width: 2, height: 0.2, }),
            // Set a callback, then re-enable the platform's collision effect.
            role: new Obstacle({ jumpReEnableSides: [DIRECTION.N] }),
          });
        }
      
        function longPlatform(cx: number, cy: number) {
          new Actor({
            appearance: new FilledBox({ z: -1, width: 6, height: 0.2, fillColor: "#494949" }),
            rigidBody: new BoxBody({ cx, cy, width: 6, height: 0.2, }),
            role: new Obstacle({ jumpReEnableSides: [DIRECTION.N] }),
          });
        }
      
        //Plat 1
        longPlatform(6, 61);
        longPlatform(12, 61);
      
        //Plat 2
        longPlatform(18, 58);
        longPlatform(24, 58);
      
        //Plat 3
        longPlatform(30, 55);
        longPlatform(36, 55);
      
        //Plat 4
        longPlatform(42, 52);
        longPlatform(48, 52);
      
        //Plat 5
        longPlatform(54, 49);
        longPlatform(60, 49);
        longPlatform(62,49);
      
       //Plat 6
        enemy(57.25,45.5);
        longPlatform(60, 46);
        longPlatform(62,46);
      
      
        platform(54,43);
      
        longPlatform(48,40);
        longPlatform(42,40);
        longPlatform(36,40);
        longPlatform(30,40);
        new Actor({
          appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
          rigidBody: new CircleBody({ radius: .5, cx: 27.5, cy: 35.5 }),
          role: new Enemy(),
          movement: new PathMovement(new Path().to(27.5, 39.5).to(51, 39.5).to(27.5, 39.5), 5, true),
        });
      
      
        longPlatform(24, 37);
        longPlatform(18, 37);
      
        enemy(20, 33.5);
        platform(20,34);
        enemy(22, 30.5)
        platform(22,31);
        enemy(18,27.5);
        platform(18, 28);
        enemy(24, 25.5);
        platform(24, 26);
        platform(32, 26);
      
        //Middle of split
        platform(41, 23);
        
        platform(43, 23);
        platform(39, 23);
        enemy(48, 19.5)
        platform(48, 20);
        enemy(34, 19.5)
        longPlatform(34, 20);
        longPlatform(26, 17);
      
        //Destination location
        longPlatform(56, 17);
        longPlatform(62,17);
      
        //Enemies (KeyMonster anwd Lackeys)
      
        function enemy(cx: number, cy: number) {
          new Actor({
            appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
            rigidBody: new CircleBody({ cx, cy, radius: 0.5 }),
            role: new Enemy(),
          });
        }
        
          // create an enemy who chases the hero
      
          new Actor({
            appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
            rigidBody: new CircleBody({ cx: 5, cy: 63.5, radius: 0.5 }),
            movement: new ChaseMovement({ speed: 1, target: h , chaseInX: true, chaseInY: false}),
            role: new Enemy(),
          });
          new Actor({
            appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
            rigidBody: new CircleBody({ radius: .5, cx: 3.5, cy: 60.5 }),
            role: new Enemy(),
            movement: new PathMovement(new Path().to(3.5, 60.5).to(14.5, 60.5).to(3.5, 60.5), 5, true),
          });
          new Actor({
            appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
            rigidBody: new CircleBody({ radius: .5, cx: 15.5, cy: 57.5 }),
            role: new Enemy(),
            movement: new PathMovement(new Path().to(15.5, 57.5).to(26.5, 57.5).to(15.5, 57.5), 5, true),
          });
          new Actor({
            appearance: new ImageSprite({ width: 2, height: 2, img: "Enemy.png" }),
            rigidBody: new CircleBody({ radius: .5, cx: 27.5, cy: 54.5 }),
            role: new Enemy(),
            movement: new PathMovement(new Path().to(27.5, 54.5).to(38.5, 54.5).to(27.5, 54.5), 5, true),
          });
          
          enemy(54,42.5);
      
        
      
        //Key and Destination
      
        new Actor({
          appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
          rigidBody: new CircleBody({ cx: 60, cy: 16, radius: 0.4 }),
          role: new Destination({ onAttemptArrival: (h: Actor) => stage.score.getGoodieCount(0) == 2 }),
        });
      
        new Actor({
          appearance: new ImageSprite({ width: 2, height: 2, img: "key.png" }),
          rigidBody: new BoxBody({ cx: 27, cy: 16, width: 2, height: 2}),
          role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(0, 1); return true; } }),
        });
      
        new Actor({
          appearance: new ImageSprite({ width: 2, height: 2, img: "key.png" }),
          rigidBody: new BoxBody({ cx: 62, cy: 63, width: 2, height: 2}),
          role: new Goodie({ onCollect: () => { stage.score.addToGoodieCount(0, 1); return true; } }),
        });
      
        stage.score.onLose = { level, builder };
      
   
      
        winMessage("You WIN!!!");
        loseMessage("Try Again :)");
      
      }
    }


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

    function winMessage(message: string) {
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
            },
          });
          new Actor({
            appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, message),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
          });
        };
      }
    
      function loseMessage(message: string) {
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
            },
          });
          new Actor({
            appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, message),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
          })
        };
      }
/**
 * Create an overlay (blocking all game progress) consisting of a text box over
 * a snapshot of the in-progress game.  Clearing the overlay will resume the
 * current level.
 *
 * @param level The current level
 */
function pauseGame(level: number) {
    // Immediately install the overlay, to pause the game
    stage.requestOverlay((overlay: Scene, screenshot: ImageSprite | undefined) => {
      // Draw the screenshot
      new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });
  
      // It's always good to have a way to go back to the chooser:
      new Actor({
        appearance: new ImageSprite({ img: "back_arrow.png", width: 1, height: 1 }),
        rigidBody: new BoxBody({ cx: 15.5, cy: .5, width: 1, height: 1 }, { scene: overlay }),
        gestures: { tap: () => { stage.clearOverlay(); stage.switchTo(chooserBuilder, Math.ceil(level / 4)); return true; } }
      });
  
      // Pressing anywhere on the text box will make the overlay go away
      new Actor({
        appearance: new FilledBox({ width: 2, height: 1, fillColor: "#000000" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 2, height: 1 }, { scene: overlay }),
        gestures: { tap: () => { stage.clearOverlay(); return true; } },
      });
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, "Paused"),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
      });
  
      // It's not a bad idea to have a mute button...
      drawMuteButton({ scene: overlay, cx: 15.5, cy: 1.5, width: 1, height: 1 });
    }, true);
  }
  /**
 * Create an overlay (blocking all game progress) consisting of a black screen
 * with text.  Clearing the overlay will resume the current level.  This will
 * show immediately when the game starts.
 *
 * @param message A message to display in the middle of the screen
 */
function welcomeMessage(message: string) {
    // Immediately install the overlay, to pause the game
    stage.requestOverlay((overlay: Scene) => {
      // Pressing anywhere on the black background will make the overlay go away
      new Actor({
        appearance: new FilledBox({ width: 16, height: 9, fillColor: "#000000" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
        gestures: {
          tap: () => {
            stage.clearOverlay();
            return true;
          }
        },
      });
      // The text goes in the middle
      new Actor({
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: .1, height: .1 }, { scene: overlay }),
        appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 28, z: 0 }, () => message),
      });
    }, false);
  }