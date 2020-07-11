window.onload = function()
{
	init_signos(window.innerWidth, window.innerHeight, window.innerHeight / 768);
	//game.set_tile_size(16, 16);
	run_game();
}

add_module("load_resources", function(){
	game.load_tile({
		"name": "newbricks",
		"type": "background",
		"image": "media/newbricks.png",
		"movement": 1
	});

	game.load_tile({
		"name": "newwall",
		"type": "background",
		"image": "media/newwall.png",
		"movement": 1
	});

	game.load_object({
		"name": "player1",
		"type": "player",
		"image": "media/wizard_girl.png",
		"frames": 2,
		"rows": 2
	});

	game.add_map_legend(",", function() {
		game.map_tile_replace("newbricks", tile.x, tile.y);		
	});

	game.load_font("Joystix", "media/joystix.ttf");
});

add_module("pre_game", function() {
	var player1 = game.clone_object("player1", {
		"room": game.current_room,
		"x": 1,
		"y": 1,
		"z": 5,
		"place": "middle"
	});

	game.scroll_object = player1.id;
});

add_module("load_functions", function() {
	game.add_pre_move_function("game", function() {
	});

	game.add_keydown_function(function() {
		console.log(keycode);
	});
});
