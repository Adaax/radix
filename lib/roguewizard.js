var ngui = require("nw.gui");
var nwin = ngui.Window.get();
//ngui.Window.get().enterKioskMode();

var load_interval;
var loop_interval;
var keydown_interval = undefined;
var start_level = 1;

var keyDownFlag = false;

var intent_x;
var intent_y;

var game_zoom = window.innerHeight / 768;
var game_width = 768 * (window.innerWidth / window.innerHeight);
var current_level = "level_" + start_level;
var current_level_num = start_level;

var jump_flag = 0;
var cast_flag = 0;
var down_flag = 0;
var fall_timer = 0;
var move_direction = 0;
var move_select = 0;

var cast_button_down = 0;

var controller;
var game_flag = 0;

var gamepadAPI = {
	controllers: {},
	active: false
};

var map_width = 91;
var map_height = 12;
var screen_width = 15;

var object_count = 0;
var player1;

var text_readout;
var chip_readout;
var readout_visible = false;

var level_map = new Array();
var level_info = new Array();

var collected = new Array();
var chip_count = 0;

level_map[1] = [
	"V##############################",
	"#            #####            #",
	"#                             #",
	"#                             #",
	"#                             #",
	"#                             #",
	"#                             #",
	"#                             #",
	"#          :   T  :           #",
	"# .          #####         .  #",
	"#v  v     ###########     v  v#",
	"###############################"
];

level_info[1] = {
	"portals": [
		{"x": 27, "y": 10, "level": 2, "new_x": 3, "new_y": 10}
	],
	"texts": [
		{"x": 15, "y": 8, "text": "Small acts of kindness! How pleasant and desirable do they make life. Every dark object is made light by them, and every tear of sorrow is brushed away."}
	]
};

level_map[2] = [
	"V#######################################",
	"#      ############    ##  ##  ##      #",
	"#          ####        ##  ##  ##      #",
	"#                      ##  ##  ##      #",
	"#                      ##  ##  ##      #",
	"#                                      #",
	"#                                      #",
	"#                                      #",
	"#           oo                         #",
	"# .    @   ####@                    .  #",
	"#v  v  ############    ##  ##  ##  v  v#",
	"#########################II##II#########"
];

level_info[2] = {
	"portals": [{"x": 2, "y": 10, "level": 1, "new_x": 28, "new_y": 10},
				{"x": 36, "y": 10, "level": 3, "new_x": 3, "new_y": 10}],
	"texts": []
};

level_map[3] = [
	"V#########################################################",
	"#             #####                                      #",
	"#                                                        #",
	"#                                                        #",
	"#                                                        #",
	"#                                                        #",
	"#                                                        #",
	"#                                     o   o              #",
	"#           :   T  :              @   #####@             #",
	"# .       @   #####@          @   #############@      .  #",
	"#v  v     #############       #####################  v  v#",
	"##########################################################"
];

level_info[3] = {
	"portals": [{"x": 2, "y": 10, "level": 2, "new_x": 37, "new_y": 10},
				{"x": 54, "y": 10, "level": 4, "new_x": 3, "new_y": 10}],
	"texts": [
		{"x": 16, "y": 8, "text": "True politeness is the offspring of good nature and a good heart. It is as far from the studied politeness of a fop, as the flower of wax is from nature's own fragrant rose."}
	]
};

level_map[4] = [
	"X%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
	"%%%    %%%%%  %%%%%     %%%%%%%       %%%%%%%%%%%%     %",
	"%         %%   %%%        %%%%           %%%%%%%       %",
	"%         %%          oo   %%             %%%%%        %",
	"%%                   ~~~~   %               %%%        %",
	"%%                                                     %",
	"%%              0         0           0oo              %",
	"%               ~~~~      ~~~~        ~~~~             %",
	"%                                                      %",
	"% _         %%%                                     _  %",
	"%v  v  %%%  %%%%            %%  U      %%       u  v  v%",
	"%%%%%%%%%%%%%%%%%%wwwwwwwwww%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
];

level_info[4] = {
	"portals": [{"x": 2, "y": 10, "level": 3, "new_x": 55, "new_y": 10},
				{"x": 52, "y": 10, "level": 5, "new_x": 10, "new_y": 22}],
	"texts": []
};

level_map[5] = [
	"V###################",
	"#                  #",
	"#                  #",
	"#                  #",
	"#        .         #",
	"#       v  v       #",
	"#      ======      #",
	"#                  #",
	"#                  #",
	"#        ##        #",
	"# R     I##I  R    #",
	"# ==== ###### ==== #",
	"#       ####       #",
	"#        ##        #",
	"##                ##",
	"##I              I##",
	"####    o  o    ####",
	"####   ======   ####",
	"###              ###",
	"##  R       R     ##",
	"#   ====    ====   #",
	"#        .         #",
	"#       v  v       #",
	"####################"
];

level_info[5] = {
	"portals": [{"x": 9, "y": 22, "level": 4, "new_x": 53, "new_y": 10},
				{"x": 9, "y": 5, "level": 6, "new_x": 3, "new_y": 10}],
	"texts": []
};

