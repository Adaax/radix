// global variables
game = null;
object = null;
tile = {};
tile_events = {};

collide_objects = new Array();

queue = null;
queue_interval_id = null;
queue_counter = 0;

right_click_event = new CustomEvent("right_click");
turn_event = new CustomEvent("turn");

start_move_event = undefined;
end_move_event = undefined;

load_interval = undefined;
game_flag = 0;

function add_module(this_module, this_function)
{
	addEventListener(this_module, this_function, false);
}

function init_signos(this_game_width, this_game_height, this_game_zoom)
{
	document.body.style.transform = "scale(" + this_game_zoom + ")";
	document.body.style.transformOrigin = "0px 0px";
	document.body.style.marginTop = "0px";
	document.body.style.marginLeft = "0px";
	document.body.style.overflow = "hidden";

	start_signos();

	game.set_game_size(this_game_width, this_game_height, this_game_zoom);
	game.set_game_position(0, 0);
}

function run_game()
{
	dispatchEvent(new CustomEvent("load_resources"));
	load_interval = setInterval(check_loaded, 12);
}

function check_loaded()
{
	if (game.all_tiles_loaded() && game.all_sprites_loaded() && game.all_fonts_loaded())
	{
		clearInterval(load_interval);

		if (game_flag == 0)
		{
			game_flag = 1;
			dispatchEvent(new CustomEvent("pre_game"));
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

// function to create "game" object
function start_signos()
{
	game = new signos_game("game");
}

// function to create Chisel game area
function signos_game(this_name)
{
	// object creation code
	// ====================
	// 1 - create object variables
	// 2 - create main game area
	// 3 - create map div
	// 4 - create map canvas
	// 5 - create map marker
	// 6 - create object div array


	// 1 - create object variables
	// ===========================

	// store name of game area
	this.name = this_name;

	// location of game area, in pixels
	this.game_x = "0px";
	this.game_y = "0px";

	// width and height of game area, in pixels
	this.game_width = "100px";
	this.game_height = "100px";

	this.backgroundColor = 0;

	// width and height of map tiles, in pixels
	this.tile_width = 64;
	this.tile_height = 64;

	// width and height of map, in tiles
	this.map_width = 48;
	this.map_height = 12;

	// name of current room
	this.current_room = undefined;

	// map tile array
	this.map_array = new Array();

	// rooms array
	this.rooms = new Array();

	// transfers array
	this.transfers = new Array();

	// display object stat flag
	this.display_object_stats = false;

	// game loop variables
	this.game_loop_id = undefined;
	this.game_loop_fps = 60;
	this.fps_interval = 1000 / 60;
	this.time_then = undefined;

	// scroll object
	this.scroll_object = undefined;
	this.scroll_buffer_x = 150;
	this.scroll_buffer_y = 100;

	// focus_object
	this.focus_object = undefined;

	// tile stat array
	this.tile_stats = new Array();

	// sprite array
	this.sprites = new Array();
	this.sprites_load = new Array();
	this.sprite_count = 0;

	// initalize map array
	for (var i = 0; i < this.map_height; i++)
	{
		this.map_array[i] = new Array();

		for (var j = 0; j < this.map_width; j++)
			this.map_array[i][j] = -1;
	}

	// click and drag variables
	this.mouse_down = -1;
	this.old_x = -1;
	this.old_y = -1;
	this.mouse_count = 0;
	this.count_interval = 0;

	// map div lock coordinates
	this.lock_x1 = 0;
	this.lock_x2 = 0;
	this.lock_y1 = 0;
	this.lock_y2 = 0;

	// tile image arrays
	this.tile_names = new Array();
	this.tile_images = new Array();
	this.tile_canvas = new Array();
	this.tile_load = new Array();

	this.font_load = new Array();

	// random number seed
	this.random_seed = 1000;

	// quite mode flag
	this.quiet_mode = false;

	// object array
	this.objects = new Array();
	this.objects_pre_move_functions = new Array();
	this.object_total = 0;

	this.game_pre_move_function = undefined;
	this.game_keydown_function = undefined;
	this.game_keyup_function = undefined;

	// object stat attribute array
	this.stats = new Array();

	// tile marker x/y
	this.tile_x = -1;
	this.tile_y = -1;

	// turn button style
	this.turn_button_style = {
		"width": 125,
		"height": 23,
		"space": 5,
		"cursor": "pointer",

		"background": "#202020",
		"border_color": "#d87103",
		
		"font_color": "#07a7fa",
		"font_family": "Zekton",
		"font_size": "12pt",

		"label": "Turn"
	};

	// readout style
	this.readout_div_style = {
		"width": 400,
		"height": 200,
		"space": 5,

		"font_color": "#d87103",
		"font_family": "Goudy",
		"font_size": "16pt"
	};

	// object div style
	this.object_div_style = {
		// div size and style
		"width": 290,
		"height": 70,
		"space": 5,
		"background": "#202020",
		"cursor": "pointer",
		"border_color": "#aaaaaa",

		// image positioning
		"image_x": 3,
		"image_y": 3,

		// name font style
		"name_font_color": "#07a7fa",
		"name_font_family": "Neuropol",
		"name_font_size": "13pt",

		// name positioning
		"name_x": 75,
		"name_y": 10,

		// type font style
		"type_font_color": "#a0a0a0",
		"type_font_family": "Neuropol",
		"type_font_size": "12pt",

		// type positioning
		"type_x": 75,
		"type_y": 38,

		// object stat position/style
		"stat_x": 74,
		"stat_height": 28,
		"stat_space": 1,

		// object stat font style
		"stat_font_color": "#edea0c",
		"stat_font_family": "Zekton",
		"stat_font_size": "11pt"
	};

	// move target
	this.move_target_x = -1;
	this.move_target_y = -1;

	// move queue and flag
	this.move_queue = new Array();
	this.move_flag = -1;

	// move vectors and speed
	this.move_x = 0;
	this.move_y = 0;
	this.move_speed = 6;

	// move counter and DOM element
	this.move_counter = 0;
	this.move_element = null;

	// action variables
	this.action_counter = 0;
	this.action_data = new Array();

	// readout variables
	this.readout_messages = new Array();
	this.readout_div = undefined;

	// interval IDs
	this.interval_id = null;

	// object div display data
	this.object_div_x = -1;
	this.object_div_y = -1;
	this.object_div_select = -1;


	// 2 - create main game area
	// =========================

	// create element
	this.main_area = document.createElement("div");
	this.main_area.id = this.name + "_game_area";
	this.main_area.style.position = "absolute";

	// set game area location
	this.main_area.style.left = this.game_x;
	this.main_area.style.top = this.game_y;

	// set game area size
	this.main_area.style.width = this.game_width;
	this.main_area.style.height = this.game_height;

	// set miscelanneous attributes
	this.main_area.style.backgroundColor = "#050505";
	//this.main_area.style.overflow = "hidden";

	// add game area to body of document
	document.body.appendChild(this.main_area);

	this.blocker1 = document.createElement("div");
	this.blocker1.style.position = "absolute";
	this.blocker1.style.left = "0px";
	this.blocker1.style.top = "0px";
	this.blocker1.style.width = "171px";
	this.blocker1.style.height = "768px";
	this.blocker1.style.zIndex = 1000;
	this.blocker1.style.backgroundColor = "#000000";
	document.body.appendChild(this.blocker1);

	this.blocker2 = document.createElement("div");
	this.blocker2.style.position = "absolute";
	this.blocker2.style.left = "1195px";
	this.blocker2.style.top = "0px";
	this.blocker2.style.width = "171px";
	this.blocker2.style.height = "768px";
	this.blocker2.style.zIndex = 1000;
	this.blocker2.style.backgroundColor = "#000000";
	document.body.appendChild(this.blocker2);

	// 3 - create map div
	// ==================

	// create element
	this.map_div = document.createElement("div");
	this.map_div.id = this.name + "_map_div";
	this.map_div.style.position = "absolute";

	// set map div location within game area
	this.map_div.style.left = "-1024px";
	this.map_div.style.top = 0;	

	// set map div size
	this.map_div.width = (this.tile_width * this.map_width);
	this.map_div.height = (this.tile_height * this.map_height);

	// add map div inside game area
	this.main_area.appendChild(this.map_div);


	// 4 - create map canvas
	// =====================

	// create element
	this.map_canvas = document.createElement("canvas");
	this.map_canvas.id = this.name + "_map_canvas";
	this.map_canvas.style.position = "absolute";

	// set map canvas location within map div
	this.map_canvas.style.left = 0;
	this.map_canvas.style.top = 0;	

	// set map canvas size
	this.map_canvas.width = (this.tile_width * this.map_width);
	this.map_canvas.height = (this.tile_height * this.map_height);

	// set map canvas background colour
	this.map_canvas.style.backgroundColor = "#101010";

	// add map canvas inside map div
	this.map_div.appendChild(this.map_canvas);

	// retrive and store canvas context
	this.map_context = this.map_canvas.getContext("2d");
	this.map_context.translate(0, 0);

	// add empty tile markers to map
	/*for (var i = 0; i < this.map_height; i++)
	{
		for (var j = 0; j < this.map_width; j++)
		{
			// create line style for empty tile markers
			this.map_context.beginPath();
			this.map_context.lineWidth = "2";
			this.map_context.strokeStyle = "080808";

			// draw tile marker rectangle
			this.map_context.rect(j * this.tile_width + 1, i * this.tile_height + 1, this.tile_width - 2, this.tile_height - 2); 
			this.map_context.stroke();
		}
	}*/


	// 5 - create map marker
	// =====================

	// create element
	this.map_marker = document.createElement("div");
	this.map_marker.id = this.name + "_map_marker";
	this.map_marker.style.position = "absolute";

	// set map marker location within game area
	this.map_marker.style.left = 0;
	this.map_marker.style.top = 0;	

	// set map marker size
	this.map_marker.width = this.tile_width;
	this.map_marker.height = this.tile_height;

	// add image HTML code inside map marker
	//this.map_marker.innerHTML = "<img draggable = 'false' src = 'lib/marker.png'>";

	// add map marker inside map div
	this.map_div.appendChild(this.map_marker);

	this.pixelTiles = new Array();
	this.pixelFlags = new Array();
	this.pixelCodes = new Array();

	for (var i = 0; i < 256; i++)
	{
		this.pixelTiles[i] = document.createElement("canvas");
		this.pixelTiles[i].width = this.tile_width;
		this.pixelTiles[i].height = this.tile_height;

		this.pixelTiles[i].style.position = "absolute";
		this.pixelTiles[i].style.top = "0px";
		this.pixelTiles[i].style.left = "0px";

		this.pixelFlags[i] = 0;
		this.pixelCodes[i] = "";
	}

	// end of creation code
	// ==============================================


	// set functions
	// =============

	this.set_game_position = function(this_x, this_y)
	{
		this.main_area.style.left = this_x + "px";
		this.main_area.style.top = this_y + "px";		
	}

	this.set_game_size = function(this_width, this_height, this_zoom)
	{
		this.main_area.style.width = (this_width) + "px";
		this.main_area.style.height = (this_height) + "px";	

		this.game_width = this_width + "px";
		this.game_height = this_height + "px";	

		// set turn button location within game area
		//this.turn_button.style.left = (parseInt(this.game_width) - this.turn_button_style.width - this.turn_button_style.space) + "px";
		//this.turn_button.style.top = (parseInt(this.game_height) - this.turn_button_style.height - this.turn_button_style.space) + "px";
	}

	this.set_map_size = function(this_width, this_height)
	{
		this.map_width = this_width;
		this.map_height = this_height;

		// set map div size
		this.map_div.width = (this.tile_width * this.map_width);
		this.map_div.height = (this.tile_height * this.map_height);

		// set map canvas size
		this.map_canvas.width = (this.tile_width * this.map_width);
		this.map_canvas.height = (this.tile_height * this.map_height);

		// initalize map array
		for (var i = 0; i < this.map_height; i++)
		{
			this.map_array[i] = new Array();

			for (var j = 0; j < this.map_width; j++)
			{
				this.map_array[i][j] = new Array();
				this.map_tile(-1, j, i);
			}
		}
	}

	this.set_tile_size = function(this_width, this_height)
	{
		this.tile_width = this_width;
		this.tile_height = this_height;

		// set map div size
		this.map_div.width = (this.tile_width * this.map_width);
		this.map_div.height = (this.tile_height * this.map_height);

		// set map canvas size
		this.map_canvas.width = (this.tile_width * this.map_width);
		this.map_canvas.height = (this.tile_height * this.map_height);

		// initalize map array
		for (var i = 0; i < this.map_height; i++)
		{
			this.map_array[i] = new Array();

			for (var j = 0; j < this.map_width; j++)
			{
				this.map_array[i][j] = new Array();
				this.map_tile(-1, j, i);
			}
		}
	}

	this.set_room = function(this_id)
	{
		for (var i = 0; i < this.rooms.length; i++)
			if (this.rooms[i].id == this_id)
				break;

		this.rooms[i] = {};
		this.rooms[i].id = this_id;
		this.rooms[i].map_width = this.map_width;
		this.rooms[i].map_height = this.map_height;
		this.rooms[i].map_array = JSON.parse(JSON.stringify(this.map_array));

		//console.log(JSON.stringify(this.rooms));
	}

	this.set_object_pixel_x = function(this_object, this_pixel_x)
	{
		var this_move_element = document.getElementById(this_object.sprite_div_id);
		
		this_move_element.style.left = this_pixel_x + "px";
		this_object.pixel_x = this_pixel_x;
	}

	this.set_object_pixel_y = function(this_object, this_pixel_y)
	{
		var this_move_element = document.getElementById(this_object.sprite_div_id);
		
		this_move_element.style.top = this_pixel_y + "px";
		this_object.pixel_y = this_pixel_y;
	}

	this.set_sprite_frame = function(this_sprite_name, this_frame)
	{
		this_image = document.getElementById(this.get_sprite(this_sprite_name).div.id + "_image");

		this_image.style.left = -(this_frame * this.get_sprite(this_sprite_name).width) + "px";
		this.get_sprite(this_sprite_name).frame = this_frame;
	}

	this.replace_object_sprite = function(this_object, this_sprite_name)
	{
		var this_pixel_x = this_object.pixel_x;
		var this_pixel_y = this_object.pixel_y;

		this.set_object_pixel_x(this_object, -1000);
		this.set_object_pixel_y(this_object, -1000);

		var old_sprite = this.get_sprite(this_object.sprite_id);
		old_sprite.object_id = undefined;

		var new_sprite = this.get_sprite(this_sprite_name);
		new_sprite.object_id = this_object.id;

		this_object.sprite_id = this_sprite_name;
		this_object.sprite_div_id = new_sprite.div.id;

		this.set_object_pixel_x(this_object, this_pixel_x);
		this.set_object_pixel_y(this_object, this_pixel_y);		
	}

	this.set_random_seed = function(this_number)
	{
		this.random_seed = this_number;
	}

	// end of set functions
	// ==============================================


	// get functions
	// =============

	this.get_object = function(this_id)
	{
		for (i = 0; i < this.objects.length; i++)
			if (this.objects[i].id == this_id)
				return this.objects[i];

		return undefined;
	}

	this.get_object_by_name = function(this_name)
	{
		var this_object = new Array();

		for (i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == this_name && this.objects[i].class != "prototype")
				this_object[this_object.length] = this.objects[i];

		return this_object;
	}

	this.get_object_prototype = function(this_name)
	{
		for (i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == this_name && this.objects[i].class == "prototype")
				return this.objects[i];

		return undefined;
	}

	this.get_sprite = function(this_name)
	{
		for (i = 0; i < this.sprites.length; i++)
			if (this.sprites[i].name == this_name)
				return this.sprites[i];

		return undefined;
	}

	this.get_tile_canvas = function(this_tile_name)
	{
		for (i = 0; i < this.tile_names.length; i++)
			if (this.tile_names[i] == this_tile_name)
				return this.tile_canvas[i];

		return undefined;
	}

	this.get_tile_movement = function(this_tile_name)
	{
		this_movement = 0;

		for (var i = 0; i < this.tile_stats.length; i++)
		{
			for (var j = 0; j < this.tile_stats[i].tiles.length; j++)
			{
				for (var k = 0; k < this_tile_name.length; k++)
				{
					if (this.tile_stats[i].tiles[j] == this_tile_name[k])
					{
						if (this.tile_stats[i].movement == -1)
							return -1;
						else
							this_movement += this.tile_stats[i].movement;
					}
				}
			}
		}

		return this_movement;
	}

	this.get_map_tile_at_xy = function(this_x, this_y)
	{
		if (this_x >= 0 && this_x < this.map_width && this_y >= 0 && this_y < this.map_height)
			return this.map_array[this_y][this_x];
		else
			return [];
	}

	this.get_map_tile_at_pixel_xy = function(this_x, this_y)
	{
		this_x = Math.floor(this_x / this.tile_width);
		this_y = Math.floor(this_y / this.tile_height);
	
		if (this_x >= 0 && this_x < this.map_width && this_y >= 0 && this_y < this.map_height)
			return this.map_array[this_y][this_x];
		else
			return [];		
	}

	// end of get functions
	// ==============================================


	this.object_count = function(this_object_name)
	{
		var object_count = 0;

		for (i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == this_object_name)
				object_count++;

		return object_count;
	}


	// add functions
	// =============

	this.add_object_sprite = function(this_data)
	{
		var this_name = this_data.name + "_" + this.object_total;
		this.object_total++;

		if (this_data.sprite_name != undefined)
			this_sprite_name = this_data.sprite_name;
		else
			this_sprite_name = this_name + "_sprite";

		this.add_object({
			"name": this_data.name,
			"id": this_name,
			"sprite_id": this_sprite_name,
			"type": this_data.type,
			"class": this_data.class,
			"room": this_data.room,
			"speed": 0,
			"x": this_data.x, 
			"y": this_data.y,
			"image": this_data.image,
			"move_x": 0,
			"move_y": 0,
			"animate": 0
		});

		this.add_pixel_sprite({
			"name": this_sprite_name,
			"object_id": this_name,
			"image": this_data.image,
			"x": this_data.x, 
			"y": this_data.y,
			"pixel_x": this_data.pixel_x, 
			"pixel_y": this_data.pixel_y,
			"z": this_data.z,
			"place": this_data.place,
			"frames": this_data.frames,
			"rows": this_data.rows
		});	

		return this.get_object(this_name);
	}

	this.load_object = function(this_data)
	{
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].name == this_data.name && this.objects[i].class == "prototype")
				return;

		var this_object = this.add_object_sprite({
			"name": this_data.name,
			"type": this_data.type,
			"class": "prototype",
			"room": undefined,
			"image": this_data.image,
			"x": -100,
			"y": -100,
			"z": 0,
			"place": "middle",
			"frames": this_data.frames,
			"rows": this_data.rows
		});
	}

	this.clone_object = function(this_source_name, this_data)
	{
		var this_source = this.get_object_prototype(this_source_name);
		var this_source_sprite = this.get_sprite(this_source.sprite_id);

		var this_object = this.add_object_sprite({
			"name": this_source.name,
			"type": this_source.type,
			"room": this_data.room,
			"image": this_source.image,
			"x": this_data.x,
			"y": this_data.y,
			"pixel_x": this_data.pixel_x,
			"pixel_y": this_data.pixel_y,
			"z": this_data.z,
			"place": this_data.place,
			"frames": this_source_sprite.frames,
			"rows": this_source_sprite.rows
		});

		return this_object;
	}

	this.load_tile = function(this_data)
	{
		this.add_tile(this_data.name, this_data.image);

		this.add_tile_stats({
			"name": this_data.type,
			"tiles": [this_data.name],
			"movement": this_data.movement
		});	
	}

	this.add_object = function(attributes)
	{
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].id == attributes.id)
				break;

		this.objects[i] = attributes;

		if (this.objects[i].select != undefined)
			this.objects[i].select_event = new CustomEvent(this.objects[i].select);

		if (this.objects[i].deselect != undefined)
			this.objects[i].deselect_event = new CustomEvent(this.objects[i].deselect);

		return this.objects[i];
	}

	this.add_stat = function(attributes)
	{
		for (var i = 0; i < this.stats.length; i++)
			if (this.stats[i].name == attributes.name)
				break;

		this.stats[i] = attributes;
	}

	this.add_transfer = function(attributes)
	{
		for (var i = 0; i < this.transfers.length; i++)
			if (this.transfers[i].id == attributes.id)
				break;

		this.transfers[i] = attributes;
	}

	this.add_tile_stats = function(attributes)
	{
		for (var i = 0; i < this.tile_stats.length; i++)
			if (this.tile_stats[i].name == attributes.name)
				break;

		if (i == this.tile_stats.length)
			this.tile_stats[i] = attributes;
		else
		{
			this.tile_stats[i].tiles = this.tile_stats[i].tiles.concat(attributes.tiles);
			this.tile_stats[i].movement = attributes.movement;
		}
	}

	this.add_action = function(this_data)
	{
		this.action_data[this.action_data.length] = this_data;
	}

	this.add_hud = function(this_x, this_y, this_width, this_height)
	{
		this.hud = document.createElement("canvas");
		this.hud.id = "game_hud";

		this.hud.style.position = "absolute";
		this.hud.style.left = this_x + "px";
		this.hud.style.top = this_y + "px";

		this.hud.width = this_width;
		this.hud.height = this_height;

		this.main_area.appendChild(this.hud);
	}

	this.add_turn_button = function()
	{
		// create element
		this.turn_button = document.createElement("div");
		this.turn_button.id = this.name + "_turn";
		this.turn_button.style.position = "absolute";

		// set turn button location within game area
		this.turn_button.style.left = (parseInt(this.game_width) - this.turn_button_style.width - this.turn_button_style.space) + "px";
		this.turn_button.style.top = (parseInt(this.game_height) - this.turn_button_style.height - this.turn_button_style.space) + "px";

		this.turn_button.style.width = this.turn_button_style.width + "px";
		this.turn_button.style.height = this.turn_button_style.height + "px";

		this.turn_button.style.backgroundColor = this.turn_button_style.background;

		this.turn_button.style.color = this.turn_button_style.font_color;
		this.turn_button.style.fontFamily = this.turn_button_style.font_family;
		this.turn_button.style.fontSize = this.turn_button_style.font_size;

		this.turn_button.style.cursor = this.turn_button_style.cursor;

		this.turn_button.style.borderStyle = "solid";
		this.turn_button.style.borderWidth = "1px";		
		this.turn_button.style.borderColor = this.turn_button_style.border_color;

		this.turn_button.innerHTML = "<center><table style = 'vertical-align: middle' height = '" + this.turn_button_style.height + "px' cellspacing = '0' cellpadding = '0'><td>" + this.turn_button_style.label + "</td></table></center>";

		this.main_area.appendChild(this.turn_button);

		this.turn_button.onclick = (function (game)
		{
			return function(evt)
			{
				dispatchEvent(turn_event);
			}
		}) (this);	
	}

	this.add_readout = function()
	{
		// create element
		this.readout_div = document.createElement("div");
		this.readout_div.id = this.name + "_turn";
		this.readout_div.style.position = "absolute";

		// set turn button location within game area
		this.readout_div.style.left = this.readout_div_style.space + "px";
		this.readout_div.style.top = this.readout_div_style.space + "px";

		//this.readout_div.style.width = this.readout_div_style.width + "px";
		//this.readout_div.style.height = this.readout_div_style.height + "px";

		this.readout_div.style.color = this.readout_div_style.font_color;
		this.readout_div.style.fontFamily = this.readout_div_style.font_family;
		this.readout_div.style.fontSize = this.readout_div_style.font_size;

		this.main_area.appendChild(this.readout_div);		
	}

	this.add_readout_message = function(this_message, this_time)
	{
		var this_message_entry = {};
		this_message_entry.message = this_message;
		this_message_entry.time = this_time;

		this.readout_messages.splice(0, 0, this_message_entry);
	}

	this.centre_map_at = function(this_tile_x, this_tile_y)
	{
		centre_x = this_tile_x * this.tile_width;
		centre_y = this_tile_y * this.tile_height;

		this.map_div.style.left = (-centre_x + (parseInt(this.game_width) / 2) - (this.tile_width / 2)) + "px";
		this.map_div.style.top = (-centre_y + (parseInt(this.game_height) / 2) - (this.tile_height / 2)) + "px";

		if (parseInt(this.map_div.style.left) > this.lock_x1)
			this.map_div.style.left = this.lock_x1 + "px";

		if (parseInt(this.map_div.style.top) > this.lock_y1)
			this.map_div.style.top = this.lock_y1 + "px";

		if ((this.map_width * this.tile_width) > parseInt(this.game_width) && (parseInt(this.map_div.style.left) + parseInt(this.map_canvas.width)) - parseInt(this.game_width) < this.lock_x2)
			this.map_div.style.left = (-parseInt(this.map_div.width) + parseInt(this.game_width) + this.lock_x2) + "px";
		else if ((this.map_width * this.tile_width) < parseInt(this.game_width))
			this.map_div.style.left = this.lock_x1 + "px";

		if ((this.map_height * this.tile_height) > parseInt(this.game_height) && (parseInt(this.map_div.style.top) + parseInt(this.map_canvas.height)) - parseInt(this.game_height) < this.lock_y2)
			this.map_div.style.top = (-parseInt(this.map_div.height) + parseInt(this.game_height) + this.lock_y2) + "px";
		else if ((this.map_height * this.tile_height) < parseInt(this.game_height))
			this.map_div.style.top = this.lock_y1 + "px";

		if ((parseInt(this.map_div.style.top) + parseInt(this.map_canvas.height)) < parseInt(this.game_height))
			this.map_div.style.top = (-parseInt(this.map_canvas.height) + parseInt(this.game_height)) + "px";

		if ((parseInt(this.map_div.style.left) + parseInt(this.map_canvas.width)) < parseInt(this.game_width))
			this.map_div.style.left = (-parseInt(this.map_canvas.width) + parseInt(this.game_width)) + "px";

		if (parseInt(this.map_canvas.width) < parseInt(this.game_width))
			this.map_div.style.left = Math.floor((parseInt(this.game_width) -parseInt(this.map_canvas.width)) / 2) + "px";
	}

	this.center_map_at = function(this_tile_x, this_tile_y)
	{
		this.centre_map_at(this_tile_x, this_tile_y);
	}

	this.load_font = function(this_name, this_url)
	{
		var this_font = new FontFace(this_name, "url(" + this_url + ")");
		this.font_load[this.font_load.length] = -1;

		this_font.load().then((function(this_canvas, this_index) {
			return function()
			{
				this_canvas.font_load[this_index] = 1;
			}
		}) (this, this.font_load.length - 1));
	}

	this.add_tile = function(this_tile_name, this_tile_src)
	{
		for (var i = 0; i < this.tile_names.length; i++)
			if (this.tile_names == this_tile_name)
				break;

		this.tile_names[i] = this_tile_name;
		this.tile_load[i] = -1;

		this.tile_canvas[i] = document.createElement("canvas");

		this.tile_images[i] = new Image();
		this.tile_images[i].src = this_tile_src;

		this.tile_images[i].onload = (function (this_canvas, this_index)
		{
			return function(evt)
			{
				this_canvas.tile_canvas[this_index].getContext('2d').drawImage(evt.target, 0, 0);
				this_canvas.tile_load[this_index] = 1;
			}
		}) (this, i)
	}

	this.all_tiles_loaded = function()
	{
		for (var i = 0; i < this.tile_load.length; i++)
			if (this.tile_load[i] == -1)
				return false;

		return true;
	}

	this.all_sprites_loaded = function()
	{
		for (var i = 0; i < this.sprites_load.length; i++)
			if (this.sprites_load[i] == -1)
				return false;

		return true;
	}

	this.all_fonts_loaded = function()
	{
		for (var i = 0; i < this.font_load.length; i++)
			if (this.font_load[i] == -1)
				return false;

		return true;
	}

	this.map_room = function(this_id)
	{
		for (var i = 0; i < this.rooms.length; i++)
			if (this.rooms[i].id == this_id)
				break;

		if (i < this.rooms.length)
		{
			this.current_room = this_id;
			this.set_map_size(this.rooms[i].map_width, this.rooms[i].map_height);

			for (var j = 0; j < this.map_width; j++)
			{
				for (var k = 0; k < this.map_height; k++)
				{
					this.map_tile_array(this.rooms[i].map_array[k][j], j, k);
				}
			}

			for (var j = 0; j < this.objects.length; j++)
			{
				if (this.objects[j].room == this_id)
				{
					this_sprite = document.getElementById(this.objects[j].sprite_div_id);
					this_sprite.style.visibility = "visible";
				}
				else
				{
					this_sprite = document.getElementById(this.objects[j].sprite_div_id);
					this_sprite.style.visibility = "hidden";
				}
			}
		}
	}

	this.set_to_current_room = function()
	{
		object.room = this.current_room;

		this_sprite = document.getElementById(object.sprite_div_id);
		this_sprite.style.visibility = "visible";
	}

	this.change_sprite = function(this_sprite_name)
	{
		for (var i = 0; i < this.sprites.length; i++)
			if (this.sprites[i].name == this_sprite_name)
				break;

		if (i < this.sprites.length)
		{
			this.sprites[i].object_id = undefined;

			this_sprite = document.getElementById(object.sprite_div_id);
			this_sprite.style.visibility = "hidden";

			object.sprite_id = this_sprite_name;
			object.sprite_div_id = this.sprites[i].div.id;
			this.sprites[i].object_id = object.id;

			this.do_move_direct(object.x, object.y);

			this_sprite = document.getElementById(object.sprite_div_id);
			this_sprite.style.visibility = "visible";
		}
	}

	this.add_map_legend = function(this_symbol, this_function)
	{
		addEventListener("legend_" + this_symbol, this_function, false);
		tile_events["legend_" + this_symbol] = true;
	}

	this.draw_on_hud = function(this_src, this_x, this_y)
	{
		this_image = new Image();
		this_image.src = this_src;

		this_image.onload = (function (this_canvas, this_x, this_y)
		{
			return function(evt)
			{
				this_canvas.hud.getContext("2d").drawImage(evt.target, this_x, this_y);
				this_canvas.hud.backgroundColor = "#202020";
			}
		}) (this, this_x, this_y);
	}

	this.write_on_hud = function(this_text, this_x, this_y)
	{
		this.hud.getContext("2d").font = "20px Joystix";
		this.hud.getContext("2d").fillText(this_text, this_x, this_y);
	}

	this.map_to_tile = function(this_symbol, this_x, this_y)
	{
		tile.x = this_x;
		tile.y = this_y;

		if (tile_events["legend_" + this_symbol] != undefined)
		{
			this_event = new CustomEvent("legend_" + this_symbol);
			dispatchEvent(this_event);
		}
	}

	this.map_level = function(this_level)
	{
		this.set_map_size(this_level[0].length, this_level.length);

		for (var i = 0; i < this_level.length; i++)
		{
			if (this_level[i].indexOf(",") == -1)
				this_row = this_level[i].split("");
			else
				this_row = this_level[i].split(",");

			for (var j = 0; j < this_row.length; j++)
			{
				this_char = this_row[j].replace(/\s+/g, '').split(";");

				for (var k = 0; k < this_char.length; k++)
					this.map_to_tile(this_char[k], j, i);
			}
		}
	}

	this.get_map_char = function(this_x, this_y, this_level)
	{
		var this_row = this_level[this_y];

		if (this_row.indexOf(",") == -1)
			return this_level[this_y].split("")[this_x];
		else
			return this_level[this_y].split(",")[this_x];
	}

	this.map_tile_array = function(this_tile_array, this_x, this_y)
	{
		for (var i = 0; i < this_tile_array.length; i++)
			this.map_tile(this_tile_array[i], this_x, this_y);
	}

	this.map_pixel_tile = function(this_tile, this_x, this_y)
	{

			//if (this_x == 0 && this_y == 0) alert(this_tile);
		if (this.map_array[this_y][this_x] != this_tile || this.pixelFlags[this_tile] == 1)
		{
			this.map_context.clearRect(this_x * this.tile_width, this_y * this.tile_height, this.tile_width, this.tile_height);
			this.map_context.drawImage(this.pixelTiles[this_tile], this_x * this.tile_width, this_y * this.tile_height);
			this.map_array[this_y][this_x] = this_tile;
		}
	}

	this.map_tile = function(this_tile_name, this_x, this_y)
	{
		if (parseInt(this_tile_name) == -1)
		{
			this.map_array[this_y][this_x].length = 0;

			this.map_context.clearRect(this_x * this.tile_width, this_y * this.tile_height, this.tile_width, this.tile_height);

			// create line style for empty tile marker
			this.map_context.beginPath();
			this.map_context.lineWidth = "2";
			this.map_context.strokeStyle = "080808";

			// draw tile marker rectangle
			this.map_context.rect(this_x * this.tile_width + 1, this_y * this.tile_height + 1, this.tile_width - 2, this.tile_height - 2); 
			this.map_context.stroke();

			return;
		}

		this.map_array[this_y][this_x][this.map_array[this_y][this_x].length] = this_tile_name;

		for (var i = 0; i < this.tile_names.length; i++)
			if (this.tile_names[i] == this_tile_name)
				break;

		if (i < this.tile_names.length)
		{
			if (this.tile_load[i] == 1)
			{
				//console.log(this.tile_images[i]);
				this.map_context.drawImage(this.tile_images[i], this_x * this.tile_width, this_y * this.tile_height);
			}
			else
			{
				var this_canvas = this;

				var this_interval = setInterval((function(this_canvas){
					return function()
					{
				    	add_tile_image(this_canvas, i, this_x, this_y);
					}
				}) (this), 5);
			}

			var add_tile_image = function(this_canvas, this_index, this_x, this_y) 
			{
				if (this_canvas.tile_load[this_index] == 1)
				{
					//console.log(this_canvas.tile_images[i]);
					clearInterval(this_interval);
					this_canvas.map_context.drawImage(this_canvas.tile_images[this_index], this_x * this_canvas.tile_width, this_y * this_canvas.tile_height);
				}
			}
		}
		else
		{
			console.log("Error: no such tile as " + this_tile_name + ".");
		}
	}

	this.map_tile_replace = function(this_tile_name, this_x, this_y)
	{
		this.map_tile(-1, this_x, this_y);
		this.map_tile(this_tile_name, this_x, this_y);
	}

	this.remove_tile = function(this_tile_name, this_x, this_y)
	{
		var replace_tile = new Array();

		for (var i = 0; i < this.map_array[this_y][this_x].length; i++)
		{
			if (this.map_array[this_y][this_x][i] == this_tile_name)
			{
				this.map_array[this_y][this_x].splice(i, 1);
				break;
			}
		}

		for (var i = 0; i < this.map_array[this_y][this_x].length; i++)
			replace_tile[i] = this.map_array[this_y][this_x][i];

		this.map_tile(-1, this_x, this_y);

		for (var i = 0; i < replace_tile.length; i++)
			this.map_tile(replace_tile[i], this_x, this_y);
	}

	this.fill_tiles = function(startx, starty, endx, endy, tiles)
	{
		for (var i = startx; i <= endx; i++)
		{
			for (var j = starty; j <= endy; j++)
			{
				var this_tile = Math.floor(this.random_number(tiles.length));

				if (this.map_array[j][i].length == 0)
					this.map_tile(tiles[this_tile], i, j);
			}
		}
	}

	this.fill_all_tiles = function(tiles)
	{
		this.fill_tiles(0, 0, this.map_width - 1, this.map_height - 1, tiles);
	}

	this.clear_all_tiles = function()
	{
		for (var i = 0; i < this.map_width; i++)
			for (var j = 0; j < this.map_height; j++)
				this.map_tile(-1, i, j);
	}

	this.remove_object = function(this_object)
	{
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].id == this_object.id)
				break;

		if (i < this.objects.length)
		{
			if (this_object.sprite_id != undefined)
			{
				this_sprite = document.getElementById(this_object.sprite_div_id);
				this_sprite.parentElement.removeChild(this_sprite);

				for (var j = 0; j < this.sprites.length; j++)
					if (this.sprites[j].name == this_object.sprite_id)
						this.sprites.splice(j, 1);
			}

			this.objects.splice(i, 1);
		}
	}

	this.add_pixel_sprite = function(this_sprite)
	{
		// store JSON parameter attributes in relevant variables
		this_name = this_sprite.name;
		this_image = this_sprite.image;

		this_x = this_sprite.x;
		this_y = this_sprite.y;

		this_id = this_sprite.object_id;

		//this_click = this_sprite.click;

		for (var i = 0; i < this.sprites.length; i++)
			if (this.sprites.name = null)
				break;

		// create/erase entry in sprites array
		this.sprites[i] = {};

		// add sprite name and image
		this.sprites[i].name = this_name;
		this.sprites[i].image = this_image;

		// add sprite location
		this.sprites[i].x = this_x;
		this.sprites[i].y = this_y;
		this.sprites[i].pixel_x = this_sprite.pixel_x;
		this.sprites[i].pixel_y = this_sprite.pixel_y;

		this.sprites[i].place = this_sprite.place;

		// add sprite frame tick
		this.sprites[i].tick = this_sprite.tick;
		this.sprites[i].counter = 0;

		// add sprite dimensions
		this.sprites[i].frames = this_sprite.frames;
		this.sprites[i].rows = this_sprite.rows;

		// create sprite div
		this.sprites[i].div = document.createElement("div");
		this.sprites[i].div.id = this.name + "_sprite_" + this.sprite_count;
		this.sprites[i].div.style.position = "absolute";

		// set sprite div location within game area
		this.sprites[i].div.style.left = -1000 + "px";
		this.sprites[i].div.style.top = -1000 + "px";	

		// set sprite div size
		this.sprites[i].div.style.width = this.tile_width + "px";
		this.sprites[i].div.style.height = this.tile_height + "px";

		// set sprite div overflow style
		this.sprites[i].div.style.overflowX = "hidden";
		this.sprites[i].div.style.overflowY = "hidden";

		// set sprite z index
		this.sprites[i].div.style.zIndex = this_sprite.z;

		// set sprite object ID
		this.sprites[i].object_id = this_sprite.object_id;

		this.map_div.appendChild(this.sprites[i].div);

		if (this_id != null)
		{
			// add new div id to relevant object
			for (var j = 0; j < this.objects.length; j++)
				if (this.objects[j].id == this_id)
					break;

			this.objects[j].sprite_div_id = this.name + "_sprite_" + this.sprite_count;
		}

		this.sprites[i].canvas = document.createElement("canvas");
		this.sprites[i].canvas.id = this.name + "_sprite_" + this.sprite_count + "_image";
		this.sprites[i].canvas.style.position = "absolute";

		this.sprites[i].canvas.style.top = "0px";
		this.sprites[i].canvas.style.left = "0px";

		this.sprites[i].div.appendChild(this.sprites[i].canvas);

		this.sprites[i].div.style.width = this.tile_width + "px";
		this.sprites[i].div.style.height = this.tile_height + "px";

		this.sprites[i].width = this.tile_width;
		this.sprites[i].height = this.tile_height;
		this.sprites[i].frame = 0;

		this.sprites[i].div.style.left = this.sprites[i].pixel_x + "px";
		this.sprites[i].div.style.top = this.sprites[i].pixel_y + "px";

		if (this.sprites[i].object_id != undefined)
		{
			this.get_object(this.sprites[i].object_id).pixel_x = parseInt(this.sprites[i].div.style.left);
			this.get_object(this.sprites[i].object_id).pixel_y = parseInt(this.sprites[i].div.style.top);
		}

		this.sprites_load[i] = 1;

		this.sprite_count++;

		return this.sprites[i];
	}

	this.add_sprite = function(this_sprite)
	{
		// store JSON parameter attributes in relevant variables
		this_name = this_sprite.name;
		this_image = this_sprite.image;

		this_x = this_sprite.x;
		this_y = this_sprite.y;

		this_id = this_sprite.object_id;

		//this_click = this_sprite.click;

		for (var i = 0; i < this.sprites.length; i++)
			if (this.sprites.name = null)
				break;

		// create/erase entry in sprites array
		this.sprites[i] = {};

		// add sprite name and image
		this.sprites[i].name = this_name;
		this.sprites[i].image = this_image;

		// add sprite location
		this.sprites[i].x = this_x;
		this.sprites[i].y = this_y;
		this.sprites[i].pixel_x = this_sprite.pixel_x;
		this.sprites[i].pixel_y = this_sprite.pixel_y;

		this.sprites[i].place = this_sprite.place;

		// add sprite frame tick
		this.sprites[i].tick = this_sprite.tick;
		this.sprites[i].counter = 0;

		// add sprite dimensions
		this.sprites[i].frames = this_sprite.frames;
		this.sprites[i].rows = this_sprite.rows;

		// create sprite div
		this.sprites[i].div = document.createElement("div");
		this.sprites[i].div.id = this.name + "_sprite_" + this.sprite_count;
		this.sprites[i].div.style.position = "absolute";

		// set sprite div location within game area
		this.sprites[i].div.style.left = -1000 + "px";
		this.sprites[i].div.style.top = -1000 + "px";	

		// set sprite div size
		this.sprites[i].div.style.width = this.tile_width + "px";
		this.sprites[i].div.style.height = this.tile_height + "px";

		// set sprite div overflow style
		this.sprites[i].div.style.overflowX = "hidden";
		this.sprites[i].div.style.overflowY = "hidden";

		// set sprite z index
		this.sprites[i].div.style.zIndex = this_sprite.z;

		// set sprite object ID
		this.sprites[i].object_id = this_sprite.object_id;

		this.map_div.appendChild(this.sprites[i].div);

		if (this_id != null)
		{
			// add new div id to relevant object
			for (var j = 0; j < this.objects.length; j++)
				if (this.objects[j].id == this_id)
					break;

			this.objects[j].sprite_div_id = this.name + "_sprite_" + this.sprite_count;
		}

		this.sprites[i].canvas = document.createElement("canvas");
		this.sprites[i].canvas.id = this.name + "_sprite_" + this.sprite_count + "_image";
		this.sprites[i].canvas.style.position = "absolute";

		this.sprites[i].canvas.style.top = "0px";
		this.sprites[i].canvas.style.left = "0px";

		this.sprites[i].div.appendChild(this.sprites[i].canvas);

		// create sprite image
		this.sprites[i].image = document.createElement("img");
		this.sprites[i].image.id = this.name + "_sprite_" + this.sprite_count + "_image_cache";
		this.sprites[i].image.style.position = "absolute";

		this.sprites[i].image.style.top = "0px";
		this.sprites[i].image.style.left = "0px";

		this.sprites[i].image.src = this_image;
		this.sprites_load[i] = -1;

		this.sprites[i].image.onload = (function (this_canvas, this_sprite, this_index)
		{
			return function(evt)
			{
				this_sprite.canvas.getContext('2d').drawImage(evt.target, 0, 0);

				this_sprite.div.style.width = Math.floor(parseInt(evt.target.width) / this_sprite.frames) + "px";
				this_sprite.div.style.height = Math.floor(parseInt(evt.target.height) / this_sprite.rows) + "px";

				this_sprite.width = Math.floor(parseInt(evt.target.width) / this_sprite.frames);
				this_sprite.height = Math.floor(parseInt(evt.target.height) / this_sprite.rows);
				this_sprite.frame = 0;

				if (this_sprite.x != undefined)
				{
					if (this_sprite.place == "top" || this_sprite.place == 0)
					{
						this_sprite.div.style.left = (this_sprite.x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(this_sprite.div.style.width)) / 2) + "px";
						this_sprite.div.style.top = (this_sprite.y * this_canvas.tile_height) + "px";
					}
					else if (this_sprite.place == "middle" || this_sprite.place == 1)
					{
						this_sprite.div.style.left = (this_sprite.x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(this_sprite.div.style.width)) / 2) + "px";
						this_sprite.div.style.top = (this_sprite.y * this_canvas.tile_height) + Math.floor((this_canvas.tile_height - parseInt(this_sprite.div.style.height)) / 2) + "px";
					}
					else if (this_sprite.place == "bottom" || this_sprite.place == 2)
					{
						this_sprite.div.style.left = (this_sprite.x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(this_sprite.div.style.width)) / 2) + "px";
						this_sprite.div.style.top = (this_sprite.y * this_canvas.tile_height) + (this_canvas.tile_height - parseInt(this_sprite.div.style.height)) + "px";
					}
				}
				else
				{
					this_sprite.div.style.left = this_sprite.pixel_x + "px";
					this_sprite.div.style.top = this_sprite.pixel_y + "px";
				}

				if (this_sprite.object_id != undefined)
				{
					this_canvas.get_object(this_sprite.object_id).pixel_x = parseInt(this_sprite.div.style.left);
					this_canvas.get_object(this_sprite.object_id).pixel_y = parseInt(this_sprite.div.style.top);
				}

				this_canvas.sprites_load[this_index] = 1;
			}
		}) (this, this.sprites[i], i);

		this.sprite_count++;
	}

	this.set_sprite_row = function(this_row)
	{
		this_sprite = this.get_sprite(object.sprite_id);
		this_sprite_div = object.sprite_div_id;

		if (this_row > this_sprite.rows - 1)
			this_row = this_sprite.rows - 1;

		this_image = document.getElementById(this_sprite_div + "_image");
		this_image.style.top = -(parseInt(document.getElementById(this_sprite_div).style.height) * this_row) + "px";
	}

	this.set_object_sprite_row = function(this_object, this_row)
	{
		//var this_object = this.get_object(this_object_name);

		var this_sprite = this.get_sprite(this_object.sprite_id);
		var this_sprite_div = this_object.sprite_div_id;

		if (this_row > this_sprite.rows - 1)
			this_row = this_sprite.rows - 1;

		this_image = document.getElementById(this_sprite_div + "_image");
		this_image.style.top = -(parseInt(document.getElementById(this_sprite_div).style.height) * this_row) + "px";
	}

	this.move_object_to = function(this_object, this_pixel_x, this_pixel_y)
	{
		this_object.pixel_x = this_pixel_x;
		this_object.pixel_y = this_pixel_y;

		this.get_sprite(this_object.sprite_id).div.style.left = this_pixel_x + "px";
		this.get_sprite(this_object.sprite_id).div.style.top = this_pixel_y + "px";
	}

	this.do_move_queue = function(this_queue)
	{
		queue = this_queue;
		queue_counter = -1;

		queue_interval_id = setInterval((function(this_canvas)
		{
			return function()
			{
				if (this_canvas.move_flag == -1)
				{
					queue_counter++;

					if (queue_counter < queue.length)
						this_canvas.do_move(queue[queue_counter].x, queue[queue_counter].y);
					else
						clearInterval(queue_interval_id);
				}
			}
		}) (this), 17);
	}

	this.do_move_direct = function(target_x, target_y)
	{
		var this_move_element = document.getElementById(object.sprite_div_id);

		var this_move_target_x = target_x;
		var this_move_target_y = target_y;

		this_move_element.style.left = (this_move_target_x * this.tile_width) + Math.floor((this.tile_width - parseInt(this_move_element.style.width)) / 2)  + "px";
		this_move_element.style.top = (this_move_target_y * this.tile_height) + Math.floor((this.tile_height - parseInt(this_move_element.style.height)) / 2)  + "px";		

		object.x = this_move_target_x;
		object.y = this_move_target_y;
	}

	this.do_move_push = function(this_direction)
	{
		if (this_direction == 0)
		{
			object.move_x = object.speed;
			object.move_y = 0;
		}
	}

	this.do_move_set_xy = function(this_x, this_y)
	{
		if (this_x > object.x)
			this.do_move_set(0);
		else if (this_y > object.y)
			this.do_move_set(1);
		else if (this_x < object.x)
			this.do_move_set(2);
		else
			this.do_move_set(3);
	}

	this.do_move_set = function(this_direction)
	{
		this.set_sprite_row(this_direction);

		if (this_direction == 0 && this.get_tile_movement(this.get_map_tile_at_xy(object.x + 1, object.y)) != -1)
		{
			var this_objects = this.check_objects_at_xy(object.x + 1, object.y);
			var this_move_to = this.check_move_to_at_xy(object.x + 1, object.y);

			if (this_objects.length == 0 && this_move_to.length == 0)
			{
				object.move_to_x = object.x + 1;
				object.move_to_y = object.y;

				object.move_dir_x = 1;
				object.move_dir_y = 0;
			}
			else if (this_objects.length == 1)
			{
				collide_objects = this_objects;
				var collide_event = new CustomEvent(object.collide);
				dispatchEvent(collide_event);
			}
		}
		else if (this_direction == 1 && this.get_tile_movement(this.get_map_tile_at_xy(object.x, object.y + 1)) != -1)
		{
			var this_objects = this.check_objects_at_xy(object.x, object.y + 1);
			var this_move_to = this.check_move_to_at_xy(object.x, object.y + 1);

			if (this_objects.length == 0 && this_move_to.length == 0)
			{
				object.move_to_x = object.x;
				object.move_to_y = object.y + 1;

				object.move_dir_x = 0;
				object.move_dir_y = 1;
			}
			else if (this_objects.length == 1)
			{
				collide_objects = this_objects;
				var collide_event = new CustomEvent(object.collide);
				dispatchEvent(collide_event);
			}
		}
		else if (this_direction == 2 && this.get_tile_movement(this.get_map_tile_at_xy(object.x - 1, object.y)) != -1)
		{
			var this_objects = this.check_objects_at_xy(object.x - 1, object.y);
			var this_move_to = this.check_move_to_at_xy(object.x - 1, object.y);

			if (this_objects.length == 0 && this_move_to.length == 0)
			{
				object.move_to_x = object.x - 1;
				object.move_to_y = object.y;

				object.move_dir_x = -1;
				object.move_dir_y = 0;
			}
			else if (this_objects.length == 1)
			{
				collide_objects = this_objects;
				var collide_event = new CustomEvent(object.collide);
				dispatchEvent(collide_event);
			}
		}
		else if (this_direction == 3 && this.get_tile_movement(this.get_map_tile_at_xy(object.x, object.y - 1)) != -1)
		{
			var this_objects = this.check_objects_at_xy(object.x, object.y - 1);
			var this_move_to = this.check_move_to_at_xy(object.x, object.y - 1);

			if (this_objects.length == 0 && this_move_to.length == 0)
			{
				object.move_to_x = object.x;
				object.move_to_y = object.y - 1;

				object.move_dir_x = 0;
				object.move_dir_y = -1;
			}
			else if (this_objects.length == 1)
			{
				collide_objects = this_objects;
				var collide_event = new CustomEvent(object.collide);
				dispatchEvent(collide_event);
			}
		}
		else
		{
			object.move_to_x = undefined;
			object.move_to_y = undefined;
			object.move_dir_x = 0;
			object.move_dir_y = 0;
		}
	}

	this.do_move_wind = function()
	{
		if (this.move_counter == 0)
			this.move_counter = Math.floor(this.tile_height / this.move_speed) + 1;
	}

	// move selected object to specified tile
	this.do_move = function(target_x, target_y)
	{
		this.move_target_x = target_x;
		this.move_target_y = target_y;

		this.move_flag = 1;
		this.move_x = 0;
		this.move_y = 0;

		if (target_x > object.x)
			this.move_x = this.move_speed
		else if (target_x < object.x)
			this.move_x = -this.move_speed

		if (target_y > object.y)
			this.move_y = this.move_speed
		else if (target_y < object.y)
			this.move_y = -this.move_speed

		if (target_x != 0)
			this.move_counter = Math.floor(this.tile_width / this.move_speed) + 1;
		else if (target_y != 0)
			this.move_counter = Math.floor(this.tile_height / this.move_speed) + 1;

		this.move_element = document.getElementById(object.sprite_div_id);

		object.movement -= this.get_tile_movement(this.map_array[object.y][object.x]);

		this.interval_id = setInterval((function(this_canvas)
		{
			return function()
			{
				this_canvas.move_counter--;
				
				if (this_canvas.move_counter <= 0)
				{
					this_canvas.move_element.style.left = (this_canvas.move_target_x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(this_canvas.move_element.style.width)) / 2)  + "px";
					this_canvas.move_element.style.top = (this_canvas.move_target_y * this_canvas.tile_height) + Math.floor((this_canvas.tile_height - parseInt(this_canvas.move_element.style.height)) / 2)  + "px";

					if (this_canvas.scroll_object = object.id)
					{
						var object_relative_x = parseInt(this_canvas.move_element.style.left) + parseInt(this_canvas.map_div.style.left);
						var object_relative_y = parseInt(this_canvas.move_element.style.top) + parseInt(this_canvas.map_div.style.top);

						if (this_canvas.move_x != 0 && object_relative_x < ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) < 0)
							this_canvas.map_div.style.left = (object_relative_x - parseInt(this_canvas.move_element.style.left)) + "px";
						else if (this_canvas.move_x > 0 && object_relative_x > ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) > (parseInt(this_canvas.game_width) - parseInt(this_canvas.map_div.width)))
							this_canvas.map_div.style.left = (object_relative_x - parseInt(this_canvas.move_element.style.left)) + "px";
						
						if (this_canvas.move_y < 0 && object_relative_y < ((parseInt(this_canvas.game_height) / 2) - this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) < 0)
							this_canvas.map_div.style.top = (object_relative_y - parseInt(this_canvas.move_element.style.top)) + "px";
						else if (this_canvas.move_y > 0 && object_relative_y > ((parseInt(this_canvas.game_height) / 2) + this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) > (parseInt(this_canvas.game_height) - parseInt(this_canvas.map_div.height)))
							this_canvas.map_div.style.top = (object_relative_y - parseInt(this_canvas.move_element.style.top)) + "px";
					}

					this_canvas.move_flag = -1;

					object.x = this_canvas.move_target_x;
					object.y = this_canvas.move_target_y;

					if (this.display_object_stats == true)
					{
						// store the object id because object.id will change after display_object_divs is called
						var old_object_id = object.id;

						display_object_divs(this_canvas, object.x, object.y);
						open_object_div_id(this_canvas, old_object_id);
					}

					clearInterval(this_canvas.interval_id);

					if (end_move_event != undefined)
						dispatchEvent(end_move_event);
				}
				else
				{
					this_canvas.move_element.style.left = (parseInt(this_canvas.move_element.style.left) + this_canvas.move_x) + "px";
					this_canvas.move_element.style.top = (parseInt(this_canvas.move_element.style.top) + this_canvas.move_y) + "px";

					if (this_canvas.move_counter % this_canvas.get_sprite(object.sprite_id).tick == 0)
					{
						this_image = document.getElementById(this_canvas.move_element.id + "_image");
						this_image.style.left = (parseInt(this_image.style.left) - parseInt(this_canvas.move_element.style.width)) + "px";

						if (parseInt(this_image.style.left) <= -(parseInt(this_canvas.move_element.style.width) * this_canvas.get_sprite(object.sprite_id).frames))
							this_image.style.left = "0px";
					}

					if (this_canvas.scroll_object = object.id)
					{
						var object_relative_x = parseInt(this_canvas.move_element.style.left) + parseInt(this_canvas.map_div.style.left);
						var object_relative_y = parseInt(this_canvas.move_element.style.top) + parseInt(this_canvas.map_div.style.top);

						if (this_canvas.move_x < 0 && object_relative_x < ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) < 0)
							this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - this_canvas.move_x) + "px";
						else if (this_canvas.move_x > 0 && object_relative_x > ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) > (parseInt(this_canvas.game_width) - parseInt(this_canvas.map_div.width)))
							this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - this_canvas.move_x) + "px";

						if (this_canvas.move_y < 0 && object_relative_y < ((parseInt(this_canvas.game_height) / 2) - this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) < 0)
							this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - this_canvas.move_y) + "px";
						else if (this_canvas.move_y > 0 && object_relative_y > ((parseInt(this_canvas.game_height) / 2) + this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) > (parseInt(this_canvas.game_height) - parseInt(this_canvas.map_div.height)))
							this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - this_canvas.move_y) + "px";
					}
				}
			}
		}) (this), 17);
	}

	this.check_objects_at_xy = function(this_x, this_y)
	{
		var this_objects = new Array();

		for (var i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i].room == this.current_room && this.objects[i].x == this_x && this.objects[i].y == this_y)
				this_objects[this_objects.length] = this.objects[i];
		}

		return this_objects;
	}

	this.check_objects_at_pixel_xy = function(this_x, this_y)
	{
		var this_objects = new Array();

		for (var i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i].room == this.current_room)
			{
				if (this_x >= this.objects[i].pixel_x && this_x <= (this.objects[i].pixel_x + this.get_sprite(this.objects[i].sprite_id).width) && this_y >= this.objects[i].pixel_y && this_y <= (this.objects[i].pixel_y + this.get_sprite(this.objects[i].sprite_id).height))
				{					
					var this_colour = this.get_sprite(this.objects[i].sprite_id).canvas.getContext("2d").getImageData(this_x - this.objects[i].pixel_x, this_y - this.objects[i].pixel_y, 1, 1).data;

					if (this_colour[3] != 0)
						this_objects[this_objects.length] = this.objects[i];
				}
			}
		}

		return this_objects;
	}

	this.check_objects_at_level = function(this_x1, this_x2, this_y, this_precision)
	{
		var this_objects = new Array();

		if (this_x1 > this_x2)
		{
			this_temp = this_x2;
			this_x2 = this_x1;
			this_x1 = this_temp; 
		}

		for (var i = this_x1; i <= this_x2; i += this_precision)
		{
			this_objects = arrayUnique(this_objects.concat(this.check_objects_at_pixel_xy(i, this_y)));
		}

		return this_objects;
	}

	this.check_objects_at_box = function(this_x, this_y, this_width, this_height, this_precision)
	{
		var this_objects = new Array();

		for (var i = this_y - Math.floor(this_height / 2); i < this_y + Math.floor(this_height / 2); i += this_precision)
		{
			for (var j = this_x - Math.floor(this_width / 2); j < this_x + Math.floor(this_width / 2); j += this_precision)
			{
				this_objects = arrayUnique(this_objects.concat(this.check_objects_at_pixel_xy(j, i)));
			}

		}

		return this_objects;
	}

	this.check_object_collisions = function(this_object, this_width, this_height, this_precision)
	{
		var this_objects = new Array();

		this_x = this_object.pixel_x + Math.floor(this.get_sprite(this_object.sprite_id).width / 2);
		this_y = this_object.pixel_y + Math.floor(this.get_sprite(this_object.sprite_id).height / 2);
		
		this_objects = this.check_objects_at_box(this_x, this_y, this_width, this_height, this_precision);

		for(var i = 0; i < this_objects.length; i++)
			if (this_objects[i].id == this_object.id)
				this_objects.splice(i, 1);

		return this_objects;
	}

	this.check_object_object_collision = function(this_object1, this_object2, this_precision)
	{
		
	}

	this.check_move_to_at_xy = function(this_x, this_y)
	{
		this_objects = new Array();

		for (var i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i].room == this.current_room && this.objects[i].move_to_x == this_x && this.objects[i].move_to_y == this_y)
				this_objects[this_objects.length] = this.objects[i];
		}

		return this_objects;
	}

	this.check_transfers = function(this_object_id)
	{
		for (var i = 0; i < this.objects.length; i++)
			if (this.objects[i].id == this_object_id)
				break;

		if (i < this.objects.length)
		{
			for (j = 0; j < this.transfers.length; j++)
			{
				if (this.transfers[j].room == this.current_room)
				{
					if (this.transfers[j].x == this.objects[i].x && this.transfers[j].y == this.objects[i].y)
						return this.transfers[j];
				}
			}
		}

		return undefined;
	}

	this.get_centre_of_object = function(this_object)
	{
		var sprite_x = parseInt(document.getElementById(this_object.sprite_div_id).style.left);
		var sprite_y = parseInt(document.getElementById(this_object.sprite_div_id).style.top);

		var centre_x = sprite_x + (parseInt(document.getElementById(this_object.sprite_div_id).style.width) / 2);
		var centre_y = sprite_y + (parseInt(document.getElementById(this_object.sprite_div_id).style.height) / 2);

		return [centre_x, centre_y];
	}

	this.get_distance_to_tile = function(target_x, target_y)
	{
		var object_div_x = this.get_centre_of_object(object)[0];
		var object_div_y = this.get_centre_of_object(object)[1];

		var target_x_screen = target_x * this.tile_width + (this.tile_width / 2);
		var target_y_screen = target_y * this.tile_height + (this.tile_height / 2);

		return Math.sqrt(Math.pow(object_div_x - target_x_screen, 2) + Math.pow(object_div_y - target_y_screen, 2));
	}

	// pathfinding function, searching from counter location to target counter
	this.do_pathfind = function(target_x, target_y)
	{
		var i;
		var j;
		var k;

		// variables used when searching grid
		var searchFromX;
		var searchFromY;

		// variables used to keep track of positions in the search registry
		var indexMax = 0;
		var indexCeiling = 0;
		var indexFloor = 0;
		var indexLast = 0;

		// variable used to count new searches each pass
		var searchCount = 0;

		// search registry used to keep track of searched squares on the grid
		var searchRegistry = new Array();

		// array used to mark searched squares on a grid (will be made two-dimensional)
		var searchGrid = new Array();

		// initialize search registry
		for (i = 0; i < 1000; i++)
		{
			searchRegistry[i] = new Array();
			searchRegistry[i][0] = -1;
			searchRegistry[i][1] = -1;
			searchRegistry[i][2] = -1;
			searchRegistry[i][3] = -1;
			searchRegistry[i][4] = -1;
			searchRegistry[i][5] = -1;
		}

		// initialize searchGrid so all search flags are set to positive (i.e. can be searched)
		for (i = 0; i < this.map_height; i++)
		{
			searchGrid[i] = new Array();

			for (j = 0; j < this.map_width; j++)
				searchGrid[i][j] = 1;
		}

		// add piece's current location as first element of search registry
		// index: 0: x location, 1: y location, 2: search flag, 3: depth, 4: ancestor, 5: distance
		searchRegistry[0][0] = object.x;
		searchRegistry[0][1] = object.y;
		searchRegistry[0][2] = 1;
		searchRegistry[0][3] = 0;
		searchRegistry[0][4] = -1;
		searchRegistry[0][5] = 0;

		// cycle through the registry until goal is found, or all locations have been worked through
		do
		{
			// initialize search count each time a new pass is made
			searchCount = 0;

			// set the maximum index that will be parsed during this pass
			indexMax = indexCeiling;

			var search_flag = -1;
			var search_dist = 1000000;

			for (j = 0; j < searchRegistry.length; j++)
			{
				if (searchRegistry[j][0] == -1)
					break;
				else if (searchRegistry[j][2] == 1 && searchGrid[searchRegistry[j][1]][searchRegistry[j][0]] == 1 && searchRegistry[j][5] < search_dist)
				{
					search_flag = j;
					search_dist = searchRegistry[j][5];
				}
			}
			
			if (search_flag == -1)
				return -1;
			else
				j = search_flag;

			// one pass of the registry
			//for (j = indexFloor; j <= indexMax; j++)
			//{
				// set x and y values to search from
				var searchFromX = searchRegistry[j][0];
				var searchFromY = searchRegistry[j][1];

				// if both search flags are positive, process this position
				if (searchRegistry[j][2] == 1 && searchGrid[searchFromY][searchFromX] == 1)
				{
					// increase the search count
					searchCount++;

					// flag that this index in the registry has now been processed
					searchRegistry[j][2] = -1;

					// flag that this position on the map has now been processed
					searchGrid[searchFromY][searchFromX] = -1;        

					// reindex the floor position for the next pass
	            	indexFloor = j;

					// if this is goal location, determine movement direction and exit function
					if (searchFromX == target_x && searchFromY == target_y)
					{
						var full_path = new Array();

						// cycle back through ancestors until square adjacent to game piece is found
						do
						{
							var this_index = searchRegistry[j][3] - 1;

							if (this.get_tile_movement(this.map_array[searchRegistry[j][1]][searchRegistry[j][0]]) != -1)
							{
								full_path[this_index] = {};
								full_path[this_index].x = searchRegistry[j][0];
								full_path[this_index].y = searchRegistry[j][1];
							}

							//if (searchRegistry[j][3] == 1) break;
							j = searchRegistry[j][4];
						}
						while (j != -1);

						//full_path[0] = {};
						//full_path[0].x = searchRegistry[j][0];
						//full_path[0].y = searchRegistry[j][1];

						move_index = object.movement;

						for (var k = -1; k < full_path.length; k++)
						{
							if (k == -1)
							{
								if (this.get_tile_movement(this.map_array[object.y][object.x]) > move_index)
									break;
								else
									move_index = move_index - this.get_tile_movement(this.map_array[object.y][object.x]);
							}
							else
							{
								if (this.get_tile_movement(this.map_array[full_path[k].y][full_path[k].x]) > move_index)
									break;
								else
									move_index = move_index - this.get_tile_movement(this.map_array[full_path[k].y][full_path[k].x]);
							}
						}

						if (k < full_path.length)
							full_path.length = k + 1;

						return full_path;
					}

					// otherwise, search in all four directions for new search squares
					// if there is a square to the right on the grid, and it has not yet been added to the registry, possibly add it to registry
					if (searchFromX < this.map_width - 1 && searchGrid[searchFromY][searchFromX + 1] == 1)
					{
						// check if square to the right is not a block tile; if not, add it to registry
						if (this.get_tile_movement(this.map_array[searchFromY][searchFromX + 1]) != -1 || ((searchFromX + 1) == target_x && searchFromY == target_y))
						{
							// increase the final index of the registry
							for (indexLast = 0; indexLast < searchRegistry.length; indexLast++)
								if (searchRegistry[indexLast][0] == -1)
									break;

							// add square to the right of current location as next element of search registry
							// index: 0: x location, 1: y location, 2: search flag, 3: depth, 4: ancestor 
							searchRegistry[indexLast][0] = searchFromX + 1;
							searchRegistry[indexLast][1] = searchFromY;
							searchRegistry[indexLast][2] = 1;
							searchRegistry[indexLast][3] = searchRegistry[j][3] + 1;
							searchRegistry[indexLast][4] = j;
							searchRegistry[indexLast][5] = searchRegistry[j][5] + this.get_tile_movement(this.map_array[searchFromY][searchFromX]);

							// increase indexCeiling if lower than indexLast
	                        if (indexLast > indexCeiling) indexCeiling = indexLast;
						}
					}

					// if there is a square underneath on the grid, and it has not yet been added to the registry, possibly add it to registry
					if (searchFromY < this.map_height - 1 && searchGrid[searchFromY + 1][searchFromX] == 1)
					{
						// check if square underneath is not a block tile; if not, add it to registry
						if (this.get_tile_movement(this.map_array[searchFromY + 1][searchFromX]) != -1 || (searchFromX == target_x && (searchFromY + 1) == target_y))
						{
							// increase the final index of the registry
							for (indexLast = 0; indexLast < searchRegistry.length; indexLast++)
								if (searchRegistry[indexLast][0] == -1)
									break;

							// add square underneath of current location as next element of search registry
							// index: 0: x location, 1: y location, 2: search flag, 3: depth, 4: ancestor
							searchRegistry[indexLast][0] = searchFromX;
							searchRegistry[indexLast][1] = searchFromY + 1;
							searchRegistry[indexLast][2] = 1;
							searchRegistry[indexLast][3] = searchRegistry[j][3] + 1;
							searchRegistry[indexLast][4] = j;
							searchRegistry[indexLast][5] = searchRegistry[j][5] + this.get_tile_movement(this.map_array[searchFromY][searchFromX]);

							// increase indexCeiling if lower than indexLast
	                        if (indexLast > indexCeiling) indexCeiling = indexLast;
						}
					}

					// if there is a square to the left on the grid, and it has not yet been added to the registry, possibly add it to registry
					if (searchFromX > 0 && searchGrid[searchFromY][searchFromX - 1] == 1)
					{
						// check if square to the left is not a block tile; if not, add it to registry
						if (this.get_tile_movement(this.map_array[searchFromY][searchFromX - 1]) != -1 || ((searchFromX - 1) == target_x && searchFromY == target_y))
						{
							// increase the final index of the registry
							for (indexLast = 0; indexLast < searchRegistry.length; indexLast++)
								if (searchRegistry[indexLast][0] == -1)
									break;

							// add square to the left of current location as next element of search registry
							// index: 0: x location, 1: y location, 2: search flag, 3: depth, 4: ancestor
							searchRegistry[indexLast][0] = searchFromX - 1;
							searchRegistry[indexLast][1] = searchFromY;
							searchRegistry[indexLast][2] = 1;
							searchRegistry[indexLast][3] = searchRegistry[j][3] + 1;
							searchRegistry[indexLast][4] = j;
							searchRegistry[indexLast][5] = searchRegistry[j][5] + this.get_tile_movement(this.map_array[searchFromY][searchFromX]);

							// increase indexCeiling if lower than indexLast
	                        if (indexLast > indexCeiling) indexCeiling = indexLast;
						}
					}

					// if there is a square above on the grid, and it has not yet been added to the registry, possibly add it to registry
					if (searchFromY > 0 && searchGrid[searchFromY - 1][searchFromX] == 1)
					{
						// check if square above is not a block tile; if not, add it to registry
						if (this.get_tile_movement(this.map_array[searchFromY - 1][searchFromX]) != -1 || (searchFromX == target_x && (searchFromY - 1) == target_y))
						{
							// increase the final index of the registry
							for (indexLast = 0; indexLast < searchRegistry.length; indexLast++)
								if (searchRegistry[indexLast][0] == -1)
									break;

							// add square above current location as next element of search registry
							// index: 0: x location, 1: y location, 2: search flag, 3: depth, 4: ancestor
							searchRegistry[indexLast][0] = searchFromX;
							searchRegistry[indexLast][1] = searchFromY - 1;
							searchRegistry[indexLast][2] = 1;
							searchRegistry[indexLast][3] = searchRegistry[j][3] + 1;
							searchRegistry[indexLast][4] = j;
							searchRegistry[indexLast][5] = searchRegistry[j][5] + this.get_tile_movement(this.map_array[searchFromY][searchFromX]);

							// increase indexCeiling if lower than indexLast
	                        if (indexLast > indexCeiling) indexCeiling = indexLast;
						}
					}
				}
			//}
		}
		while (searchCount > 0);

	    return -1;
	}

	// random function borrowed from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
	this.random_number = function(this_random_max)
	{
		var x = Math.sin(this.random_seed++) * 10000;
	    return (x - Math.floor(x)) * this_random_max;
	}


	this.do_click = function(element_id, this_function)
	{
		document.getElementById(element_id).onclick = (function (game, this_function)
		{
			return function(evt)
			{
				this_function();
			}
		}) (this, this_function)
	}

	this.add_start_move_function = function(this_function)
	{
		addEventListener("start_move", this_function, false);
		start_move_event = new CustomEvent("start_move");
	}

	this.add_end_move_function = function(this_function)
	{
		addEventListener("end_move", this_function, false);
		end_move_event = new CustomEvent("end_move");
	}

	this.add_select_function = function(event_id, this_function)
	{
		addEventListener(event_id, this_function, false);
	}

	this.add_deselect_function = function(event_id, this_function)
	{
		addEventListener(event_id, this_function, false);
	}

	this.add_collide_function = function(event_id, this_function)
	{
		addEventListener(event_id, this_function, false);
	}

	this.add_right_click_function = function(this_function)
	{
		addEventListener("right_click", this_function, false);
	}

	this.add_turn_function = function(this_function)
	{
		addEventListener("turn", this_function, false);
	}

	this.add_keydown_function = function(this_function)
	{
		this.game_keydown_function = this_function;
	}

	this.add_keyup_function = function(this_function)
	{
		this.game_keyup_function = this_function;
	}

	this.add_pre_move_function = function(this_object_name, this_function)
	{
		if (this_object_name == "game")
		{
			this.game_pre_move_function = this_function;
		}
		else
		{
			for (var i = 0; i < this.objects_pre_move_functions.length; i++)
				if (this.objects_pre_move_functions[i].name == this_object_name)
					break;

			this.objects_pre_move_functions[i] = {}
			this.objects_pre_move_functions[i].name = this_object_name;
			this.objects_pre_move_functions[i].function = this_function;
		}
	}	

	this.add_pre_move_function_id = function(this_object_id, this_function)
	{
		this_object = this.get_object(this_object_id);
		this_event_id = this_object_id + "_pre_move";

		this_object.pre_move_event = this_event_id;
		addEventListener(this_event_id, this_function, false);
	}

	this.lever_create = function(this_lever)
	{
		lever_create(this, this_lever);
	}

	this.lever_update = function(this_lever)
	{
		lever_update(this, this_lever);
	}


	this.start_game_loop = function(this_fps)
	{
		this.game_loop_fps = this_fps;
		this.fps_interval = 1000 / this_fps;
    	this.time_then = Date.now();
    	
    	do_game_loop(this);
	}

	this.start_arcade_game_loop = function(this_fps)
	{
		this.game_loop_fps = this_fps;
		this.fps_interval = 1000 / this_fps;
    	this.time_then = Date.now();
    	
    	do_arcade_game_loop(this);
	}

	// map div drag events
	// ======================

	this.map_div.onmousedown = (function (this_canvas)
	{
		return function(evt)
		{
			this_canvas.mouse_down = 1;
			this_canvas.old_x = evt.pageX;
			this_canvas.old_y = evt.pageY;

			this_canvas.mouse_count = 0;
			this_canvas.count_interval = setInterval(function(){ this_canvas.mouse_count++; }, 60);
		}
	}) (this)

	this.map_div.onmouseup = (function (this_canvas)
	{
		return function(evt)
		{
			map_mouseup(evt, this_canvas);
		}
	}) (this)

	this.map_div.onmousemove = (function (this_canvas)
	{
		return function(evt)
		{
			map_mousemove(evt, this_canvas);
		}
	}) (this)

	document.body.onmouseup = (function (this_canvas)
	{
		return function(evt)
		{
			this_canvas.mouse_down = -1;
			this_canvas.old_x = -1;
			this_canvas.old_y = -1;

			clearInterval(this_canvas.count_interval);
		}
	}) (this)
}


