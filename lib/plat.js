// global variables
map = null;

// function to create "map" object
function start_plat()
{
	map = new plat_map("map");
}

function plat_map(this_name)
{
	// string array
	this.string_array = new Array();

	// random number seed
	this.random_seed = 2400;

	this.add_string = function(this_string)
	{
		//for (var i = 0; i < this.string_array.length; i++)
		//	if (this.string_array[i].tile == this_string.tile)
		//		break;

		this.string_array[this.string_array.length] = this_string;

		//console.log(JSON.stringify(this.string_array));
	}

	this.get_string_from_tile = function(this_tile, this_string)
	{
		for (var i = 0; i < this_tile.length; i++)
		{
			for (var j = 0; j < this.string_array.length; j++)
				if (this.string_array[j].tile == this_tile[i] && this.string_array[j].string == this_string)
					return this.string_array[j];
		}

		return undefined;
	}

	this.get_string_name_from_tile = function(this_tile)
	{
		for (var i = 0; i < this.string_array.length; i++)
			if (this.string_array[i].tile == this_tile)
				return this.string_array[i].string;

		return undefined;
	}

	this.get_tile = function(this_string, this_direction, this_tile)
	{
		var this_correct = new Array();
		//console.log(this_direction);

		for (var i = 0; i < this_direction.length; i++)
		{
			this_correct[i] = false;
			
			for (var j = 0; j < this.string_array.length; j++)
			{
				if (this.string_array[j].string == this_direction[i].string && this.string_array[j].direction != null && this_direction[i].directions.length > 0)
				{
					string_direction = this.string_array[j].direction.split(",");

					if (this.get_string_from_tile(this_tile) == undefined)
						var terrain = this_tile;
					else
						var terrain = this.get_string_from_tile(this_tile).terrain;

					if (compare_arrays(string_direction, this_direction[i].directions) && element_in_array(terrain, this.string_array[j].terrain))
						this_correct[i] = j;
				}
				else if (this.string_array[j].string == this_direction[i].string && this.string_array[j].direction == null && this_direction[i].directions.length == 0)
				{
					this_correct[i] = j;
				}
			}
		}

		if (this_direction.length == 1 && this_direction[0].string == this_string)
		{
			if (this.string_array[this_correct[0]] != undefined)
				return this.string_array[this_correct[0]].tile;
			else
				return undefined;
		}
		else
		{
			//console.log(this_direction);

			var string_north = undefined;
			var string_south = undefined;
			var string_east = undefined;
			var string_west = undefined;

			for (var i = 0; i < this_direction.length; i++)
			{
				if (element_in_array("n", this_direction[i].directions))
					var string_north = this_direction[i].string;
				if (element_in_array("s", this_direction[i].directions))
					var string_south = this_direction[i].string;
				if (element_in_array("e", this_direction[i].directions))
					var string_east = this_direction[i].string;
				if (element_in_array("w", this_direction[i].directions))
					var string_west = this_direction[i].string;
			}

			for (var i = 0; i < this.string_array.length; i++)
			{
				if (this.string_array[i].string == "intersection")
				{
					if (this.string_array[i].string_north == string_north && this.string_array[i].string_south == string_south && this.string_array[i].string_east == string_east && this.string_array[i].string_west == string_west)
						return this.string_array[i].tile;
				}
			}

			return this.string_array[this_correct[0]].tile;
		}
	}

	this.map_string_tile = function(this_game, this_tile_string, this_x, this_y, this_root)
	{
		var this_map_directions = new Array();

		this_map_directions[0] = {};
		this_map_directions[0].string = this_tile_string;
		this_map_directions[0].directions = new Array();

		// call the check_direction sub-function (see below) for all four compass directions
		if (this_y > 0)
			this.check_direction(this_game, this_x, this_y - 1, "n", this_map_directions);
		else
			this.add_direction(this_game, this_tile_string, "n", this_map_directions);

		if (this_x < game.map_width - 1)
			this.check_direction(this_game, this_x + 1, this_y, "e", this_map_directions);
		else
			this.add_direction(this_game, this_tile_string, "e", this_map_directions);

		if (this_y < game.map_height - 1)
			this.check_direction(this_game, this_x, this_y + 1, "s", this_map_directions);
		else
			this.add_direction(this_game, this_tile_string, "s", this_map_directions);

		if (this_x > 0)
			this.check_direction(this_game, this_x - 1, this_y, "w", this_map_directions);
		else
			this.add_direction(this_game, this_tile_string, "w", this_map_directions);

		var this_map_tile = new Array();
		this_map_tile[0] = this.get_tile(this_tile_string, this_map_directions, game.get_map_tile_at_xy(this_x, this_y));

		var this_map_tile_string = this.get_string_from_tile(this_map_tile, this_tile_string);

		if (this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x, this_y), this_tile_string) != undefined)
			game.remove_tile(this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x, this_y), this_tile_string).tile, this_x, this_y);

		game.map_tile(this_map_tile[0], this_x, this_y);

		if (this_root == true)
		{
			for (var i = 0; i < this_map_directions.length; i++)
			{
				if (element_in_array("n", this_map_directions[i].directions) && element_in_array("n", this_map_tile_string.direction.split(",")) && this_y > 0)
					this.map_string_tile(this_game, this_map_directions[i].string, this_x, this_y - 1, false);

				if (element_in_array("e", this_map_directions[i].directions) && element_in_array("e", this_map_tile_string.direction.split(",")) && this_x < game.map_width - 1)
					this.map_string_tile(this_game, this_map_directions[i].string, this_x + 1, this_y, false);

				if (element_in_array("s", this_map_directions[i].directions) && element_in_array("s", this_map_tile_string.direction.split(",")) && this_y < game.map_height - 1)
					this.map_string_tile(this_game, this_map_directions[i].string, this_x, this_y + 1, false);

				if (element_in_array("w", this_map_directions[i].directions) && element_in_array("w", this_map_tile_string.direction.split(",")) && this_x > 0)
					this.map_string_tile(this_game, this_map_directions[i].string, this_x - 1, this_y, false);
			}
		}
	}

	// this is a sub-function that connects to the function above
	this.check_direction = function(this_game, this_x, this_y, this_direction, this_map_directions)
	{
		var this_tile = game.get_map_tile_at_xy(this_x, this_y);
		var this_string = this.get_string_from_tile(this_tile, this_map_directions[0].string);

		if (this_string != undefined)
		{
			if (this_string.string != "intersection")
				this_string_string = this_string.string;
			else
			{
				this_string_string = this_string[this_direction];
			}

			for (var i = 0; i < this_map_directions.length; i++)
				if (this_map_directions[i].string == this_string_string)
					break;

			if (i == 0)
				valid_direction = true;
			else
			{
				valid_direction = false;

				if (this_direction == "n" && this_string.direction != null && element_in_array("s", this_string.direction.split(",")))
					valid_direction = true;
				else if (this_direction == "s" && this_string.direction != null && element_in_array("n", this_string.direction.split(",")))
					valid_direction = true;
				else if (this_direction == "e" && this_string.direction != null && element_in_array("w", this_string.direction.split(",")))
					valid_direction = true;
				else if (this_direction == "w" && this_string.direction != null && element_in_array("e", this_string.direction.split(",")))
					valid_direction = true;
			}

			if (valid_direction == true)
			{
				if (i == this_map_directions.length)
				{
					this_map_directions[i] = {};
					this_map_directions[i].string = this_string_string;
					this_map_directions[i].directions = new Array();
				}

				this_map_directions[i].directions[this_map_directions[i].directions.length] = this_direction;
			}
		}		
	}

	// this is a sub-function that connects to the function above
	this.add_direction = function(this_game, this_tile_string, this_direction, this_map_directions)
	{
		for (var i = 0; i < this_map_directions.length; i++)
			if (this_map_directions[i].string == this_tile_string)
				break;

		if (i == this_map_directions.length)
		{
			this_map_directions[i] = {};
			this_map_directions[i].string = this_tile_string;
			this_map_directions[i].directions = new Array();
		}

		this_map_directions[i].directions[this_map_directions[i].directions.length] = this_direction;
	}

	this.draw_string_to_edge = function(this_game, this_data)
	{
		var this_x = this_data.start_x;
		var this_y = this_data.start_y;
		var this_string = this_data.string;
		var end_river = false;

		this.map_string_tile(this_game, this_string, this_x, this_y, true);

		while (end_river == false)
		{
			var valid_direction = false;
			var tries = 0;

			while (valid_direction == false && tries < 100)
			{
				var next_number = Math.floor(this.random_number(100));
				var next_direction = "";

				if (next_number < this_data.n)
					next_direction = "n";
				else if (next_number < this_data.n + this_data.e)
					next_direction = "e";
				else if (next_number < this_data.n + this_data.e + this_data.s)
					next_direction = "s";
				else if (next_number < this_data.n + this_data.e + this_data.s + this_data.w)
					next_direction = "w";

				//console.log(next_number + " " + next_direction);

				if (next_direction == "n" && this_y > 0 && (this_x > 0 && this_x < this_game.map_width - 1))
				{
					var this_tile = game.get_map_tile_at_xy(this_x, this_y - 1)
					var this_valid_count = this_tile.length;

					for (var i = 0; i < this_tile.length; i++)
					{
						this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
						if (this_terrain != -1 && element_in_array("n", this_data.directions[this_terrain].split(",")))
							this_valid_count--;
					}

					if (this.count_string(this_game, this_x, this_y - 1, this_string, "n") == 1 && this_valid_count == 0)
						valid_direction = true;
				}
				else if (next_direction == "e" && this_x < this_game.map_width - 1 && (this_y > 0 && this_y < this_game.map_height - 1))
				{
					var this_tile = game.get_map_tile_at_xy(this_x + 1, this_y)
					var this_valid_count = this_tile.length;

					for (var i = 0; i < this_tile.length; i++)
					{
						this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
						if (this_terrain != -1 && element_in_array("e", this_data.directions[this_terrain].split(",")))
							this_valid_count--;
					}

					if (this.count_string(this_game, this_x + 1, this_y, this_string, "e") == 1 && this_valid_count == 0)
						valid_direction = true;
				}
				else if (next_direction == "s" && this_y < this_game.map_height - 1 && (this_x > 0 && this_x < this_game.map_width - 1))
				{
					var this_tile = game.get_map_tile_at_xy(this_x, this_y + 1)
					var this_valid_count = this_tile.length;

					for (var i = 0; i < this_tile.length; i++)
					{
						this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
						if (this_terrain != -1 && element_in_array("s", this_data.directions[this_terrain].split(",")))
							this_valid_count--;
					}

					if (this.count_string(this_game, this_x, this_y + 1, this_string, "s") == 1 && this_valid_count == 0)
						valid_direction = true;
				}
				else if (next_direction == "w" && this_x > 0 && (this_y > 0 && this_y < this_game.map_height - 1))
				{
					var this_tile = game.get_map_tile_at_xy(this_x - 1, this_y)
					var this_valid_count = this_tile.length;

					for (var i = 0; i < this_tile.length; i++)
					{
						this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
						if (this_terrain != -1 && element_in_array("w", this_data.directions[this_terrain].split(",")))
							this_valid_count--;
					}

					if (this.count_string(this_game, this_x - 1, this_y, this_string, "s") == 1 && this_valid_count == 0)
						valid_direction = true;
				}

				tries++;
			}
		
			if (valid_direction == false)
				next_direction = "";

			if (next_direction != "")
			{
				if (next_direction == "n")
				{
					if (this.random_number(100) < this_data.branch)
					{
						if (Math.floor(this.random_number(2)) == 1)
						{
							var new_x = this_x - 1;
							var new_dir = "e";
						}
						else
						{
							var new_x = this_x + 1;
							var new_dir = "w";
						}

						var this_tile = game.get_map_tile_at_xy(new_x, this_y)
						var this_valid_count = this_tile.length;

						for (var i = 0; i < this_tile.length; i++)
						{
							this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
							if (this_terrain != -1 && element_in_array("n", this_data.directions[this_terrain].split(",")))
								this_valid_count--;
						}

						if (this.count_string(this_game, new_x, this_y, this_string, new_dir) == 1 && this_valid_count == 0)
						{
							var new_data = JSON.parse(JSON.stringify(this_data));
							new_data.start_x = new_x;
							new_data.start_y = this_y;
							this.draw_string_to_edge(this_game, new_data);						 
						}
					}

					this_y--;
				}
				else if (next_direction == "e")
				{
					if (this.random_number(100) < this_data.branch)
					{
						if (Math.floor(this.random_number(2)) == 1)
						{
							var new_y = this_y - 1;
							var new_dir = "s";
						}
						else
						{
							var new_y = this_y + 1;
							var new_dir = "n";
						}

						var this_tile = game.get_map_tile_at_xy(this_x, new_y)
						var this_valid_count = this_tile.length;

						for (var i = 0; i < this_tile.length; i++)
						{
							this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
							if (this_terrain != -1 && element_in_array("e", this_data.directions[this_terrain].split(",")))
								this_valid_count--;
						}

						if (this.count_string(this_game, this_x, new_y, this_string, new_dir) == 1 && this_valid_count == 0)
						{
							var new_data = JSON.parse(JSON.stringify(this_data));
							new_data.start_x = this_x;
							new_data.start_y = new_y;
							this.draw_string_to_edge(this_game, new_data);						 
						}
					}

					this_x++;
				}
				else if (next_direction == "s")
				{
					if (this.random_number(100) < this_data.branch)
					{
						if (Math.floor(this.random_number(2)) == 1)
						{
							var new_x = this_x - 1;
							var new_dir = "e";
						}
						else
						{
							var new_x = this_x + 1;
							var new_dir = "w";
						}

						var this_tile = game.get_map_tile_at_xy(new_x, this_y)
						var this_valid_count = this_tile.length;

						for (var i = 0; i < this_tile.length; i++)
						{
							this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
							if (this_terrain != -1 && element_in_array("s", this_data.directions[this_terrain].split(",")))
								this_valid_count--;
						}

						if (this.count_string(this_game, new_x, this_y, this_string, new_dir) == 1 && this_valid_count == 0)
						{
							var new_data = JSON.parse(JSON.stringify(this_data));
							new_data.start_x = new_x;
							new_data.start_y = this_y;
							this.draw_string_to_edge(this_game, new_data);						 
						}
					}

					this_y++;
				}
				else if (next_direction == "w")
				{
					if (this.random_number(100) < this_data.branch)
					{
						if (Math.floor(this.random_number(2)) == 1)
						{
							var new_y = this_y - 1;
							var new_dir = "s";
						}
						else
						{
							var new_y = this_y + 1;
							var new_dir = "n";
						}

						var this_tile = game.get_map_tile_at_xy(this_x, new_y)
						var this_valid_count = this_tile.length;

						for (var i = 0; i < this_tile.length; i++)
						{
							this_terrain = element_in_array_index(this_tile[i], this_data.terrain);						
							if (this_terrain != -1 && element_in_array("w", this_data.directions[this_terrain].split(",")))
								this_valid_count--;
						}

						if (this.count_string(this_game, this_x, new_y, this_string, new_dir) == 1 && this_valid_count == 0)
						{
							var new_data = JSON.parse(JSON.stringify(this_data));
							new_data.start_x = this_x;
							new_data.start_y = new_y;
							this.draw_string_to_edge(this_game, new_data);						 
						}
					}

					this_x--;
				}

				this.map_string_tile(this_game, this_string, this_x, this_y, true);
			}

			if (this_x == 0 || this_y == 0 || this_x == this_game.map_width - 1 || this_y == this_game.map_height - 1 || next_direction == "")
				end_river = true;
		}
	}

	this.count_string = function(this_game, this_x, this_y, this_string, this_direction)
	{
		var total_count = 0

		if (this_y > 0)
		{
			if (this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x, this_y - 1), this_string) != undefined)
				total_count++;
		}

		if (this_x < this_game.map_width - 1)
		{
			if (this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x + 1, this_y), this_string) != undefined)
				total_count++;
		}

		if (this_y < this_game.map_height - 1)
		{
			if (this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x, this_y + 1), this_string) != undefined)
				total_count++;
		}

		if (this_x > 0)
		{
			if (this.get_string_from_tile(this_game.get_map_tile_at_xy(this_x - 1, this_y), this_string) != undefined)
				total_count++;
		}

		return total_count;
	}


	this.patch_string_tile = function(this_game, this_tile_string, this_x, this_y)
	{
		var this_map_directions = new Array();

		this_map_directions[0] = {};
		this_map_directions[0].string = this_tile_string;
		this_map_directions[0].directions = "n,s,e,w".split(",");

		game.map_tile(this.get_tile(this_tile_string, this_map_directions, game.get_map_tile_at_xy(this_x, this_y)), this_x, this_y);
	}

	this.patch_string_cell = function(this_game, this_depth, this_data)
	{
		this.patch_string_tile(this_game, this_data.string, this_data.x, this_data.y);

		if (this_data.y > 0 && game.get_map_tile_at_xy(this_data.x, this_data.y - 1).length == 1 && element_in_array(game.get_map_tile_at_xy(this_data.x, this_data.y - 1), this_data.terrain))
		{
			this.patch_string_tile(this_game, this_data.string, this_data.x, this_data.y - 1);

			var this_num = Math.floor(this.random_number(100));
			if (this_num < this_data.n - (this_depth * this_data.decrease))
			{
				this_data.y--;
				this.patch_string_cell(this_game, this_depth + 1, this_data);
				this_data.y++;
			}
		}

		if (this_data.y < this_game.map_height - 1 && game.get_map_tile_at_xy(this_data.x, this_data.y + 1).length == 1 && element_in_array(game.get_map_tile_at_xy(this_data.x, this_data.y + 1), this_data.terrain))
		{
			this.patch_string_tile(this_game, this_data.string, this_data.x, this_data.y + 1);

			var this_num = Math.floor(this.random_number(100));

			if (this_num < this_data.s - (this_depth * this_data.decrease))
			{
				this_data.y++;
				this.patch_string_cell(this_game, this_depth + 1, this_data);
				this_data.y--;
			}
		}

		if (this_data.x < this_game.map_width - 1 && game.get_map_tile_at_xy(this_data.x + 1, this_data.y).length == 1 && element_in_array(game.get_map_tile_at_xy(this_data.x + 1, this_data.y), this_data.terrain))
		{
			this.patch_string_tile(this_game, this_data.string, this_data.x + 1, this_data.y);

			var this_num = Math.floor(this.random_number(100));
			if (this_num < this_data.e - (this_depth * this_data.decrease))
			{
				this_data.x++;
				this.patch_string_cell(this_game, this_depth + 1, this_data);
				this_data.x--;
			}
		}

		if (this_data.x > 0 && game.get_map_tile_at_xy(this_data.x - 1, this_data.y).length == 1 && element_in_array(game.get_map_tile_at_xy(this_data.x - 1, this_data.y), this_data.terrain))
		{
			this.patch_string_tile(this_game, this_data.string, this_data.x - 1, this_data.y);

			var this_num = Math.floor(this.random_number(100));
			if (this_num < this_data.w - (this_depth * this_data.decrease))
			{
				this_data.x--;
				this.patch_string_cell(this_game, this_depth + 1, this_data);
				this_data.x++;
			}
		}
	}

	this.count_string_sector = function(this_game, this_width, this_height, this_x, this_y, this_string)
	{
		var this_string_count = 0;

		var this_sector_width = Math.round(this_game.map_width / this_width);
		var this_sector_height = Math.round(this_game.map_height / this_height);

		var this_sector_x = this_sector_width * this_x;
		var this_sector_y = this_sector_height * this_y;

		for (var i = this_sector_x; i < this_sector_x + this_sector_width && i < this_game.map_width; i++)
		{
			for (var j = this_sector_y; j < this_sector_y + this_sector_height && j < this_game.map_height; j++)
			{
				this_tile = this_game.get_map_tile_at_xy(i, j);

				for (var k = 0; k < this_string.length; k++)
				{
					if (this.get_string_from_tile(this_tile, this_string[k]) != undefined)
						this_string_count++;	
				}
			}		
		}	

		return this_string_count;
	}

	this.build_sector_count = function(this_game, this_width, this_height, this_string)
	{
		var this_string_count = new Array();

		for (var i = 0; i < this_width; i++)
		{
			for (var j = 0; j < this_height; j++)
			{
				var index = this_string_count.length;

				this_string_count[index] = {};
				this_string_count[index].x = i;
				this_string_count[index].y = j;
				this_string_count[index].count = this.count_string_sector(this_game, this_width, this_height, i, j, this_string);
			}
		}

		return this_string_count;
	}

	this.find_lowest_sector_random = function(this_game, this_width, this_height, this_string)
	{
		var sector_count = this.build_sector_count(this_game, this_width, this_height, this_string);
		var candidates = new Array();

		var candidates_lowest = 10000;
		var candidates_index = 0;

		for (var i = 0; i < this_width; i++)
		{
			for (var j = 0; j < this_height; j++)
			{
				if (sector_count[candidates_index].count <= candidates_lowest)
					candidates_lowest = sector_count[candidates_index].count;

				candidates_index++;
			}
		}

		candidates_index = 0;

		for (var i = 0; i < this_width; i++)
		{
			for (var j = 0; j < this_height; j++)
			{
				if (sector_count[candidates_index].count == candidates_lowest)
					candidates[candidates.length] = candidates_index;

				candidates_index++;
			}
		}

		var candidate_choice = Math.floor(this.random_number(candidates.length));
		return sector_count[candidates[candidate_choice]];
	}

	this.find_lowest_edge_random = function(this_game, this_width, this_height, this_string)
	{
		var sector_count = this.build_sector_count(this_game, this_width, this_height, this_string);
		var candidates = new Array();

		var candidates_lowest = 10000;
		var candidates_index = 0;

		for (var i = 0; i < this_width; i++)
		{
			for (var j = 0; j < this_height; j++)
			{
				if (j == 0 || j == this_height - 1 || i == 0 || i == this_width - 1)
					if (sector_count[candidates_index].count <= candidates_lowest)
						candidates_lowest = sector_count[candidates_index].count;

				candidates_index++;
			}
		}

		candidates_index = 0;

		for (var i = 0; i < this_width; i++)
		{
			for (var j = 0; j < this_height; j++)
			{
				if (j == 0 || j == this_height - 1 || i == 0 || i == this_width - 1)
					if (sector_count[candidates_index].count == candidates_lowest)
						candidates[candidates.length] = candidates_index;

				candidates_index++;
			}
		}

		var candidate_choice = Math.floor(this.random_number(candidates.length));
		return sector_count[candidates[candidate_choice]];
	}

	this.plot_string_sector_edge = function(this_game, this_data)
	{
		var this_sector_width = Math.round(this_game.map_width / this_data.sector_width);
		var this_sector_height = Math.round(this_game.map_height / this_data.sector_height);

		var lowest_edge = this.find_lowest_edge_random(this_game, this_data.sector_width, this_data.sector_height, this_data.count);
		//console.log(lowest_edge);

		if (lowest_edge.x == 0)
		{
			var start_y = (lowest_edge.y * this_sector_height) + (Math.floor(this.random_number(this_sector_height)));

			if (start_y >= this_game.map_height)
				start_y = this_game.map_height - 1;

			this.draw_string_to_edge(this_game, {
				"start_x": 0,
				"start_y": start_y,
				"string": this_data.string,
				"terrain": this_data.terrain,
				"directions": this_data.directions,
				"n": this_data.left,
				"w": this_data.back,
				"e": this_data.forward,
				"s": this_data.right,
				"branch": this_data.branch
			});
		}
		else if (lowest_edge.x == this_data.sector_width - 1)
		{
			var start_y = (lowest_edge.y * this_sector_height) + (Math.floor(this.random_number(this_sector_height)));

			if (start_y >= this_game.map_height)
				start_y = this_game.map_height - 1;

			this.draw_string_to_edge(this_game, {
				"start_x": this_game.map_width - 1,
				"start_y": start_y,
				"string": this_data.string,
				"terrain": this_data.terrain,
				"directions": this_data.directions,
				"n": this_data.right,
				"w": this_data.forward,
				"e": this_data.back,
				"s": this_data.left,
				"branch": this_data.branch
			});
		}
		else if (lowest_edge.y == this_data.sector_height - 1)
		{
			var start_x = (lowest_edge.x * this_sector_width) + (Math.floor(this.random_number(this_sector_width)));

			if (start_x >= this_game.map_width)
				start_x = this_game.map_width - 1;

			this.draw_string_to_edge(this_game, {
				"start_x": start_x,
				"start_y": this_game.map_height - 1,
				"string": this_data.string,
				"terrain": this_data.terrain,
				"directions": this_data.directions,
				"n": this_data.forward,
				"s": this_data.back,
				"e": this_data.right,
				"w": this_data.left,
				"branch": this_data.branch
			});
		}
	}

	this.patch_string_sector = function(this_game, this_data)
	{
		var this_sector_width = Math.round(this_game.map_width / this_data.sector_width);
		var this_sector_height = Math.round(this_game.map_height / this_data.sector_height);

		var lowest_sector = this.find_lowest_sector_random(this_game, this_data.sector_width, this_data.sector_height, this_data.count);
		var start_x = (lowest_sector.x * this_sector_width) + (Math.floor(this.random_number(this_sector_width)));

		if (start_x >= this_game.map_width)
			start_x = this_game.map_width - 1;

		var start_y = (lowest_sector.y * this_sector_height) + (Math.floor(this.random_number(this_sector_height)));

		if (start_y >= this_game.map_height)
			start_y = this_game.map_height - 1;

		map.patch_string_cell(game, 0, {
			"string": this_data.string,
			"x": start_x,
			"y": start_y,
			"terrain": this_data.terrain,
			"n": this_data.n,
			"s": this_data.s,
			"e": this_data.e,
			"w": this_data.w,
			"decrease": this_data.decrease
		});
	}

	this.draw_border = function(this_game, this_tile)
	{
		for (var i = 0; i < this_game.map_width; i++)
		{
			this_game.map_tile(this_tile, i, 0);
			this_game.map_tile(this_tile, i, this_game.map_height - 1);
		}

		for (var i = 1; i < this_game.map_height - 1; i++)
		{
			this_game.map_tile(this_tile, 0, i);
			this_game.map_tile(this_tile, this_game.map_width - 1, i);
		}
	}

	this.check_clear_area = function(this_game, this_x1, this_y1, this_x2, this_y2, this_floor)
	{
		for (var i = this_x1; i <= this_x2; i++)
		{
			for (var j = this_y1; j <= this_y2; j++)
			{
				if (compare_arrays(this_game.get_map_tile_at_xy(i, j), this_floor) == false)
					return false;
			}
		}

		return true;
	}

	this.draw_rectangle = function(this_game, this_x1, this_y1, this_x2, this_y2, this_border, this_floor)
	{
		for (var i = this_x1; i <= this_x2; i++)
		{
			for (var j = this_y1; j <= this_y2; j++)
			{
				if (i == this_x1 || i == this_x2 || j == this_y1 || j == this_y2)
					this_game.map_tile(this_border, i, j);
				else
					this_game.map_tile(this_floor, i ,j);
			}
		}		
	}


	// random function borrowed from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
	this.random_number = function(this_random_max)
	{
		var x = Math.sin(this.random_seed++) * 10000;
	    return (x - Math.floor(x)) * this_random_max;
	}
}

compare_arrays = function(array1, array2)
{
	var arrays_equal = true;

	if (array1.length != array2.length)
		return false;

	for (var i = 0; i < array1.length; i++)
	{
		var sub_array_equal = false;

		for (var j = 0; j < array2.length; j++)
		{
			if (array1[i] == array2[j])
				sub_array_equal = true;
		}

		if (sub_array_equal == false)
			arrays_equal = false;
	}

	return arrays_equal;
}

element_in_array = function(element, array1)
{
	if (typeof(element) === "string" )
	{
		for (var i = 0; i < array1.length; i++)
			if (array1[i] == element)
				return true;

		return false;
	}
	else
	{
		array1 = element;
		array2 = array1;

		var arrays_equal = true;

		for (var i = 0; i < array1.length; i++)
		{
			var sub_array_equal = false;

			for (var j = 0; j < array2.length; j++)
			{
				if (array1[i] == array2[j])
					sub_array_equal = true;
			}

			if (sub_array_equal == false)
				arrays_equal = false;
		}

		return arrays_equal;		
	}
}

element_in_array_index = function(element, array1)
{
	for (var i = 0; i < array1.length; i++)
		if (array1[i] == element)
			return i;

	return -1;
}