level_map[6] = [
	"V########################################+++++++++++++++++++++++++++++++++++++",
	"#                                       #########+++++++++++++++++++++++++++++",
	"#                                               #########+++++++++++++++++++++",
	"#                                                       ######################",
	"#            |    8      ## 8                                                #",
	"#            |   ###################@                                        #",
	"#            |   #++++#++++#++++#++#####                                     #",
	"#            |   #++++#++++#++++#++++#+#####@                                #",
	"#            |   #++++#++++#++++#++++#++++######                             #",
	"# .    o o   D   #++++#++++#++++#++++#++++#++++######    L----------      .  #",
	"#v  v  ###       #++++#++++#++++#++++#++++#++++#++++#                    v  v#",
	"###########IIIII##++++#++++#++++#++++#++++#++++#++++##IIIIIIIIIIIIIIIII#######"
];

level_info[6] = {
	"portals": [{"x": 2, "y": 10, "level": 5, "new_x": 10, "new_y": 5},
				{"x": 74, "y": 10, "level": 7, "new_x": 3, "new_y": 10}],
	"texts": []
};

level_map[7] = [
	"V#######################++++++++++++++#########+++++++++++++++################",
	"#                      #####++++++++++#       ###############+#              #",
	"#                          #####++++++#                     #+#              #",
	"#                              #####++#        8            #+#              #",
	"#            |      D              ####       ##########    #+#              #",
	"#            |      |                     |   #+#           #+#              #",
	"#            |      |  @                  |   #+#    8      #+#              #",
	"#            |      |  ####               |   #+#    ##########              #",
	"#            D      |  #++#####@          |   #+#                            #",
	"# .                    #++++++#####       D   #+#                         .  #",
	"#v  v  ####IIIIIIIIIIII#++++++++++#####       #+###############          v  v#",
	"########################++++++++++++++#IIIIIII#+++++++++++++++################"
];

level_info[7] = {
	"portals": [{"x": 2, "y": 10, "level": 6, "new_x": 75, "new_y": 10},
				{"x": 36, "y": 10, "level": 3, "new_x": 3, "new_y": 10}],
	"texts": []
};


next_text1 = "She was the picture of despair, and we could not but fancy, as she sat thus, that her mind was wandering back to the happy past - the days of her infancy and girlhood, and her early home."
next_text2 = "Whenever any one doubted the extent or accuracy of Harry's information, he always said, 'I'm just as sure as can be.' This habit of being so positive often led him into difficulty."
next_text3 = "What can be more humiliating and degrading then to have the name of a liar? It is so considered by all nations and with all people. The liar is always a coward. He tells lies, because he is afraid to tell the truth.";


window.addEventListener("gamepadconnected", function(e) {
	controller = e.gamepad;
	gamepadAPI.controllers[e.gamepad.index] = controller;
	gamepadAPI.active = true;
});

window.addEventListener("gamepadconnected", function(e) {
	var gamepadID = e.gamepad.id;
	console.log("Connected Gamepad ID: " + gamepadID + ".");
});

window.onload = function()
{
	document.body.style.transform = "scale(" + game_zoom + ")";
	document.body.style.transformOrigin = "0px 0px";
	document.body.style.marginTop = "0px";
	document.body.style.marginLeft = "0px";
	document.body.style.overflow = "hidden";

	start_signos();

	game.random_seed = 2000;

	game.current_room = "level_" + start_level;

	game.set_game_position(0, 0);
	game.set_game_size(game_width, 768, game_zoom);

	game.add_hud(0, 0, game_width, 100);

	text_readout = document.createElement("div");
	text_readout.id = "text_readout";

	text_readout.style.height = "400px";
	text_readout.style.width = "900px";

	text_readout.style.position = "absolute";
	text_readout.style.top = "100px";
	text_readout.style.left = "-2000px";

	text_readout.style.color = "#c63b3b";
	text_readout.style.fontFamily = "Joystix";
	text_readout.style.fontSize = "20pt";
	text_readout.style.padding = "10px 10px 10px 10px";

	text_readout.style.borderStyle = "solid";
	text_readout.style.borderWidth = "4px";		
	text_readout.style.borderColor = "#339fde";

	text_readout.style.backgroundColor = "#202020";

	game.main_area.appendChild(text_readout);


	chip_readout = document.createElement("div");
	chip_readout.id = "chip_readout";

	chip_readout.style.height = "400px";
	chip_readout.style.width = "900px";

	chip_readout.style.position = "absolute";
	chip_readout.style.top = "7px";
	chip_readout.style.left = "10px";

	chip_readout.style.color = "#dddddd";
	chip_readout.style.fontFamily = "Joystix";
	chip_readout.style.fontSize = "20pt";

	game.main_area.appendChild(chip_readout);


	run_game();
}

draw_player_hearts = function()
{
	var heart_x = game_width - 200;
	var heart_y = 10;

	game.hud.getContext("2d").clearRect(heart_x, heart_y, 300, 70);

	for (var i = 0; i < Math.floor(player1.hit_points); i++)
		game.draw_on_hud("media/heart.png", heart_x + (i * 35), heart_y);

	if (player1.hit_points - Math.floor(player1.hit_points) == 0.5)
		game.draw_on_hud("media/heart_half.png", heart_x + (i * 35), heart_y);
}

draw_player_chips = function()
{
	chip_readout.innerHTML = "<img src = 'media/chipcount.png'>" + chip_count;
}

run_game = function()
{
	dispatchEvent(new CustomEvent("load_tiles"));
	load_interval = setInterval(check_loaded, 12);
}