// game get functions
// =============

selected = function()
{
	return object;
}

tile_x = function()
{
	return game.tile_x;
}

tile_y = function()
{
	return game.tile_y;
}

display_object_divs = function(this_canvas, this_x, this_y)
{
	this_canvas.object_div_x = this_x;
	this_canvas.object_div_y = this_y;

	var div_count = 0;

	for (var i = 0; i < this_canvas.objects.length; i++)
	{
		if (this_canvas.objects[i].x == this_x && this_canvas.objects[i].y == this_y)
		{
			this_canvas.object_div_index[div_count] = i;

			this_canvas.object_div[div_count].main.style.left = this_canvas.object_div_style.space + "px";

			if (div_count == 0)
				this_canvas.object_div[div_count].main.style.top = this_canvas.object_div_style.space + "px";
			else
				this_canvas.object_div[div_count].main.style.top = (parseInt(this_canvas.object_div[div_count - 1].main.style.top) + parseInt(this_canvas.object_div[div_count - 1].main.style.height) + this_canvas.object_div_style.space) + "px";

			this_canvas.object_div[div_count].main.style.width = this_canvas.object_div_style.width + "px";						
			this_canvas.object_div[div_count].main.style.height = this_canvas.object_div_style.height + "px";					
			this_canvas.object_div[div_count].main.style.borderWidth = "0px";

			this_canvas.object_div[div_count].main.style.backgroundColor = this_canvas.object_div_style.background;
			this_canvas.object_div[div_count].main.style.cursor = this_canvas.object_div_style.cursor;

			this_canvas.object_div[div_count].image.style.left = this_canvas.object_div_style.image_x + "px";
			this_canvas.object_div[div_count].image.style.top = this_canvas.object_div_style.image_y + "px";
			this_canvas.object_div[div_count].image.src = this_canvas.objects[i].image;					

			// set object ID
			this_canvas.object_div[div_count].object_id.innerHTML = this_canvas.objects[i].id;


			// set name location
			this_canvas.object_div[div_count].name.style.left = this_canvas.object_div_style.name_x + "px";
			this_canvas.object_div[div_count].name.style.top = this_canvas.object_div_style.name_y + "px";

			// set name font style
			this_canvas.object_div[div_count].name.style.color = this_canvas.object_div_style.name_font_color;
			this_canvas.object_div[div_count].name.style.fontFamily = this_canvas.object_div_style.name_font_family;
			this_canvas.object_div[div_count].name.style.fontSize = this_canvas.object_div_style.name_font_size;

			// set name
			this_canvas.object_div[div_count].name.innerHTML = this_canvas.objects[i].name;						


			// set type location
			this_canvas.object_div[div_count].type.style.left = this_canvas.object_div_style.type_x + "px";
			this_canvas.object_div[div_count].type.style.top = this_canvas.object_div_style.type_y + "px";

			// set type font style
			this_canvas.object_div[div_count].type.style.color = this_canvas.object_div_style.type_font_color;
			this_canvas.object_div[div_count].type.style.fontFamily = this_canvas.object_div_style.type_font_family;
			this_canvas.object_div[div_count].type.style.fontSize = this_canvas.object_div_style.type_font_size;

			// set type
			this_canvas.object_div[div_count].type.innerHTML = this_canvas.objects[i].type;	

			this_canvas.div_container.appendChild(this_canvas.object_div[div_count].main);

	        var stat_count = 0;

			for (var key in this_canvas.objects[i]) 
			{
			    if (this_canvas.objects[i].hasOwnProperty(key)) 
			    {
			        //console.log(key + " -> " + this_canvas.objects[i][key]);

			        for (var j = 0; j < this_canvas.stats.length; j++)
			        {
			        	if (this_canvas.stats[j].name == key)
			        	{
			        		var object_stat_div = document.getElementById(this_canvas.name + "_object_div_" + div_count + "_stat_" + stat_count);

			        		object_stat_div.style.left = this_canvas.object_div_style.stat_x + "px";
			        		object_stat_div.style.top = (((this_canvas.object_div_style.stat_height + this_canvas.object_div_style.stat_space) * stat_count) + this_canvas.object_div_style.stat_space) + this_canvas.object_div_style.height + "px";

							object_stat_div.style.color = this_canvas.object_div_style.stat_font_color;
							object_stat_div.style.fontFamily = this_canvas.object_div_style.stat_font_family;
							object_stat_div.style.fontSize = this_canvas.object_div_style.stat_font_size;

			        		object_stat_div.innerHTML = "<table style = 'vertical-align: middle' cellpadding = '0' cellspacing = '0'><td><img style = 'vertical-align: middle' src = '" + this_canvas.stats[j].image + "'></td><td>&nbsp;&nbsp;" + this_canvas.objects[i][key] + "</td></table>";

			        		stat_count++;
			        	}
			        }
			    }
			}

			for (var j = stat_count; j < 20; j++)
			{
				var object_stat_div = document.getElementById(this_canvas.name + "_object_div_" + div_count + "_stat_" + j);
				object_stat_div.innerHTML = "";
			}

			div_count++;
		}
	}

	for (i = div_count; i < this_canvas.object_div.length; i++)
	{
		if (this_canvas.object_div[i].main.parentElement != null)
			this_canvas.object_div[i].main.parentElement.removeChild(this_canvas.object_div[i].main);
	}

	this_canvas.div_container.style.width = (this_canvas.object_div_style.width + this_canvas.object_div_style.space + 25) + "px";

	if (div_count > 0)
	{
		this_canvas.div_container.style.height = (parseInt(this_canvas.object_div[div_count - 1].main.style.top) + parseInt(this_canvas.object_div[div_count - 1].main.style.height)) +  "px";
		open_object_div(this_canvas, this_canvas.object_div[0].main, 0);
	}
	else
	{
		object = null;
		this_canvas.div_container.style.height = "0px";
	}

	//this_canvas.div_container.style.overflowY = "scroll";	
}

