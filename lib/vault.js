do_gravity = function(this_object, this_gravity, this_max)
{
	this_object.move_y += this_gravity;

	if (this_object.move_y > this_max)
		this_object.move_y = this_max;
}

check_tiles = function(this_object, step_tolerance)
{
	var collision_directions = new Array();

	if (this_object.move_x < 0)
	{
		var this_x = this_object.pixel_x + this_object.move_x;
		var this_y = this_object.pixel_y + game.get_sprite(this_object.sprite_id).height - 1;

		var this_tiles_x1 = game.get_map_tile_at_pixel_xy(this_x, this_y);

		if (game.get_tile_movement(this_tiles_x1) == -1)
		{
			for (var i = 0; i < this_tiles_x1.length; i++)
			{
				if (game.get_tile_movement([this_tiles_x1[i]]) == -1 && game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(this_x - (Math.floor(this_x / game.tile_width) * game.tile_width), this_y - (Math.floor(this_y / game.tile_height) * game.tile_height), 1, 1).data[3] != 0)
				{
					k = 0;

					while (game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(this_x - (Math.floor(this_x / game.tile_width) * game.tile_width), k, 1, 1).data[3] == 0 && k < game.tile_height)
						k++;

					this_gap = (this_y - (Math.floor(this_y / game.tile_height) * game.tile_height)) - k;

					if (this_gap <= step_tolerance)
					{
						game.set_object_pixel_y(object, (Math.floor(this_y / game.tile_height) * game.tile_height) - game.get_sprite(this_object.sprite_id).height + k);
					}
					else
					{
						this_object.move_x = 0;
						this_object.animate = 0;
					}				
				}
			}
		}
	}

	if (this_object.move_x > 0)
	{
		var this_x = this_object.pixel_x + game.get_sprite(this_object.sprite_id).width + this_object.move_x;
		var this_y = this_object.pixel_y + game.get_sprite(this_object.sprite_id).height - 1;

		var this_tiles_x1 = game.get_map_tile_at_pixel_xy(this_x, this_y);

		if (game.get_tile_movement(this_tiles_x1) == -1) 
		{
			for (var i = 0; i < this_tiles_x1.length; i++)
			{
				if (game.get_tile_movement([this_tiles_x1[i]]) == -1 && game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(this_x - (Math.floor(this_x / game.tile_width) * game.tile_width), this_y - (Math.floor(this_y / game.tile_height) * game.tile_height), 1, 1).data[3] != 0)
				{
					k = 0;

					while (game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(this_x - (Math.floor(this_x / game.tile_width) * game.tile_width), k, 1, 1).data[3] == 0 && k < game.tile_height)
						k++;

					this_gap = (this_y - (Math.floor(this_y / game.tile_height) * game.tile_height)) - k;

					if (this_gap <= step_tolerance)
					{
						game.set_object_pixel_y(object, (Math.floor(this_y / game.tile_height) * game.tile_height) - game.get_sprite(this_object.sprite_id).height + k);
					}
					else
					{
						this_object.move_x = 0;
						this_object.animate = 0;
					}				
				}
			}
		}
	}

	var this_y = this_object.pixel_y + game.get_sprite(this_object.sprite_id).height + this_object.move_y;
	var this_x2 = this_object.pixel_x + game.get_sprite(this_object.sprite_id).width;

	var this_tiles_x1 = game.get_map_tile_at_pixel_xy(this_object.pixel_x, this_y);
	var this_tiles_x2 = game.get_map_tile_at_pixel_xy(this_x2, this_y);

	if (game.get_tile_movement(this_tiles_x1) == -1 || game.get_tile_movement(this_tiles_x2) == -1)
	{
		var set_y = 100000;

		for (var i = 0; i < this_tiles_x1.length; i++)
		{
			if (game.get_tile_movement([this_tiles_x1[i]]) == -1 && game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(this_object.pixel_x - (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width), this_y - (Math.floor(this_y / game.tile_height) * game.tile_height), 1, 1).data[3] != 0)
			{
				for (var j = this_object.pixel_x; j < this_object.pixel_x + game.get_sprite(this_object.sprite_id).width; j += 2)
				{
					if (j >= (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width) && j < (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width) + game.tile_width)
					{
						k = 0;

						while (game.get_tile_canvas(this_tiles_x1[i]).getContext("2d").getImageData(j - (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width), k, 1, 1).data[3] == 0 && k < game.tile_height)
							k++;

						if (k < set_y)
							set_y = k;
					}
				}

				game.set_object_pixel_y(object, (Math.floor((this_object.pixel_y + this_object.move_y - set_y) / game.tile_height) * game.tile_height) + game.tile_height - game.get_sprite(this_object.sprite_id).height + set_y);
				this_object.move_y = 0;

				collision_directions[collision_directions.length] = "down";
			}
		}

		for (var i = 0; i < this_tiles_x2.length; i++)
		{
			if (game.get_tile_movement([this_tiles_x2[i]]) == -1 && game.get_tile_canvas(this_tiles_x2[i]).getContext("2d").getImageData(this_x2 - (Math.floor(this_x2 / game.tile_width) * game.tile_width), this_y - (Math.floor(this_y / game.tile_height) * game.tile_height), 1, 1).data[3] != 0)
			{
				for (var j = this_object.pixel_x; j < this_object.pixel_x + game.get_sprite(this_object.sprite_id).width; j += 2)
				{
					if (j >= (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width) && j < (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width) + game.tile_width)
					{
						k = 0;

						while (game.get_tile_canvas(this_tiles_x2[i]).getContext("2d").getImageData(j - (Math.floor(this_object.pixel_x / game.tile_width) * game.tile_width), k, 1, 1).data[3] == 0 && k < game.tile_height)
							k++;

						if (k < set_y)
							set_y = k;
					}
				}

				game.set_object_pixel_y(object, (Math.floor((this_object.pixel_y + this_object.move_y) / game.tile_height) * game.tile_height) + game.tile_height - game.get_sprite(this_object.sprite_id).height + set_y);
				this_object.move_y = 0;

				collision_directions[collision_directions.length] = "down";
			}
		}
	}

	return collision_directions;
}

check_platforms = function(this_object, this_type)
{
	var collision_directions = new Array();

	this_collides = game.check_objects_at_level(this_object.pixel_x, this_object.pixel_x + game.get_sprite(this_object.sprite_id).width, this_object.pixel_y + game.get_sprite(this_object.sprite_id).height + this_object.move_y, 4);

	for (var i = 0; i < this_collides.length; i++)
	{
		if (this_collides[i].type == this_type && this_object.move_y > 0 && (this_object.pixel_y + game.get_sprite(this_object.sprite_id).height - 1) < this_collides[i].pixel_y)
		{
			this_object.move_y = 0;

			/*var set_y = 100000;

			for (var j = this_object.pixel_x; j < this_object.pixel_x + game.get_sprite(this_object.sprite_id).width; j += 2)
			{
				if (j >= this_collides[i].pixel_x && j < this_collides[i].pixel_x + game.get_sprite(this_collides[i].sprite_id).width)
				{
					k = 0;

					while (game.get_sprite(this_collides[i].sprite_id).canvas.getContext("2d").getImageData(j - this_collides[i].pixel_x, k, 1, 1).data[3] == 0 && k < game.get_sprite(this_collides[i].sprite_id).height)
						k++;

					if (k < set_y)
						set_y = k;
				}
			}*/

			game.set_object_pixel_y(object, this_collides[i].pixel_y - game.get_sprite(this_object.sprite_id).height);// + set_y);

			collision_directions[collision_directions.length] = "down";
		}
	}

	return collision_directions;
}