check_loaded = function()
{
	if (game.all_tiles_loaded() && game.all_sprites_loaded())
	{
		clearInterval(load_interval);

		if (game_flag == 0)
		{
			game_flag = 1;
			dispatchEvent(new CustomEvent("load_map"));
			load_interval = setInterval(check_loaded, 12);
		}
		else
		{
			dispatchEvent(new CustomEvent("load_functions"));
			setInterval(do_arcade_timeout_loop, 17, game);
			//game.start_arcade_game_loop(60);
		}
	}
}

var seed_map = new Array();
var seed_decrease = 5;

draw_wall = function(this_tile)
{
	for (var i = 0; i <= game.map_height + 100; i++)
	{
		seed_map[i] = new Array();

		for (var j = 0; j <= game.map_width + 100; j++)
		{
			seed_map[i][j] = 0;
		}
	}

	for (var i = 0; i < (game.map_width / 15) - 1; i++)
	{
		for (var j = 0; j < Math.floor(game.map_height / 10); j++)
		{
			for (var k = 0; k < 6; k++)
			{
				draw_wall_seed((i * 15) + Math.floor(game.random_number(15)), (j * 10) + Math.floor(game.random_number(10)), this_tile);
			}
		}
	}
}

draw_wall_seed = function(seed_start_x, seed_start_y, this_tile)
{
	var seed_percent = 50;
	draw_wall_seed_element(seed_start_x, seed_start_y, this_tile, seed_percent)
}

draw_wall_seed_element = function(seed_x, seed_y, this_tile, seed_percent)
{
	seed_map[seed_y][seed_x] = 1
		game.map_tile_replace(this_tile, seed_x, seed_y);

	if (game.random_number(100) < seed_percent && seed_x < game.map_width - 2 && seed_map[seed_y][seed_x + 1] == 0)
		draw_wall_seed_element(seed_x + 1, seed_y, this_tile, seed_percent - seed_decrease)

	if (game.random_number(100) < seed_percent && seed_y < game.map_height - 2 && seed_map[seed_y + 1][seed_x] == 0)
		draw_wall_seed_element(seed_x, seed_y + 1, this_tile, seed_percent - seed_decrease)

	if (game.random_number(100) < seed_percent && seed_x > 0 && seed_map[seed_y][seed_x - 1] == 0)
		draw_wall_seed_element(seed_x - 1, seed_y, this_tile, seed_percent - seed_decrease)

	if (game.random_number(100) < seed_percent && seed_y > 0 && seed_map[seed_y - 1][seed_x] == 0)
		draw_wall_seed_element(seed_x, seed_y - 1, this_tile, seed_percent - seed_decrease)
}

add_aux_sprite = function(this_data)
{
	game.add_sprite({
		"name": this_data.name,
		"object_id": undefined,
		"image": this_data.image,
		"x": -1000, 
		"y": -1000,
		"z": this_data.z,
		"place": "top",
		"frames": this_data.frames,
		"rows": this_data.rows
	});
	
	return game.get_object(this_data.name);
}

add_module = function(this_module, this_function)
{
	addEventListener(this_module, this_function, false);
}

add_module("load_tiles", function(){
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

	game.load_tile({
		"name": "newbricks2",
		"type": "background",
		"image": "media/newbricks2.png",
		"movement": 1
	});

	game.load_tile({
		"name": "newwall2",
		"type": "background",
		"image": "media/newwall2.png",
		"movement": 1
	});

	game.load_tile({
		"name": "doorway",
		"type": "background",
		"image": "media/doorway.png",
		"movement": 1
	});

	game.load_tile({
		"name": "doorway2",
		"type": "background",
		"image": "media/doorway2.png",
		"movement": 1
	});

	game.load_tile({
		"name": "bookcase",
		"type": "background",
		"image": "media/bookcase.png",
		"movement": 1
	});

	game.load_tile({
		"name": "brickfloor",
		"type": "floor",
		"image": "media/brickfloor.png",
		"movement": -1
	});

	game.load_tile({
		"name": "brickfloor2",
		"type": "floor",
		"image": "media/brickfloor2.png",
		"movement": -1
	});

	game.load_tile({
		"name": "stonefloor2",
		"type": "floor",
		"image": "media/stonefloor2.png",
		"movement": -1
	});

	game.load_tile({
		"name": "spikes",
		"type": "trap",
		"image": "media/spikes.png",
		"movement": -1
	});

	game.load_tile({
		"name": "spikes2",
		"type": "trap",
		"image": "media/spikes2.png",
		"movement": -1
	});

	game.load_object({
		"name": "candles",
		"type": "candles",
		"image": "media/candles.png",
		"frames": 2,
		"rows": 1
	})

	game.load_object({
		"name": "fireball",
		"type": "weapon",
		"image": "media/fireball1.png",
		"frames": 2,
		"rows": 1
	});
});