open_object_div_id = function(this_canvas, this_id)
{
	for (j = 0; j < 50; j++)
	{
		if (document.getElementById(this_canvas.name + "_object_div_" + j) != null)
		{
			if (this_canvas.object_div[j].object_id.innerHTML == this_id)
			{
				if (document.getElementById(this_canvas.name + "_object_div_" + j).style.borderWidth == "0px")
					open_object_div(this_canvas, this_canvas.object_div[j].main, j);

				break;
			}
		}	
	}
}

open_object_div = function(this_canvas, this_div, this_num, select_flag)
{
	// reposition object divs before selected div
	if (this_num != 0 && document.getElementById(this_canvas.name + "_object_div_0").style.borderWidth == "1px")
	{
		document.getElementById(this_canvas.name + "_object_div_0").style.borderWidth = "0px";
		document.getElementById(this_canvas.name + "_object_div_0").style.height = this_canvas.object_div_style.height + "px";

		document.getElementById(this_canvas.name + "_object_div_0").style.left = this_canvas.object_div_style.space + "px";
		document.getElementById(this_canvas.name + "_object_div_0").style.top = this_canvas.object_div_style.space + "px";		
	}

	for (j = 1; j < this_num; j++)
	{
		document.getElementById(this_canvas.name + "_object_div_" + j).style.top = (parseInt(this_canvas.object_div[j - 1].main.style.top) + parseInt(this_canvas.object_div[j - 1].main.style.height)) + this_canvas.object_div_style.space + "px";
		
		if (document.getElementById(this_canvas.name + "_object_div_" + j).style.borderWidth == "1px")
		{
			document.getElementById(this_canvas.name + "_object_div_" + j).style.borderWidth = "0px";
			document.getElementById(this_canvas.name + "_object_div_" + j).style.height = this_canvas.object_div_style.height + "px";

			document.getElementById(this_canvas.name + "_object_div_" + j).style.left = this_div.style.left = this_canvas.object_div_style.space + "px";
			document.getElementById(this_canvas.name + "_object_div_" + j).style.top = parseInt(document.getElementById(this_canvas.name + "_object_div_" + j).style.top) + "px";
		}
	}

	if (parseInt(this_div.style.height) == this_canvas.object_div_style.height)
	{
		var stat_count = 0;

		for (var j = 0; j < 20; j++)
		{
			if (document.getElementById(this_canvas.name + "_object_div_" + this_num + "_stat_" + j).innerHTML != "")
				stat_count++;
		}
		
		this_div.style.height = parseInt(this_div.style.height) + ((this_canvas.object_div_style.stat_height + this_canvas.object_div_style.stat_space) * stat_count) + this_canvas.object_div_style.stat_space + "px";

		if (this_num > 0)
			this_div.style.top = (parseInt(this_canvas.object_div[this_num - 1].main.style.top) + parseInt(this_canvas.object_div[this_num - 1].main.style.height)) + this_canvas.object_div_style.space + "px";

		this_div.style.borderColor = this_canvas.object_div_style.border_color;
		this_div.style.borderWidth = "1px";

		// adjust position of object div to accomodate border
		this_div.style.left = this_canvas.object_div_style.space - 1 + "px";
		//this_div.style.top = parseInt(this_div.style.top) - 1 + "px";

		if (this_canvas.object_div_select != -1 && this_canvas.get_object(this_canvas.object_div_select).deselect_event != undefined)
			dispatchEvent(this_canvas.get_object(this_canvas.object_div_select).deselect_event);

		this_canvas.object_div_select = document.getElementById(this_canvas.name + "_object_div_" + this_num + "_object_id").innerHTML;
	}
	else
	{
		this_div.style.height = this_canvas.object_div_style.height + "px";

		if (this_num > 0)
			this_div.style.top = (parseInt(this_canvas.object_div[this_num - 1].main.style.top) + parseInt(this_canvas.object_div[this_num - 1].main.style.height)) + this_canvas.object_div_style.space + "px";

		this_div.style.borderWidth = "0px";

		// adjust position of object div with removed border
		this_div.style.left = this_canvas.object_div_style.space + "px";
		//this_div.style.top = parseInt(this_div.style.top) + 1 + "px";

		if (this_canvas.get_object(this_canvas.object_div_select).deselect_event != undefined)
			dispatchEvent(this_canvas.get_object(this_canvas.object_div_select).deselect_event);

		this_canvas.object_div_select = -1;
	}

	// reposition object divs after selected div
	for (j = this_num + 1; j < 50; j++)
	{
		if (document.getElementById(this_canvas.name + "_object_div_" + j) != null)
		{
			document.getElementById(this_canvas.name + "_object_div_" + j).style.top = (parseInt(this_canvas.object_div[j - 1].main.style.top) + parseInt(this_canvas.object_div[j - 1].main.style.height)) + this_canvas.object_div_style.space + "px";
			
			if (document.getElementById(this_canvas.name + "_object_div_" + j).style.borderWidth == "1px")
			{
				document.getElementById(this_canvas.name + "_object_div_" + j).style.borderWidth = "0px";
				document.getElementById(this_canvas.name + "_object_div_" + j).style.height = this_canvas.object_div_style.height + "px";

				document.getElementById(this_canvas.name + "_object_div_" + j).style.left = this_canvas.object_div_style.space + "px";
				document.getElementById(this_canvas.name + "_object_div_" + j).style.top = parseInt(document.getElementById(this_canvas.name + "_object_div_" + j).style.top) + "px";
			}
		}
	}

	// recalculate height of container div
	div_count = 0;

	for (j = 0; j < 50; j++)
		if (document.getElementById(this_canvas.name + "_object_div_" + j) != null)
			div_count++;

	this_canvas.div_container.style.height = (parseInt(this_canvas.object_div[div_count - 1].main.style.top) + parseInt(this_canvas.object_div[div_count - 1].main.style.height)) + 5 + "px";	

	// call select event for selected object
	object = this_canvas.objects[this_canvas.object_div_index[this_num]];

	if (object.select_event != undefined && this_canvas.object_div_select != -1)
		dispatchEvent(object.select_event);
}

