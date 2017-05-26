/**
 * Dog Entity
 */
game.DogEntity = me.Entity.extend({

    /*  _collisions_: function () {
          return {
              fence_n: { barrier: true, x1: 48, x2: 175, y1: 48, y2: 50 },
              fence_e: { barrier: true, x1: 175, x2: 177, y1: 50, y2: 146 },
              fence_s: { barrier: true, x1: 48, x2: 175, y1: 146, y2: 148 },
              fence_w: { barrier: true, x1: 48, x2: 50, y1: 50, y2: 146 },
              ham: { edible: true, x1: 64, x2: 96, y1: 0, y2: 32 },
              feed: { edible: true, x1: 160, x2: 192, y1: 0, y2: 32 },
              chicken: { edible: true, x1: 128, x2: 160, y1: 64, y2: 96 },
              steak: { edible: true, x1: 64, x2: 96, y1: 128, y2: 96 },
              turkey: { edible: true, x1: 64, x2: 96, y1: 150, y2: 190 },
              gate: { isagate: true, x1: 96, x2: 128, y1: 32, y2: 64 },
          }
      },
  
      _detect_collision_: function (obstr, pos) {
         /* if (obstr.x1 < pos.x + 32 &&
              obstr.x2 > pos.x &&
              obstr.y1 < pos.y + 32 &&
              obstr.y2 > pos.y) {
              return true;
          }
          return false;
      },
  */
    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.pos.x = 56;
        this.pos.y = 86;

        //me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        this.standingCounter = 0;
        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

        this.body.setVelocity(0.0001, 0.0001);

        // define a basic walking animation (using all frames)
        //this.renderable.addAnimation("walkright", [0, 1, 2, 3, 4, 5, 6, 7]);

        // define a standing animation (using the first frame)
        this.renderable.addAnimation("stand", [36]);
        this.renderable.addAnimation("walkright", [54, 55, 56]);
        this.renderable.addAnimation("walkleft", [45, 46, 47]);
        this.renderable.addAnimation("walkdown", [36, 37, 38]);
        this.renderable.addAnimation("walkup", [63, 64, 65]);

        // set the standing animation as default
        this.renderable.setCurrentAnimation("stand");
    },
    /**
     * update the entity
     */
    update: function (dt) {

        // apply physics to the body (this moves the entity)

        this.standingCounter++;

        this.body.update(dt);

        // handle collisions against other shapes

        me.collision.check(this);

        if (this.standingCounter > 5) {
            this.standingCounter = 0;


            this.pos.x += Math.sign(move_x);
            this.pos.y += Math.sign(move_y);


            if (move_y > 0) {
                this.renderable.setCurrentAnimation("walkdown");
                move_y--;
            } else if (move_y < 0) {
                this.renderable.setCurrentAnimation("walkup");
                move_y++;
            } else {
                if (move_x > 0) {
                    this.renderable.setCurrentAnimation("walkright");
                    move_x--;
                } else if (move_x < 0) {
                    this.renderable.setCurrentAnimation("walkleft");
                    move_x++;
                }
            }


            if (move_y == 0 && move_x == 0) {
                this.renderable.setCurrentAnimation("stand");

                if (moving) {
                    moving = false;
                    resume_run.apply(this, moving_params);
                }
            }
        }

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    /**
      * colision handler
      * (called when colliding with other objects)
      */
    onCollision: function (response, other) {
        // Make all other objects solid
        return true;
    }
});

game.FenceEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

    },
    /**
     * update the entity
     */
    onCollision: function (response, other) {
        // do something when collected
        console.log('found fence');

        move_x = 0;
        move_y = 0;
        return false;
        // make sure it cannot be collected "again"
        //this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        // remove it
        //me.game.world.removeChild(this);
    }
});

game.GateEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

    },
    /**
     * update the entity
     */
    onCollision: function (response, other) {
        // do something when collected
        console.log('found gate');

        if (!opened) {
            isagate = true;
            move_x = 0;
            move_y = 0;
        }

        // make sure it cannot be collected "again"

        // remove it
        return false;
    },
    update: function (dt) {
        if (openagate && isagate) {
            isagate = false;
            opened = true;
            openagate = false;
            console.log('trying to open the gate');
            me.game.world.getChildByType(me.TMXLayer).forEach(function (layer) {
                // clear all tiles at the given x,y coordinates
                if (layer.name == "door") {
                    layer.clearTile(3, 1);
                }
            });
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            if (moving) {
                moving = false;
                resume_run.apply(this, moving_params);
            }
        } else if (openagate) {
            openagate = false;

            if (moving) {
                moving = false;
                resume_run.apply(this, moving_params);
            }
        }
    }
});

game.FoodEntity = me.Entity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function (x, y, settings) {
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y, settings]);
    },

    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision: function (response, other) {
        // do something when collected
        console.log('found food');
        // make sure it cannot be collected "again"
        //this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        // remove it
        //me.game.world.removeChild(this);
        move_x = 0;
        move_y = 0;
        edible = true;

        if (trashit) {
            trashit = false;
            me.game.world.getChildByType(me.TMXLayer).forEach(function (layer) {
                // clear all tiles at the given x,y coordinates
                if (layer.name == "door") {
                    layer.clearTile(Math.floor(this.pos.x / 32), Math.floor(this.pos.y / 32));
                }
            });
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        }
        return false;
    }
});

game.PoisonedFoodEntity = me.Entity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function (x, y, settings) {
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y, settings]);
    },

    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision: function (response, other) {
        // do something when collected
        console.log('found food');
        // make sure it cannot be collected "again"
        //this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        // remove it
        //me.game.world.removeChild(this);
        move_x = 0;
        move_y = 0;
        poisoned = true;

        if (trashit) {
            trashit = false;
            me.game.world.getChildByType(me.TMXLayer).forEach(function (layer) {
                // clear all tiles at the given x,y coordinates
                if (layer.name == "door") {
                    layer.clearTile(Math.floor(this.pos.x / 32), Math.floor(this.pos.y / 32));
                }
            });
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        }
        // todo: figure out!
        return false;
    }
});