add_module("load_map", function() {
	player1 = game.add_object_sprite({
		"name": "player1",
		"type": "player",
		"room": game.current_room,
		"image": "media/wizard_girl.png",
		"sprite_name": "wizard",
		"x": 3,
		"y": 10,
		"z": 4,
		"place": "bottom",
		"frames": 2,
		"rows": 2
	});

	player1.hit_points = 3;
	player1.hurt_timer = 0;
	
	add_aux_sprite({
		"name": "wizard_cast",
		"image": "media/wizard_girl_cast.png",
		"z": 2,
		"frames": 5,
		"rows": 2
	});
	
	
	game.add_map_legend(",", function() {
		game.map_tile_replace("newbricks", tile.x, tile.y);		
	});

	game.add_map_legend(".", function() {
		game.map_tile("doorway", tile.x, tile.y);		
	});

	game.add_map_legend("_", function() {
		game.map_tile("doorway2", tile.x, tile.y);		
	});
	
	game.add_map_legend(":", function() {
		game.map_tile("bookcase", tile.x, tile.y);		
	});

	game.add_map_legend("#", function() {
		game.map_tile_replace("brickfloor", tile.x, tile.y);		
	});

	game.add_map_legend("+", function() {
		game.map_tile_replace("brickfloor2", tile.x, tile.y);		
	});

	game.add_map_legend("%", function() {
		game.map_tile_replace("stonefloor2", tile.x, tile.y);		
	});

	game.add_map_legend("V", function() {
		game.fill_all_tiles(["newwall"]);
		game.random_seed = current_level_num + 1000;
		draw_wall("newbricks");

		game.map_tile_replace("brickfloor", tile.x, tile.y);		
	});

	game.add_map_legend("X", function() {
		game.fill_all_tiles(["newwall2"]);
		game.random_seed = current_level_num + 1000;
		draw_wall("newbricks2");

		game.map_tile_replace("stonefloor2", tile.x, tile.y);		
	});
	
	game.add_map_legend("I", function() {
		game.map_tile_replace("spikes", tile.x, tile.y);		
	});
	
	game.add_map_legend("i", function() {
		game.map_tile_replace("spikes2", tile.x, tile.y);		
	});

	game.add_map_legend("v", function() {
		var this_candles = game.clone_object("candles", {
			"room": game.current_room,
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "bottom"
		});

		this_candles.animate = 4;
	});

	game.add_map_legend("T", function() {
		var this_candles = game.add_object_sprite({
			"name": "bookpedastal",
			"type": "pedastal",
			"room": game.current_room,
			"image": "media/bookpedastal.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "bottom",
			"frames": 2,
			"rows": 1
		});

		this_candles.animate = 8;
	});

	game.add_map_legend("w", function() {
		var this_candles = game.add_object_sprite({
			"name": "lava",
			"type": "ground",
			"room": game.current_room,
			"image": "media/lava.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "bottom",
			"frames": 4,
			"rows": 1
		});

		this_candles.animate = 5;
	});
	
	game.add_map_legend("=", function() {
		var this_platform = game.add_object_sprite({
			"name": "platform",
			"type": "platform",
			"room": game.current_room,
			"image": "media/platform.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "top",
			"frames": 1,
			"rows": 1
		});
	});

	game.add_map_legend("L", function() {
		var this_index = tile.x + 1;

		while (game.get_map_char(this_index, tile.y, level_map[current_level_num]) == "-")
			this_index++;

		var this_platform = game.add_object_sprite({
			"name": "platform_move",
			"type": "platform",
			"room": game.current_room,
			"image": "media/platform_move.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "top",
			"frames": 1,
			"rows": 1
		});

		this_platform.move_x = 3;
		this_platform.x1 = tile.x;
		this_platform.x2 = this_index - 1;
	});


	game.add_map_legend("D", function() {
		var this_platform = game.add_object_sprite({
			"name": "platform_move",
			"type": "platform",
			"room": game.current_room,
			"image": "media/platform_move.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "middle",
			"frames": 1,
			"rows": 1
		});

		if (game.get_map_char(tile.x, tile.y - 1, level_map[current_level_num]) == "|")
		{
			var this_index = tile.y - 1;

			while (game.get_map_char(tile.x, this_index, level_map[current_level_num]) == "|")
				this_index--;

			this_platform.move_y = 3;
			this_platform.y1 = this_index + 1;
			this_platform.y2 = tile.y;
		}
		else if (game.get_map_char(tile.x, tile.y + 1, level_map[current_level_num]) == "|")
		{
			var this_index = tile.y + 1;

			while (game.get_map_char(tile.x, this_index, level_map[current_level_num]) == "|")
				this_index++;

			this_platform.move_y = -3;
			this_platform.y1 = tile.y;
			this_platform.y2 = this_index - 1;
		}
	});

	game.add_map_legend("~", function() {
		var this_platform = game.add_object_sprite({
			"name": "platform",
			"type": "platform",
			"room": game.current_room,
			"image": "media/platform2.png",
			"x": tile.x,
			"y": tile.y,
			"z": 1,
			"place": "top",
			"frames": 1,
			"rows": 1
		});
	});

	game.add_map_legend("o", function() {
		for (var i = 0; i < collected.length; i++)
			if (collected[i].room == game.current_room && collected[i].x == tile.x && collected[i].y == tile.y)
				break;

		if (i == collected.length)
		{
			var this_chip = game.add_object_sprite({
				"name": "redchip",
				"type": "treasure",
				"room": game.current_room,
				"image": "media/chip.png",
				"x": tile.x,
				"y": tile.y,
				"z": 1,
				"place": "middle",
				"frames": 1,
				"rows": 1
			});
		}
	});
	
	game.add_map_legend("*", function() {
		var this_monster = game.add_object_sprite({
			"name": "mistling",
			"type": "monster",
			"room": game.current_room,
			"image": "media/mistling.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 4,
			"rows": 2
		});
	
		this_monster.move_x = 5;
		this_monster.animate = 5;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});

	game.add_map_legend("0", function() {
		var this_monster = game.add_object_sprite({
			"name": "beachball",
			"type": "monster",
			"room": game.current_room,
			"image": "media/beachball.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 4,
			"rows": 2
		});
	
		this_monster.move_x = 3;
		this_monster.animate = 5;

		this_monster.hit_points = 1;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});

	game.add_map_legend("R", function() {
		var this_monster = game.add_object_sprite({
			"name": "rollerblade",
			"type": "monster",
			"room": game.current_room,
			"image": "media/rollerblade.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 2,
			"rows": 2
		});
	
		this_monster.move_x = 3;
		this_monster.animate = 5;

		this_monster.hit_points = 1;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});

	game.add_map_legend("U", function() {
		var this_monster = game.add_object_sprite({
			"name": "pail",
			"type": "monster",
			"room": game.current_room,
			"image": "media/pail.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 4,
			"rows": 1
		});
	
		this_monster.move_x = 2;
		this_monster.animate = 5;
		this_monster.turn_timer = 150;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});

	game.add_map_legend("u", function() {
		var this_monster = game.add_object_sprite({
			"name": "pail",
			"type": "monster",
			"room": game.current_room,
			"image": "media/pail.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 4,
			"rows": 1
		});
	
		this_monster.move_x = -2;
		this_monster.animate = 5;
		this_monster.turn_timer = 150;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});
	
	game.add_map_legend("&", function() {
		var this_monster = game.add_object_sprite({
			"name": "vexlich",
			"type": "monster",
			"room": game.current_room,
			"image": "media/vexlich.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 2,
			"rows": 2
		});
	
		this_monster.move_x = 5;
		this_monster.animate = 5;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;

		this_monster.shoot_timer = 0;
	});

	game.add_map_legend("@", function() {
		var this_monster = game.add_object_sprite({
			"name": "puzzlepiece",
			"type": "monster",
			"room": game.current_room,
			"image": "media/puzzlepiece.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 4,
			"rows": 2
		});
	
		this_monster.move_x = 2;
		this_monster.animate = 5;
		this_monster.turn_timer = 98;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;
	});

	game.add_map_legend("8", function() {
		var this_monster = game.add_object_sprite({
			"name": "lander",
			"type": "monster",
			"room": game.current_room,
			"image": "media/lander.png",
			"x": tile.x,
			"y": tile.y,
			"z": 3,
			"place": "bottom",
			"frames": 2,
			"rows": 1
		});
	
		this_monster.move_x = 2;
		this_monster.animate = 5;
		this_monster.turn_timer = 175;

		this_monster.hit_points = 2;
		this_monster.last_hit = undefined;
		this_monster.hurt_timer = 0;

		this_monster.shoot_timer = 0;
	});

	game.set_map_size(level_map[current_level_num][0].length, map_height);

	//game.fill_all_tiles(["newwall"]);
	game.random_seed = current_level_num + 1000;
	//draw_wall();

	game.map_level(0, 0, level_map[current_level_num]);

	//game.set_room("level1");
	//game.map_room("level1");

	game.scroll_object = player1.id;
	game.focus_object = player1.id;
})