map_mouseup = function(evt, this_canvas)
{
	clearInterval(this_canvas.count_interval);

	if (this_canvas.mouse_count < 15 && evt.button === 0)
	{
		display_object_divs(this_canvas, this_canvas.tile_x, this_canvas.tile_y);
	}
	else if (evt.button == 2)
	{
		dispatchEvent(right_click_event);
	}
}

map_mousemove = function(evt, this_canvas)
{
	if (this_canvas.mouse_down == 1)
	{
		this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) + (evt.pageX - this_canvas.old_x)) + "px";
		this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) + (evt.pageY - this_canvas.old_y)) + "px";

		this_canvas.old_x = evt.pageX;
		this_canvas.old_y = evt.pageY;

		if (parseInt(this_canvas.map_div.style.left) > this_canvas.lock_x1)
			this_canvas.map_div.style.left = this_canvas.lock_x1 + "px";

		if (parseInt(this_canvas.map_div.style.top) > this_canvas.lock_y1)
			this_canvas.map_div.style.top = this_canvas.lock_y1 + "px";

		if ((this_canvas.map_width * this_canvas.tile_width) > parseInt(this_canvas.game_width) && (parseInt(this_canvas.map_div.style.left) + parseInt(this_canvas.map_canvas.width)) - parseInt(this_canvas.game_width) < this_canvas.lock_x2)
			this_canvas.map_div.style.left = (-parseInt(this_canvas.map_div.width) + parseInt(this_canvas.game_width) + this_canvas.lock_x2) + "px";
		else if ((this_canvas.map_width * this_canvas.tile_width) < parseInt(this_canvas.game_width))
			this_canvas.map_div.style.left = this_canvas.lock_x1 + "px";

		if ((this_canvas.map_height * this_canvas.tile_height) > parseInt(this_canvas.game_height) && (parseInt(this_canvas.map_div.style.top) + parseInt(this_canvas.map_canvas.height)) - parseInt(this_canvas.game_height) < this_canvas.lock_y2)
			this_canvas.map_div.style.top = (-parseInt(this_canvas.map_div.height) + parseInt(this_canvas.game_height) + this_canvas.lock_y2) + "px";
		else if ((this_canvas.map_height * this_canvas.tile_height) < parseInt(this_canvas.game_height))
			this_canvas.map_div.style.top = this_canvas.lock_y1 + "px";
	}
	else
	{
		// retrieve the x/y coordinates of the mouse pointer relative to the map div
		var map_x = (evt.pageX / document.body.style.zoom) - parseInt(this_canvas.main_area.style.left) - parseInt(this_canvas.map_div.style.left);
		var map_y = (evt.pageY / document.body.style.zoom) - parseInt(this_canvas.main_area.style.top) - parseInt(this_canvas.map_div.style.top);

		// determine the tile that the mouse pointer is over
		this_canvas.tile_x = Math.floor(map_x / this_canvas.tile_width);
		this_canvas.tile_y = Math.floor(map_y / this_canvas.tile_height);

		// move the map marker to the tile that the mouse pointer is over
		this_canvas.map_marker.style.left = (this_canvas.tile_x * this_canvas.tile_width) + "px";
		this_canvas.map_marker.style.top = (this_canvas.tile_y * this_canvas.tile_width) + "px";
	}	
}

