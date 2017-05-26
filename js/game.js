
/* Game namespace */
var game = {

    // an object where to store game information
    data: {
        // score
        score: 0
    },


    // Run on page load.
    "onload": function () {
        // Initialize the video.
        if (!me.video.init(300, 300, { wrapper: "screen", scale: "auto" })) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }
        //me.sys.fps = 30;
        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded": function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // add our player entity in the entity pool
        me.pool.register("mainPlayer", game.DogEntity);
        me.pool.register("fence", game.FenceEntity);
        me.pool.register("food", game.FoodEntity);
        me.pool.register("gate", game.GateEntity);
        me.pool.register("poisonedfood", game.PoisonedFoodEntity);

        // Start the game.
        me.state.change(me.state.PLAY);
    }
};