add_module("load_functions", function() {
	game.add_pre_move_function("platform_move", function() {
		if (object.move_x > 0)
		{
			var this_x = Math.floor(object.pixel_x / game.tile_width);

			if (this_x == object.x2)
				object.move_x = -object.move_x;

			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y - 1, 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_x(this_collides[i], this_collides[i].pixel_x + object.move_x);
		}
		else if (object.move_x < 0)
		{
			var this_x = Math.floor((object.pixel_x + game.get_sprite(object.sprite_id).width) / game.tile_width);

			if (this_x == object.x1)
				object.move_x = -object.move_x;

			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y - 1, 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_x(this_collides[i], this_collides[i].pixel_x + object.move_x);
		}
		else if (object.move_y > 0)
		{
			var this_y = Math.floor(object.pixel_y / game.tile_height);

			if (this_y == object.y2)
				object.move_y = -object.move_y;

			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y + (object.move_y * 2), 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_y(this_collides[i], this_collides[i].pixel_y + object.move_y); 
		}
		else if (object.move_y < 0)
		{
			var this_y = Math.floor((object.pixel_y + game.tile_height) / game.tile_height);

			if (this_y == object.y1)
				object.move_y = -object.move_y;

			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y + (object.move_y * 2), 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_y(this_collides[i], this_collides[i].pixel_y + object.move_y);
		}

		if (object.move_y > 0)
		{
			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y - object.move_y, 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_y(this_collides[i], this_collides[i].pixel_y + object.move_y);
		}
		else if (object.move_y < 0)
		{
			this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y, 4);

			for (var i = 0; i < this_collides.length; i++)
				if (this_collides[i].type != "platform")
					game.set_object_pixel_y(this_collides[i], this_collides[i].pixel_y + object.move_y);
		}
	});

	game.add_pre_move_function("lander", function() {
		object.turn_timer--;

		if (object.turn_timer == 0)
		{
			object.move_x = -object.move_x;
			object.turn_timer = 175;

			if (object.move_x > 0)
				game.set_object_sprite_row(object.id, 0);
			else
				game.set_object_sprite_row(object.id, 1);
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}

		object.shoot_timer++;

		if (object.shoot_timer % 50 == 0)
		{
			if (object.move_x > 0)
			{
				var this_pixel_x = object.pixel_x;
				var this_move_x = 12;
			}
			else
			{
				var this_pixel_x = object.pixel_x + game.get_sprite(object.sprite_id).width - 24;
				var this_move_x = -12;
			}

			var this_lightning = game.add_object_sprite({
				"name": "lightning",
				"type": "monster",
				"room": game.current_room,
				"image": "media/lightning.png",
				"pixel_x": this_pixel_x,
				"pixel_y": object.pixel_y + 2,
				"z": 5,
				"frames": 1,
				"rows": 1
			});

			this_lightning.move_x = this_move_x;
			this_lightning.timer = 40;
		}
	});

	game.add_pre_move_function("puzzlepiece", function() {
		object.turn_timer--;

		if (object.turn_timer == 0)
		{
			object.move_x = -object.move_x;
			object.turn_timer = 98;

			if (object.move_x > 0)
				game.set_object_sprite_row(object.id, 0);
			else
				game.set_object_sprite_row(object.id, 1);
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}
	});

	game.add_pre_move_function("pail", function() {
		object.turn_timer--;

		if (object.turn_timer == 60)
		{
			object.move_y = -15;
		}
		else if (object.turn_timer == 0)
		{
			object.move_x = -object.move_x;
			object.turn_timer = 150;
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

		object.move_y += 1;

		if (object.move_y > 14)
			object.move_y = 14;

		check_tiles();

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}
	});

	game.add_pre_move_function("rollerblade", function() {
		if (object.move_x > 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 1);
				object.move_x = -object.move_x;
			}
		}
		else if (object.move_x < 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 0);
				object.move_x = -object.move_x;
			}
		}

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";
	});

	game.add_pre_move_function("beachball", function() {
		if (object.move_x > 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 1);
				object.move_x = -object.move_x;
			}
		}
		else if (object.move_x < 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 0);
				object.move_x = -object.move_x;
			}
		}

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";
	});

	game.add_pre_move_function("vexlich", function() {
		if (object.move_x > 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 1);
				object.move_x = -object.move_x;
			}
		}
		else if (object.move_x < 0)
		{
			this_collides = game.check_objects_at_pixel_xy(object.pixel_x + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height + 5);

			if (this_collides.length == 0)
			{
				game.set_object_sprite_row(object.id, 0);
				object.move_x = -object.move_x;
			}
		}

		this_collides = game.check_object_collisions(object, 60, 48, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].name == "fireball" && object.last_hit != this_collides[i].id)
			{
				object.hit_points--;
				object.last_hit = this_collides[i].id;
				game.remove_object(this_collides[i]);

				if (object.hit_points == 1 && object.hurt_timer == 0)
					object.hurt_timer = 20;
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

		object.shoot_timer++;

		if (object.shoot_timer % 50 == 0)
		{
			if (object.move_x > 0)
			{
				var this_pixel_x = object.pixel_x;
				var this_move_x = 12;
			}
			else
			{
				var this_pixel_x = object.pixel_x + game.get_sprite(object.sprite_id).width - 24;
				var this_move_x = -12;
			}

			var this_lightning = game.add_object_sprite({
				"name": "lightning",
				"type": "monster",
				"room": game.current_room,
				"image": "media/lightning.png",
				"pixel_x": this_pixel_x,
				"pixel_y": object.pixel_y + 2,
				"z": 5,
				"frames": 1,
				"rows": 1
			});

			this_lightning.move_x = this_move_x;
			this_lightning.timer = 40;
		}
	});

	game.add_pre_move_function("player1", function() {
		if (typeof controller != "undefined")
		{
			controller = navigator.getGamepads()[0];

			if (controller.axes[0] > 0.2 || controller.buttons[15].pressed)
			{
				game.set_sprite_row(0);

				move_select = 5;
				object.move_x = 5;
				object.animate = 5;
			}
			else if(controller.axes[0] < -0.2 || controller.buttons[14].pressed)
			{
				game.set_sprite_row(1);

				move_select = -5;
				object.move_x = -5;
				object.animate = 5;
			}
			else
			{
				move_select = 0;
				object.animate = 0;
			
				if (jump_flag == 0)
					object.move_x = 0;		
			}

			if (controller.buttons[0].pressed)
			{
				if (jump_flag == 0)
				{
					object.move_y = -20;
					jump_flag = 1;
				}
			}
		}


		if (fall_timer > 0)
			fall_timer--;


		object.move_y += 1;

		if (object.move_y > 14)
			object.move_y = 14;


		if (jump_flag == 1)
		{
			if (move_select != 0)
				object.move_x = move_select;
			else
			{
				if (object.move_x > 0)
					object.move_x -= 0.2;
			}
		}

		check_tiles();
		check_platforms();

		this_collides = game.check_object_collisions(object, 60, 60, 3);
		
		for (var i = 0; i < this_collides.length; i++)
		{
			if (this_collides[i].type == "monster")
			{
				if (object.hit_points >= 0 && object.hurt_timer == 0)
				{
					object.hit_points = object.hit_points - 0.5;
					object.hurt_timer = 100;

					draw_player_hearts();
				}
				else if (object.hit_points == 0)
				{
					game.remove_object(object);

					var this_explode = game.add_object_sprite({
						"name": "explode",
						"type": "explosion",
						"room": game.current_room,
						"image": "media/blueexplode.png",
						"pixel_x": object.pixel_x,
						"pixel_y": object.pixel_y,
						"z": 4,
						"frames": 1,
						"rows": 1
					});

					this_explode.timer = 10;
				}
			}
			if (this_collides[i].type == "treasure")
			{
				if (this_collides[i].name == "redchip")
					chip_count += 5;

				var index = collected.length;

				collected[index] = {};
				collected[index].room = game.current_room;
				collected[index].x = this_collides[i].x;
				collected[index].y = this_collides[i].y;

				game.remove_object(this_collides[i]);

				draw_player_chips();
			}
		}

		if (object.hurt_timer > 0)
		{
			if (object.hurt_timer % 16 < 8)
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0.75)";
			else
				document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

			object.hurt_timer--;
		}
		else
			document.getElementById(object.sprite_div_id + "_image").style.filter = "grayscale(0)";

		if (cast_flag == 1)
		{
			if (game.get_sprite(object.sprite_id).frame == game.get_sprite(object.sprite_id).frames - 1)
			{
				cast_flag = 0;
				game.set_sprite_frame("wizard_cast", 0);

				game.replace_object_sprite(object, "wizard");
				game.set_sprite_row(move_direction);

				if (object.move_x == 0)
					object.animate = 0;
				else
					object.animate = 5;
			}
		}
		else if (cast_button_down == true)
		{
			cast_flag = 1;

			game.replace_object_sprite(player_object, "wizard_cast");
			game.set_object_sprite_row(player1.id, move_direction);
			player_object.animate = 3;

			if (move_direction == 0)
			{
				this_pixel_x = player_object.pixel_x + game.get_sprite(player_object.sprite_id).width - 28;
				this_move_x = 16;
			}
			else
			{
				this_pixel_x = player_object.pixel_x + 12;
				this_move_x = -16;
			}

			var this_fireball = game.clone_object("fireball", {
				"room": game.current_room,
				"pixel_x": this_pixel_x,
				"pixel_y": player_object.pixel_y + 32,
				"z": 5
			});

			this_fireball.timer = 18;
			this_fireball.move_x = this_move_x;
			this_fireball.animate = 2;
		}
	});

	game.add_pre_move_function("fireball", function() {
		object.timer--;

		if (object.timer == 0)
			game.remove_object(object);
	});

	game.add_pre_move_function("explode", function() {
		object.timer--;

		if (object.timer == 0)
			game.remove_object(object);
	});

	game.add_pre_move_function("lightning", function() {
		object.timer--;

		if (object.timer == 0)
			game.remove_object(object);
	});

	draw_player_hearts();
	draw_player_chips();
});