for_each_object = function(this_function)
{
	var old_object = object;

	for (var i = 0; i < game.objects.length; i++)
	{
		object = game.objects[i];

		// call function passed as parameter
		this_function();
	}

	display_object_divs(game, game.object_div_x, game.object_div_y);
	object = old_object;

	if (object.id != undefined)
		open_object_div_id(game, object.id);
}

do_game_loop = function(this_canvas)
{
	time_id = window.requestAnimationFrame(function()
		{
			do_game_loop(this_canvas);	
		})

    var time_now = Date.now();
    var elapsed = time_now - this_canvas.time_then;

    if (elapsed > this_canvas.fps_interval) 
    {
        this_canvas.time_then = time_now - (elapsed % this_canvas.fps_interval);

        this_canvas.readout_div.innerHTML = "";

        for (var i = 0; i < this_canvas.readout_messages.length; i++)
        {
        	this_canvas.readout_div.innerHTML = this_canvas.readout_div.innerHTML + this_canvas.readout_messages[i].message + "<br>";

        	this_canvas.readout_messages[i].time--;

        	if (this_canvas.readout_messages[i].time == 0)
        		this_canvas.readout_messages.pop();
        }

        if (this_canvas.action_counter > 0)
        {
        	this_action = this_canvas.action_data[0];

        	if (this_action.go_flag == false)
        	{
        		// create sprite
				this_action.image = document.createElement("img");
				this_action.image.id = this.name + "_action_0";
				this_action.image.style.position = "absolute";

				this_action.image.style.top = "-1000px";
				this_action.image.style.left = "-1000px";

				this_action.image.style.zIndex = this_action.z;

				this_action.image.src = this_action.sprite;

				this_action.image.onload = (function (this_canvas, this_action)
				{
					return function(evt)
					{
						this_action.image.style.left = (this_action.start_x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(evt.target.width)) / 2) + "px";
						this_action.image.style.top = (this_action.start_y * this_canvas.tile_height) + Math.floor((this_canvas.tile_height - parseInt(evt.target.height)) / 2) + "px";

						this_action.move_x = ((this_action.end_x * this_canvas.tile_width) - (this_action.start_x * this_canvas.tile_width)) / this_action.counter;
						this_action.move_y = ((this_action.end_y * this_canvas.tile_height) - (this_action.start_y * this_canvas.tile_height)) / this_action.counter;
					}
				}) (this_canvas, this_action);
				
				this_canvas.map_div.appendChild(this_action.image);

				this_canvas.add_readout_message(this_action.message, this_action.message_counter);

				this_action.go_flag = true;
        	}
        	else
        	{
        		this_action.image.style.left = (parseInt(this_action.image.style.left) + this_action.move_x) + "px";
        		this_action.image.style.top = (parseInt(this_action.image.style.top) + this_action.move_y) + "px";
        	}

        	this_canvas.action_counter--;

        	if (this_canvas.action_counter == 0)
        	{
        		// remove sprite
        		this_action.image.parentElement.removeChild(this_action.image);

        		this_canvas.action_data.shift();

        		if (this_canvas.action_data.length > 0)
        			this_canvas.action_counter = this_canvas.action_data[0].counter;
        	}
        }
        else
        {
        	do_movement_loop(this_canvas);
        }
    }
}

