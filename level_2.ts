import { initializeAndLaunch, stage } from "../jetlag/Stage";
import { AnimationSequence, AnimationState, JetLagGameConfig, Sides } from "../jetlag/Config";
import { Actor } from "../jetlag/Entities/Actor";
import { FilledBox, FilledCircle, FilledPolygon, ImageSprite, TextSprite } from "../jetlag/Components/Appearance";
import { BoxBody, CircleBody, PolygonBody } from "../jetlag/Components/RigidBody";
import { Destination, Enemy, Goodie, Hero, Obstacle, Projectile, Sensor } from "../jetlag/Components/Role";
import { KeyCodes } from "../jetlag/Services/Keyboard";
import { ChaseMovement, GravityMovement, ManualMovement, Path, PathMovement, ProjectileMovement, TiltMovement } from "../jetlag/Components/Movement";
import { TimedEvent } from "../jetlag/Systems/Timer";
import { b2Vec2 } from "@box2d/core";
import { DIRECTION } from "../jetlag/Components/StateManager";
import { GridSystem } from "../jetlag/Systems/Grid"
import { ActorPoolSystem } from "../jetlag/Systems/ActorPool"
import { AnimatedSprite } from "../jetlag/Components/Appearance";
import { MusicComponent } from "../jetlag/Components/Music";
import { Scene } from "../jetlag/Entities/Scene";

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
  hitBoxes = false ;
  resourcePrefix = "./assets/";
  musicNames = ["doopdoop.ogg"];
  soundNames = [];
  imageNames = ["audio_on.png", "audio_off.png", "Enemy.png", "key.png", "projectileW.png","projectile.png", "player.png", "player_w.png", "player_walk.png", "player_walk_new.png", "player_idle.png","idle_w.png", "player_wwalk.png", "green_ball.png", "purple_ball.png", "blue_ball.png", "red_ball.png", "grey_ball.png", "mustard_ball.png", "mid.png"];}

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
function builder(level: number) {

   function drawMuteButton(cfg: { cx: number, cy: number, width: number, height: number, scene: Scene }) {
    // Draw a mute button
    let getVolume = () => (stage.storage.getPersistent("volume") ?? "1") === "1";
    let mute = new Actor({
      appearance: new ImageSprite({ width: cfg.width, height: cfg.height, img: "audio_off.png" }),
      rigidBody: new BoxBody({ cx: cfg.cx, cy: cfg.cy, width: cfg.width, height: cfg.height }, { scene: stage.hud }),
    });
    // If the game is not muted, switch the image
    if (getVolume())
      (mute.appearance as ImageSprite).setImage("audio_on.png");
    // when the obstacle is touched, switch the mute state and update the picture
    mute.gestures = {
      tap: () => {
        // volume is either 1 or 0, switch it to the other and save it
        let volume = 1 - parseInt(stage.storage.getPersistent("volume") ?? "1");
        stage.storage.setPersistent("volume", "" + volume);
        // update all music
        stage.musicLibrary.resetMusicVolume(volume);
  
        if (getVolume()) (mute.appearance as ImageSprite).setImage("audio_on.png");
        else (mute.appearance as ImageSprite).setImage("audio_off.png");
        return true;
      }
    };
  }

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

  //Zoom function
  
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 4, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() > 50) stage.world.camera.setScale(stage.world.camera.getScale() - 10);
        return true;
      }
    }
  });
  new Actor({
    appearance: new FilledBox({ width: 8, height: 9, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 12, cy: 4.5, width: 8, height: 9 }, { scene: stage.hud }),
    gestures: {
      tap: () => {
        if (stage.world.camera.getScale() < 200) stage.world.camera.setScale(stage.world.camera.getScale() + 20);
        return true;
      }
    }
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
  stage.score.onWin = { level: level, builder: builder }
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
  stage.score.onWin = { level, builder };

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

  winMessage("You WIN!!!");
  loseMessage("Try Again :)");

}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);