window.onkeydown = function(e) 
{
	keyDownFlag = true;
	evt = e || window.event;

	player_object = game.get_object(player1.id);

	if (evt.keyCode == 37)
	{
		move_direction = 1;
		game.set_object_sprite_row(player1.id, 1);

		move_select = -5;
		player_object.move_x = -5;
		player_object.animate = 5;

		if (readout_visible == true)
		{
			text_readout.style.left = "-2000px";
			readout_visible = false;
		}
	}
	else if (evt.keyCode == 38)
	{
		var this_portal = get_level_portal(player_object);
		
		if (this_portal != -1)
		{
			game.clear_all_tiles();

			for (var i = 0; i < game.objects.length; i++)
			{
				if (!(game.objects[i].name == "player1" || game.objects[i].class == "prototype"))
				{
					game.remove_object(game.objects[i]);
					i--;
				}
			}

			ngui.App.clearCache();
			var old_level = current_level_num;

			current_level_num = level_info[current_level_num].portals[this_portal].level;
			current_level = "level_" + current_level_num;
			game.current_room = current_level;
			player1.room = current_level;

			game.set_map_size(level_map[current_level_num][0].length, level_map[current_level_num].length);
			game.center_map_at(level_info[old_level].portals[this_portal].new_x, level_info[old_level].portals[this_portal].new_y);

			//window.nw.App.clearCache();
			game.map_level(0, 0, level_map[current_level_num]);

			game.move_object_to(player_object, level_info[old_level].portals[this_portal].new_x * game.tile_width, level_info[old_level].portals[this_portal].new_y * game.tile_height + 2);
		}

		var this_text = get_level_text(player_object);

		if (this_text != -1)
		{
			var this_readout = level_info[current_level_num].texts[this_text].text;
			text_readout.style.height = (Math.ceil(this_readout.length / 40) * 30) + 20 + "px";
			text_readout.style.left = Math.floor((game_width - parseInt(text_readout.style.width)) / 2) + "px";
			text_readout.innerHTML = this_readout;

			readout_visible = true;
		}
	}
	else if (evt.keyCode == 39)
	{
		move_direction = 0;
		game.set_object_sprite_row(player1.id, 0);

		move_select = 5;
		player_object.move_x = 5;
		player_object.animate = 5;

		if (readout_visible == true)
		{
			text_readout.style.left = "-2000px";
			readout_visible = false;
		}
	}
	else if (evt.keyCode == 40)
	{
		down_flag = 1;
	}
	else if (evt.keyCode == 32)
	{
		if (jump_flag == 0)
		{
			if (down_flag == 0)
			{
				player_object.move_y = -22;
				jump_flag = 1;
			}
			else
			{
				fall_timer = 20;
			}
		}
	}
	else if (evt.keyCode == 90)
	{
		cast_button_down = true;
	}
}