do_arcade_game_loop = function(this_canvas)
{
	time_id = window.requestAnimationFrame(function()
		{
			do_arcade_game_loop(this_canvas);	
		})

    var time_now = Date.now();
    var elapsed = time_now - this_canvas.time_then;

    if (elapsed > this_canvas.fps_interval) 
    {
        this_canvas.time_then = time_now - (elapsed % this_canvas.fps_interval);
        do_pre_move_event_loop(this_canvas);
        do_push_movement_loop(this_canvas);
    }
}

do_arcade_timeout_loop = function(this_canvas)
{
    //do_pre_move_event_loop(this_canvas);
    //do_push_movement_loop(this_canvas);
    radix1.do_screen_loop();
}

do_pre_move_event_loop = function(this_canvas)
{
	if (this_canvas.game_pre_move_function != undefined)
		this_canvas.game_pre_move_function();

	for (var i = 0; i < game.objects.length; i++)
	{
		object = game.objects[i];

		for (var j = 0; j < game.objects_pre_move_functions.length; j++)
			if (game.objects_pre_move_functions[j].name == object.name)
				game.objects_pre_move_functions[j].function();
	}
}

do_push_movement_loop = function(this_canvas)
{
	for (var i = 0; i < game.objects.length; i++)
	{
		object = game.objects[i];

		if (object.move_x != undefined)
		{
			this_canvas.move_element = document.getElementById(object.sprite_div_id);

			this_canvas.move_element.style.left = (parseInt(this_canvas.move_element.style.left) + object.move_x) + "px";
			this_canvas.move_element.style.top = (parseInt(this_canvas.move_element.style.top) + object.move_y) + "px";

			object.pixel_x = parseInt(this_canvas.move_element.style.left);
			object.pixel_y = parseInt(this_canvas.move_element.style.top);
			
			this_canvas.get_sprite(object.sprite_id).counter++;
			//console.log(this_canvas.get_sprite(object.sprite_id).tick);

			if (object.animate > 0 && this_canvas.get_sprite(object.sprite_id).counter % object.animate == 0)
			{
				this_image = document.getElementById(this_canvas.move_element.id + "_image");
				this_image.style.left = (parseInt(this_image.style.left) - parseInt(this_canvas.move_element.style.width)) + "px";

				this_canvas.get_sprite(object.sprite_id).frame++;

				if (parseInt(this_image.style.left) <= -(parseInt(this_canvas.move_element.style.width) * this_canvas.get_sprite(object.sprite_id).frames))
				{
					this_image.style.left = "0px";
					this_canvas.get_sprite(object.sprite_id).frame = 0;
				}
			}

			if (this_canvas.scroll_object == object.id)
			{
				var object_relative_x = parseInt(this_canvas.move_element.style.left) + parseInt(this_canvas.map_div.style.left);
				var object_relative_y = parseInt(this_canvas.move_element.style.top) + parseInt(this_canvas.map_div.style.top);

				if (object.move_x <= 0 && object_relative_x < ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) < 0)
					this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - (object_relative_x - ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x))) + "px";
				else if (object.move_x >= 0 && object_relative_x > ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) > (parseInt(this_canvas.game_width) - parseInt(this_canvas.map_div.width)))
					this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - (object_relative_x - ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x))) + "px";

				if (object.move_y < 0 && object_relative_y < ((parseInt(this_canvas.game_height) / 2) - this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) < 0)
					this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - object.move_y) + "px";
				else if (object.move_y > 0 && object_relative_y > ((parseInt(this_canvas.game_height) / 2) + this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) > (parseInt(this_canvas.game_height) - parseInt(this_canvas.map_div.height)))
					this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - object.move_y) + "px";
			}
		}
	}
}