window.onkeyup = function(e)
{
	object = game.get_object(player1.id);

	evt = e || window.event;

	if (evt.keyCode == 37 || evt.keyCode == 39)
	{ 
		move_select = 0;

		if (cast_flag == 0)
			object.animate = 0;
	
		if (jump_flag == 0)
			object.move_x = 0;
	}
	else if (evt.keyCode == 40)
	{
		down_flag = 0;
	}
	else if (evt.keyCode == 90)
	{
		cast_button_down = 0;
	}
}

get_level_portal = function(this_object)
{
	object_tile_x1 = Math.floor(this_object.pixel_x / game.tile_width);
	object_tile_x2 = Math.floor((this_object.pixel_x + game.get_sprite(this_object.sprite_id).width) / game.tile_width);

	object_tile_y = Math.floor((this_object.pixel_y + (game.get_sprite(this_object.sprite_id).height / 2)) / game.tile_height);

	for (var i = 0; i < level_info[current_level_num].portals.length; i++)
		if ((object_tile_x1 == level_info[current_level_num].portals[i].x || object_tile_x1 == level_info[current_level_num].portals[i].x + 1) && (object_tile_x2 == level_info[current_level_num].portals[i].x || object_tile_x2 == level_info[current_level_num].portals[i].x + 1) && object_tile_y == level_info[current_level_num].portals[i].y)
			return i;

	return -1;
}