do_movement_loop = function(this_canvas)
{
	if (this_canvas.move_counter > 0)
		this_canvas.move_counter--;
	else
		return;

	for (var i = 0; i < game.objects.length; i++)
	{
		object = game.objects[i];

		if (object.move_to_x != undefined)
		{
			this_canvas.move_element = document.getElementById(object.sprite_div_id);

			this_canvas.move_target_x = object.move_to_x;
			this_canvas.move_target_y = object.move_to_y;

			this_canvas.move_x = object.move_dir_x * this_canvas.move_speed;
			this_canvas.move_y = object.move_dir_y * this_canvas.move_speed;

			if (this_canvas.move_counter <= 0)
			{
				this_canvas.move_element.style.left = (this_canvas.move_target_x * this_canvas.tile_width) + Math.floor((this_canvas.tile_width - parseInt(this_canvas.move_element.style.width)) / 2)  + "px";
				this_canvas.move_element.style.top = (this_canvas.move_target_y * this_canvas.tile_height) + Math.floor((this_canvas.tile_height - parseInt(this_canvas.move_element.style.height)) / 2)  + "px";

				if (this_canvas.scroll_object = object.id)
				{
					var object_relative_x = parseInt(this_canvas.move_element.style.left) + parseInt(this_canvas.map_div.style.left);
					var object_relative_y = parseInt(this_canvas.move_element.style.top) + parseInt(this_canvas.map_div.style.top);

					if (this_canvas.move_x != 0 && object_relative_x < ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) < 0)
						this_canvas.map_div.style.left = (object_relative_x - parseInt(this_canvas.move_element.style.left)) + "px";
					else if (this_canvas.move_x > 0 && object_relative_x > ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) > (parseInt(this_canvas.game_width) - parseInt(this_canvas.map_div.width)))
						this_canvas.map_div.style.left = (object_relative_x - parseInt(this_canvas.move_element.style.left)) + "px";
					
					if (this_canvas.move_y < 0 && object_relative_y < ((parseInt(this_canvas.game_height) / 2) - this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) < 0)
						this_canvas.map_div.style.top = (object_relative_y - parseInt(this_canvas.move_element.style.top)) + "px";
					else if (this_canvas.move_y > 0 && object_relative_y > ((parseInt(this_canvas.game_height) / 2) + this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) > (parseInt(this_canvas.game_height) - parseInt(this_canvas.map_div.height)))
						this_canvas.map_div.style.top = (object_relative_y - parseInt(this_canvas.move_element.style.top)) + "px";
				}

				this_canvas.move_flag = -1;

				object.x = this_canvas.move_target_x;
				object.y = this_canvas.move_target_y;

				if (this.display_object_stats == true)
				{
					// store the object id because object.id will change after display_object_divs is called
					var old_object_id = object.id;

					display_object_divs(this_canvas, object.x, object.y);
					open_object_div_id(this_canvas, old_object_id);
				}

				object.move_to_x = undefined;
				object.move_to_y = undefined;
	
				if (end_move_event != undefined)
					dispatchEvent(end_move_event);
			}
			else
			{
				this_canvas.move_element.style.left = (parseInt(this_canvas.move_element.style.left) + this_canvas.move_x) + "px";
				this_canvas.move_element.style.top = (parseInt(this_canvas.move_element.style.top) + this_canvas.move_y) + "px";

				if (this_canvas.move_counter % this_canvas.get_sprite(object.sprite_id).tick == 0)
				{
					this_image = document.getElementById(this_canvas.move_element.id + "_image");
					this_image.style.left = (parseInt(this_image.style.left) - parseInt(this_canvas.move_element.style.width)) + "px";

					if (parseInt(this_image.style.left) <= -(parseInt(this_canvas.move_element.style.width) * this_canvas.get_sprite(object.sprite_id).frames))
						this_image.style.left = "0px";
				}

				if (this_canvas.scroll_object = object.id)
				{
					var object_relative_x = parseInt(this_canvas.move_element.style.left) + parseInt(this_canvas.map_div.style.left);
					var object_relative_y = parseInt(this_canvas.move_element.style.top) + parseInt(this_canvas.map_div.style.top);

					if (this_canvas.move_x < 0 && object_relative_x < ((parseInt(this_canvas.game_width) / 2) - this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) < 0)
						this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - this_canvas.move_x) + "px";
					else if (this_canvas.move_x > 0 && object_relative_x > ((parseInt(this_canvas.game_width) / 2) + this_canvas.scroll_buffer_x) && parseInt(this_canvas.map_div.style.left) > (parseInt(this_canvas.game_width) - parseInt(this_canvas.map_div.width)))
						this_canvas.map_div.style.left = (parseInt(this_canvas.map_div.style.left) - this_canvas.move_x) + "px";

					if (this_canvas.move_y < 0 && object_relative_y < ((parseInt(this_canvas.game_height) / 2) - this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) < 0)
						this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - this_canvas.move_y) + "px";
					else if (this_canvas.move_y > 0 && object_relative_y > ((parseInt(this_canvas.game_height) / 2) + this_canvas.scroll_buffer_y) && parseInt(this_canvas.map_div.style.top) > (parseInt(this_canvas.game_height) - parseInt(this_canvas.map_div.height)))
						this_canvas.map_div.style.top = (parseInt(this_canvas.map_div.style.top) - this_canvas.move_y) + "px";
				}
			}			
		}
	}
}

// code borrowed from https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}