get_level_text = function(this_object)
{
	object_tile_x1 = Math.floor(this_object.pixel_x / game.tile_width);
	object_tile_x2 = Math.floor((this_object.pixel_x + game.get_sprite(this_object.sprite_id).width) / game.tile_width);

	object_tile_y = Math.floor((this_object.pixel_y + (game.get_sprite(this_object.sprite_id).height / 2)) / game.tile_height);

	for (var i = 0; i < level_info[current_level_num].texts.length; i++)
		if (object_tile_x1 == level_info[current_level_num].texts[i].x || object_tile_x1 && object_tile_x2 == level_info[current_level_num].texts[i].x && object_tile_y == level_info[current_level_num].texts[i].y)
			return i;

	return -1;
}

check_tiles = function()
{
	this_tiles_x1 = game.get_map_tile_at_pixel_xy(object.pixel_x, object.pixel_y + game.get_sprite(object.sprite_id).height + object.move_y);
	this_tiles_x2 = game.get_map_tile_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y + game.get_sprite(object.sprite_id).height + object.move_y);
	
	if (game.get_tile_movement(this_tiles_x1) == -1 || game.get_tile_movement(this_tiles_x2) == -1)
	{
		object.move_y = 0;
		game.set_object_pixel_y(object, (Math.floor((object.pixel_y + 20) / game.tile_height) * game.tile_height) + game.tile_height - game.get_sprite(object.sprite_id).height);
		
		if (object.name == "player1" && jump_flag == 1)
		{
			jump_flag = 0;
			object.move_x = move_select;
		}	
	}

	this_tiles_x1 = game.get_map_tile_at_pixel_xy(object.pixel_x, object.pixel_y + object.move_y);
	this_tiles_x2 = game.get_map_tile_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y + object.move_y);
	
	if (game.get_tile_movement(this_tiles_x1) == -1 || game.get_tile_movement(this_tiles_x2) == -1)
	{
		object.move_y = 0;
		game.set_object_pixel_y(object, (Math.floor((object.pixel_y + 20) / game.tile_height) * game.tile_height));
	}

	if (object.move_x > 0)
	{
		this_tiles_y1 = game.get_map_tile_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width + object.move_x, object.pixel_y);
		this_tiles_y2 = game.get_map_tile_at_pixel_xy(object.pixel_x + game.get_sprite(object.sprite_id).width + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height - 1);
		
		if (game.get_tile_movement(this_tiles_y1) == -1 || game.get_tile_movement(this_tiles_y2) == -1)
		{
			object.move_x = 0;
		}
	}
	else if (object.move_x < 0)
	{
		this_tiles_y1 = game.get_map_tile_at_pixel_xy(object.pixel_x + object.move_x, object.pixel_y);
		this_tiles_y2 = game.get_map_tile_at_pixel_xy(object.pixel_x + object.move_x, object.pixel_y + game.get_sprite(object.sprite_id).height - 1);
		
		if (game.get_tile_movement(this_tiles_y1) == -1 || game.get_tile_movement(this_tiles_y2) == -1)
		{
			object.move_x = 0;
		}
	}
}

check_platforms = function()
{
	this_collides = game.check_objects_at_level(object.pixel_x, object.pixel_x + game.get_sprite(object.sprite_id).width, object.pixel_y + game.get_sprite(object.sprite_id).height + object.move_y, 4);

	for (var i = 0; i < this_collides.length; i++)
	{
		if (this_collides[i].type == "platform" && object.move_y > 0 && (object.pixel_y + game.get_sprite(object.sprite_id).height - 1) < this_collides[i].pixel_y && fall_timer == 0)
		{
			object.move_y = 0;
			game.set_object_pixel_y(object, this_collides[i].pixel_y - game.get_sprite(object.sprite_id).height);

			if (jump_flag == 1)
			{
				jump_flag = 0;
				object.move_x = move_select;
			}
		}
		else if (this_collides[i].type == "ground" && object.move_y > 0)
		{
			object.move_y = 0;
			game.set_object_pixel_y(object, this_collides[i].pixel_y - game.get_sprite(object.sprite_id).height);

			if (jump_flag == 1)
			{
				jump_flag = 0;
				object.move_x = move_select;
			}
		}
	}
}
