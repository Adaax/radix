var fs = require('fs');

function radix()
{
	current_radix = this;

	this.register_A = 0;
	this.register_X = 0;
	this.register_Y = 0;

	this.bit_N = 0;
	this.bit_Z = 0;
	this.bit_C = 0;

	this.code_start = 65535;
	this.code_pointer = 65535;

	this.key_start = 100;
	this.tile_start = 25000;
	this.sprite_start = 42220;
	this.map_start = 59440;
	this.object_start = 60020;
	this.tile_detect_start = 60540;

	this.stack_start = 200;
	this.stack_pointer = 200;

	this.check_bytes = [1];

	this.run_flag = 0;
	this.memory_loc = 0;
	this.run_interval;

	this.memory = new Array();

	this.opcodes = new Array();
	this.opcodes = JSON.parse(fs.readFileSync("lib/opcodes.json", "utf8"));

	for (var i = 0; i < 165000; i++)
	{
		this.memory[i] = "00";
	}

	this.labels = new Array();

	this.background_color = undefined;

	/*game.current_room = "radix_room";

	this.radix_sprites = new Array();

	for (var i = 0; i < 256; i++)
	{
		for (j = 0; j < 4; j++)
		{
			this.radix_sprites[(i * 4) + j] = game.add_pixel_sprite({
				"name": "radix_sprite_" + i + "_" + j,
				"image": "",
				"pixel_x": -100,
				"pixel_y": -100,
				"z": 4,
				"tick": 1,
				"frames": 1,
				"rows": 1
			});

			this.radix_sprites[(i * 4) + j].code = "";
			this.radix_sprites[(i * 4) + j].flag = 0;
		}
	}

	this.radix_objects = new Array();

	for (var i = 0; i < 64; i++)
	{
		this.radix_objects[i] = game.add_object({
			"name": "radix_object",
			"id": "radix_object_" + i,
			"sprite_id": "radix_sprite_" + i + "_0",
			"room": game.current_room,
			"pixel_x": 100,
			"pixel_y": 100,
			"move_x": 0,
			"move_y": 0
		});

		this.radix_objects[i].sprite_div_id = game.get_sprite("radix_sprite_" + i + "_0").div.id;
	}*/

	this.load_code = function(this_code)
	{
		var code_bytes = this_code.split(";");
		var code_address = this.code_start;

		for (var i = 0; i < code_bytes.length; i++)
		{
			if (code_bytes[i].substr(0, 1) == "$")
			{
				code_address = parseInt("0x" + code_bytes[i].substr(1, code_bytes[i].length - 1));	
			}
			else
			{
				this.memory[code_address] = code_bytes[i];
				code_address++;
			}
		}
	}

	this.run_code = function()
	{
		this.run_flag = 1;
		this.memory_loc = this.code_start;

		this.run_interval = setInterval(run_code_loop, 17, this)
	}

	this.opcode_lookup = function(this_code)
	{
		for (var i = 0; i < this.opcodes.length; i++)
			if (this.opcodes[i].code == this_code)
				return this.opcodes[i].op;

		return undefined;
	}

	this.op_lookup = function(this_op)
	{
		for (var i = 0; i < this.opcodes.length; i++)
			if (this.opcodes[i].op == this_op)
				return this.opcodes[i].code;

		return undefined;
	}

	this.add_label = function(this_name, this_value)
	{
		for (var i = 0; i < this.labels.length; i++)
			if (this.labels[i].name == this_name)
				break;

		this.labels[i] = {};
		this.labels[i].name = this_name;
		this.labels[i].value = this_value;
	}

	this.get_label_value = function(this_name)
	{
		for (var i = 0; i < this.labels.length; i++)
			if (this.labels[i].name == this_name)
				return this.labels[i].value;

		return "00;00";
	}

	this.lookup_variable = function(this_var, this_type)
	{
		var i = this.var_start;
		var find_flag = 0;

		while (find_flag == 0)
		{
			var this_start = i;

			var this_name = "";
			var this_val = "";

			if (this.memory[i] == "00" && this.memory[i + 1] == "00")
			{
				find_flag = 1;
			}
			else
			{
				while (this.memory[i] != "00")
				{
					this_name += this.memory[i];
					i++;
				}

				i++;

				while (this.memory[i] != "00")
				{
					this_val += this.memory[i];
					i++;
				}

				i++;

				if (this_name == this_var)
				{
					find_flag = 1;
				}
			}			
		}

		if (this_type == 1)
			return this_start;
		else if (this_type == 2)
			return this_val;
	}

	this.assign_variable = function(this_var, this_value)
	{
		var this_location = this.lookup_variable(this_var, 1);

		var this_var_bytes = this.convert_int_to_bytes(this_var).split(";");
		var this_val_bytes = this.convert_int_to_bytes(this_value).split(";");

		for (var i = 0; i < this_var_bytes.length; i++)
		{
			if (this_var_bytes[i].length > 0)
			{
				this.memory[this_location] = this_var_bytes[i];
				this_location++;
			}
		}

		this.memory[this_location] = "00";
		this_location++;

		for (var i = 0; i < this_val_bytes.length; i++)
		{
			if (this_val_bytes[i].length > 0)
			{
				this.memory[this_location] = this_val_bytes[i];
				this_location++;
			}
		}

		this.memory[this_location] = "00";
		this_location++;
	}

	this.convert_string_to_bytes = function(this_string)
	{
		var bytes = "";

		for (var i = 0; i < this_string.length; i++)
			bytes += this_string.charCodeAt(i).toString(16) + ";";

		return bytes;
	}

	this.convert_int_to_bytes = function(this_int)
	{
		var bytes = ""

		if (this_int.length % 2 != 0)
			this_int = "0" + this_int;

		for (var i = 0; i < this_int.length; i += 2)
			bytes += this_int.substr(i, 2) + ";";

		return bytes;
	}

	this.get_binary_byte = function(this_num)
	{
		var binary_num = parseInt("0x" + this_num).toString(2);
		var binary_length = binary_num.length;

		for (var i = 0; i < 8 - binary_length; i++)
			binary_num = "0" + binary_num;

		return binary_num;
	}

	this.check_check_bytes = function()
	{
		for (var i = 0; i < this.check_bytes.length; i++)
			if (this.memory[this.check_bytes[i]] != "00")
				return false;

		return true;
	}

	this.get_byte_color = function(this_num)
	{
		var binary_num = this.get_binary_byte(this_num);

		var color_red = (parseInt(binary_num.substr(0, 3), 2) * 32).toString(16);
		if (color_red.length == 1)
			color_red = "0" + color_red

		var color_green = (parseInt(binary_num.substr(3, 3), 2) * 32).toString(16);
		if (color_green.length == 1)
			color_green = "0" + color_green

		var color_blue = (parseInt(binary_num.substr(6, 2), 2) * 64).toString(16);
		if (color_blue.length == 1)
			color_blue = "0" + color_blue

		return "#" + color_red + "" + color_green + "" + color_blue;
	}

	this.do_and = function(this_num1, this_num2)
	{
		var this_and = 0;

		for (var i = 0; i < 8; i++)
		{
			if (this_num1.substr(i, 1) == 1 && this_num2.substr(i, 1) == 1)
			{
				this_and = 1;

				if (i == 0)
					this.bit_N = 1;
			}
		}

		if (this_and == 1)
			this.bit_Z = 0;
		else
			this.bit_Z = 1;
	}

	this.do_screen_loop = function()
	{
		// set background color

		if (this.background_color != this.memory[10])
		{
			var this_color = this.get_byte_color(this.memory[10]);
			game.map_canvas.style.backgroundColor = this_color;
			this.background_color = this.memory[10];
		}

		for (var i = 0; i < 256; i++)
		{
			var read_start = this.tile_start + (i * ((4 * 16) + 3));
			var color_settings = new Array();

			var bitmap_code = "";

			for (var j = 0; j < 3; j++)
			{
				color_settings[j] = this.memory[read_start + j];
				bitmap_code += this.memory[read_start + j];
			}

			read_start += 3;

			for (j = 0; j < 16; j++)
			{
				for (k = 0; k < 4; k++)
					bitmap_code += this.get_binary_byte(this.memory[read_start + k]);

				read_start += 4;
			}

			read_start = this.tile_start + (i * ((4 * 16) + 3)) + 3;

			if (bitmap_code != game.pixelCodes[i])
			{
				game.pixelCodes[i] = bitmap_code;
				game.pixelFlags[i] = 1;

				for (j = 0; j < 16; j++)
				{
					var binary_line = "";

					for (k = 0; k < 4; k++)
						binary_line += this.get_binary_byte(this.memory[read_start + k]);

					for (k = 0; k < 32; k += 2)
					{
						this_color = parseInt(binary_line.substr(k, 2), 2);

						if (this_color != 0)
						{
							var ctx = game.pixelTiles[i].getContext("2d");
							ctx.fillStyle = this.get_byte_color(color_settings[this_color - 1]);
							ctx.fillRect((k / 2) * 4, j * 4, 4, 4);
						}
					}

					read_start += 4;
				}
			}
		}

		for (var i = 0; i < 256; i++)
		{
			var read_start = this.sprite_start + (i * ((4 * 16) + 3));
			var color_settings = new Array();

			var bitmap_code = "";

			for (var j = 0; j < 3; j++)
			{
				color_settings[j] = this.memory[read_start + j];
				bitmap_code += this.memory[read_start + j];
			}

			read_start += 3;

			for (j = 0; j < 16; j++)
			{
				for (k = 0; k < 4; k++)
					bitmap_code += this.get_binary_byte(this.memory[read_start + k]);

				read_start += 4;
			}

			if (bitmap_code != this.radix_sprites[(i * 4)].code)
			{
				for (l = 0; l < 4; l++)
				{
					read_start = this.sprite_start + (i * ((4 * 16) + 3)) + 3;

					this.radix_sprites[(i * 4) + l].code = bitmap_code;
					this.radix_sprites[(i * 4) + l].flag = 1;

					var ctx = this.radix_sprites[(i * 4) + l].canvas.getContext("2d");

					if (l == 1)
					{
						ctx.translate(64, 0);
						ctx.scale(-1, 1);
					}
					else if (l == 2)
					{
						ctx.translate(32, 32);
						ctx.rotate(90 * Math.PI / 180);
						ctx.translate(-32, -32);
					}
					else if (l == 3)
					{
						ctx.translate(32, 32);
						ctx.rotate(-90 * Math.PI / 180);
						ctx.translate(-32, -32);
					}

					for (j = 0; j < 16; j++)
					{
						var binary_line = "";

						for (k = 0; k < 4; k++)
							binary_line += this.get_binary_byte(this.memory[read_start + k]);

						for (k = 0; k < 32; k += 2)
						{
							this_color = parseInt(binary_line.substr(k, 2), 2);

							if (this_color != 0)
							{
								ctx.fillStyle = this.get_byte_color(color_settings[this_color - 1]);
								ctx.fillRect((k / 2) * 4, j * 4, 4, 4);
							}
						}

						read_start += 4;
					}
				}
			}
		}

		read_start = this.map_start;

		for (var i = 0; i < 12; i++)
		{
			for (var j = 0; j < 16; j++)
			{
				game.map_pixel_tile(parseInt("0x" + this.memory[read_start]), j, i);
				read_start++;
			}
		}

		for (var i = 0; i < 12; i++)
		{
			for (var j = 0; j < 16; j++)
			{
				game.map_pixel_tile(parseInt("0x" + this.memory[read_start]), j + 16, i);
				read_start++;
			}
		}

		for (var i = 0; i < 12; i++)
		{
			for (var j = 0; j < 16; j++)
			{
				game.map_pixel_tile(parseInt("0x" + this.memory[read_start]), j + 32, i);
				read_start++;
			}
		}

		var this_page = parseInt("0x" + this.memory[read_start]);
		read_start++;

		var this_x = parseInt("0x" + this.memory[read_start]);
		read_start++;

		var this_move_byte = this.get_binary_byte(this.memory[read_start]);
		read_start++;

		if (this_move_byte[0] == 0)
			var move_x = parseInt(this_move_byte.substring(2, this_move_byte.length), 2);
		else
			var move_x = parseInt(this_move_byte.substring(2, this_move_byte.length), 2) * -1;

		this_x += move_x;

		if (this_page == 0)
		{
			if (this_x < 0)
			{
				this_page++;
				this_x += 256;

				game.map_div.style.left = (-2048 + (this_x * 4)) + "px";

				this.memory[read_start - 3] = this_page.toString(16);
				this.memory[read_start - 2] = this_x.toString(16);
			}
			else
			{
				if (this_x > 256)
					this_x = 256;

				game.map_div.style.left = (-1024 + (this_x * 4)) + "px";

				if (this_x > 255)
					this_x = 255;

				this.memory[read_start - 2] = this_x.toString(16);
			}
		}
		else if (this_page == 1)
		{
			if (this_x > 255)
			{
				this_page--;
				this_x -= 256;

				game.map_div.style.left = (-1024 + (this_x * 4)) + "px";

				this.memory[read_start - 3] = this_page.toString(16);
				this.memory[read_start - 2] = this_x.toString(16);
			}
			else
			{
				if (this_x <= 0)
					this_x = 0;

				game.map_div.style.left = (-2048 + (this_x * 4)) + "px";

				if (this_x < 0)
					this_x = 0;

				this.memory[read_start - 2] = this_x.toString(16);
			}
		}

		read_start = this.object_start;

		for (var i = 0; i < 64; i++)
		{
			read_start = (this.object_start + (i * 8));

			var this_data = new Array();

			for (var j = 0; j < 8; j++)
			{
				this_data[j] = this.memory[read_start];
				read_start++;
			}

			var this_sprite = parseInt("0x" + this_data[0]);
			var this_angle = parseInt(this.get_binary_byte(this_data[6]).substr(6, 2), 2);
			
			if (this.radix_objects[i].sprite_id != "radix_sprite_" + this_sprite + "_" + this_angle)
				game.replace_object_sprite(this.radix_objects[i], "radix_sprite_" + this_sprite + "_" + this_angle);

			var this_page = parseInt("0x" + this_data[1]);

			if (this_page == 0)
			{
				game.set_object_pixel_x(this.radix_objects[i], -100);
				game.set_object_pixel_y(this.radix_objects[i], -100);
			}
			else
			{
				var this_x = ((256 * (this_page - 1)) + parseInt("0x" + this_data[2])) * 4;
				var this_y = parseInt("0x" + this_data[3]) * 4;

				var move_x_binary = this.get_binary_byte(this_data[4]);
				var move_y_binary = this.get_binary_byte(this_data[5]);

				if (move_x_binary[0] == 0)
					var move_x = parseInt(move_x_binary.substring(2, move_x_binary.length), 2);
				else
					var move_x = parseInt(move_x_binary.substring(2, move_x_binary.length), 2) * -1;

				if (move_y_binary[0] == 0)
					var move_y = parseInt(move_y_binary.substring(2, move_y_binary.length), 2);
				else
					var move_y = parseInt(move_y_binary.substring(2, move_y_binary.length), 2) * -1;

				this_data[1] = parseInt("0x" + this_data[1]);
				this_data[2] = parseInt("0x" + this_data[2]) + move_x;

				if (this_data[2] > 255)
				{
					this_data[1] = parseInt("0x" + this_data[1]) + 1;
					this_data[2] -= 256;
				}
				else if (this_data[2] < 0)
				{
					this_data[1] = parseInt("0x" + this_data[1]) - 1;
					this_data[2] += 256;
				}

				this_data[3] = parseInt("0x" + this_data[3]) + move_y;

				if (this_data[3] > 255)
					this_data[3] = 0;

				var relative_x = ((this_x + (move_x * 4) - 32) + parseInt(game.map_div.style.left)) / 4;

				if (relative_x >= 0 && relative_x <= 255)
				{
					this.memory[(this.object_start + (i * 8)) + 6] = parseInt("1" + this.get_binary_byte(this_data[6]).substring(1, 8), 2).toString(16);
					this.memory[(this.object_start + (i * 8)) + 7] = relative_x.toString(16);
				}
				else
				{
					this.memory[(this.object_start + (i * 8)) + 6] = parseInt("0" + this.get_binary_byte(this_data[6]).substring(1, 8), 2).toString(16);;
					this.memory[(this.object_start + (i * 8)) + 7] = "00";
				}

				this.memory[(this.object_start + (i * 8)) + 1] = this_data[1].toString(16);
				this.memory[(this.object_start + (i * 8)) + 2] = this_data[2].toString(16);
				this.memory[(this.object_start + (i * 8)) + 3] = this_data[3].toString(16);

				game.set_object_pixel_x(this.radix_objects[i], this_x + (move_x * 4) - 32);
				game.set_object_pixel_y(this.radix_objects[i], this_y + (move_y * 4) - 32);
			}
		}

		read_start = this.tile_detect_start;

		for (var i = 0; i < 128; i++)
		{
			read_start = (this.tile_detect_start + (i * 4));

			var this_data = new Array();

			for (var j = 0; j < 4; j++)
			{
				this_data[j] = this.memory[read_start];
				read_start++; 
			}

			if (!(this_data[0] == 0 && this_data[1] == 0))
			{
				var this_offset_x = parseInt("0x" + this_data[0]) - 1;

				var this_x = Math.floor((parseInt("0x" + this_data[1]) + (256 * this_offset_x)) / 16);
				var this_y = Math.floor(parseInt("0x" + this_data[2]) / 16);
				//console.log(this_x + " " + this_y);

				if (this_x >= 0 && this_x <= 47 && this_y >= 0 && this_y <= 11)
					this.memory[(this.tile_detect_start + (i * 4)) + 3] = game.map_array[this_y][this_x].toString(16);
				else
					this.memory[(this.tile_detect_start + (i * 4)) + 3] = "00";

				//console.log(this.memory[this.tile_detect_start + 3]);
			}
		}

		for (var i = 0; i < 256; i++)
		{
			game.pixelFlags[i] = 0;
			this.radix_sprites[i].flag = 0;
		}

		//console.log(this.memory[60548] + " " + this.memory[60549] + " " + this.memory[60550] + " " + this.memory[60551]);
		//console.log(this.memory[60552] + " " + this.memory[60553] + " " + this.memory[60554] + " " + this.memory[60555]);

		this.memory[1] = "00";
	}
}

run_code_loop = function(this_radix)
{
	if (this_radix.run_flag == 1 && this_radix.check_check_bytes())
	{
		this_radix.run_flag = 0;

		for (i = 0; i < 10000; i++)
		{
			var new_code = this_radix.memory[this_radix.memory_loc];
			this_radix.memory_loc++;

			var new_op = this_radix.opcode_lookup(new_code);

			if (new_op == "end")
			{
				clearInterval(this_radix.run_interval)
			}
			else if (new_op == "lda_value")
			{
				var this_value = this_radix.memory[this_radix.memory_loc];
				this_radix.memory_loc++;

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_A = this_value;				
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "lda_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_A = this_radix.memory[parseInt("0x" + this_value)];			
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "lda_address_x")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_A = this_radix.memory[parseInt("0x" + this_value) + parseInt("0x" + this_radix.register_X)];			
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "lda_address_y")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_A = this_radix.memory[parseInt("0x" + this_value) + parseInt("0x" + this_radix.register_Y)];			
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "sta_address")
			{
				var this_value = this_radix.memory[this_radix.memory_loc];
				this_radix.memory_loc++;

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory[parseInt("0x" + this_value)] = this_radix.register_A;			
				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "sta_address_x")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory[parseInt("0x" + this_value) + parseInt("0x" + this_radix.register_X)] = this_radix.register_A;			
				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "sta_address_y")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory[parseInt("0x" + this_value) + parseInt("0x" + this_radix.register_Y)] = this_radix.register_A;			
				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "ldy_value")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_Y = this_value;		
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_Y)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "ldy_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_Y = this_radix.memory[parseInt("0x" + this_value)];			
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_Y)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "sty_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory[parseInt("0x" + this_value)] = this_radix.register_Y;			
				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "ldx_value")
			{
				var this_value = this_radix.memory[this_radix.memory_loc];
				this_radix.memory_loc++;

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_X = this_value;
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_X)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "ldx_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.register_X = this_radix.memory[parseInt("0x" + this_value)];			
				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_X)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "stx_address")
			{
				var this_value = this_radix.memory[this_radix.memory_loc];
				this_radix.memory_loc++;

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory[parseInt("0x" + this_value)] = this_radix.register_X;	
				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "dey")
			{
				this_value = parseInt("0x" + this_radix.register_Y) - 1;

				if (this_value < 0)
					this_value = 255;

				if (this_value == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_Y = this_value.toString(16);
				if (this_radix.register_Y.length == 1)
					this_radix.register_Y = "0" + this_radix.register_Y;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_Y)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "dex")
			{
				this_value = parseInt("0x" + this_radix.register_X) - 1;

				if (this_value < 0)
					this_value = 255;

				if (this_value == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_X = this_value.toString(16);
				if (this_radix.register_X.length == 1)
					this_radix.register_X = "0" + this_radix.register_X;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_X)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "iny")
			{
				this_value = parseInt("0x" + this_radix.register_Y) + 1;

				if (this_value > 255)
					this_value = 0;

				if (this_value == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_Y = this_value.toString(16);
				if (this_radix.register_Y.length == 1)
					this_radix.register_Y = "0" + this_radix.register_Y;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_Y)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "inx")
			{
				this_value = parseInt("0x" + this_radix.register_X) + 1;

				if (this_value > 255)
					this_value = 0;

				if (this_value == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_X = this_value.toString(16);
				if (this_radix.register_X.length == 1)
					this_radix.register_X = "0" + this_radix.register_X;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_X)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "label")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_radix.memory_loc++;
				this_radix.assign_variable(this_value, this_radix.memory_loc.toString(16));
				//console.log(this_radix.lookup_variable(this_value, 2));

				this_radix.run_flag = 1;
			}
			else if (new_op == "jmp")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				this_radix.memory_loc = this_value;

				this_radix.run_flag = 1;
			}
			else if (new_op == "bne")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_Z == 0)
				{
					this_radix.memory_loc = this_value;
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "beq")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_Z == 1)
				{
					this_radix.memory_loc = this_value;
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "bpl")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_N == 0)
				{
					this_radix.memory_loc = this_value;
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "bmi")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_N == 1)
				{
					this_radix.memory_loc = this_value;
					//alert(this_radix.memory[this_radix.memory_loc] + " " + this_radix.memory[this_radix.memory_loc + 1]);
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "cmp_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}
				//console.log((parseInt("0x" + this_radix.register_A) - parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)])) + " " + this_radix.register_A + " " + this_radix.memory[parseInt("0x" + this_value)] );

				var this_diff = this_radix.get_binary_byte(parseInt("0x" + this_radix.register_A) - parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]));
				this_radix.bit_N = this_diff[0];

				if (parseInt("0x" + this_radix.register_A) < parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]))
				{
					this_radix.bit_Z = 0;
					this_radix.bit_C = 0;
					//this_radix.bit_N = 1;
				}
				else if (parseInt("0x" + this_radix.register_A) == parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]))
				{
					this_radix.bit_Z = 1;
					this_radix.bit_C = 1;
					//this_radix.bit_N = 0;
				}
				else if (parseInt("0x" + this_radix.register_A) > parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]))
				{
					this_radix.bit_Z = 0;
					this_radix.bit_C = 1;
					//this_radix.bit_N = 0;
				}

				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "cmp_value")
			{
				var this_value = this_radix.memory[this_radix.memory_loc];
				this_radix.memory_loc++;

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				//console.log(parseInt("0x" + this_radix.register_A) + " " + parseInt("0x" + this_value));
				if (parseInt("0x" + this_radix.register_A) < parseInt("0x" + this_value))
				{
					this_radix.bit_Z = 0;
					this_radix.bit_C = 0;
					this_radix.bit_N = 1;
				}
				else if (parseInt("0x" + this_radix.register_A) == parseInt("0x" + this_value))
				{
					this_radix.bit_Z = 1;
					this_radix.bit_C = 1;
					this_radix.bit_N = 0;
				}
				else if (parseInt("0x" + this_radix.register_A) > parseInt("0x" + this_value))
				{
					this_radix.bit_Z = 0;
					this_radix.bit_C = 1;
					this_radix.bit_N = 0;
				}

				this_radix.memory_loc++;

				this_radix.run_flag = 1;
			}
			else if (new_op == "clc")
			{
				this_radix.bit_C = 0;
				this_radix.run_flag = 1;
			}
			else if (new_op == "and_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_mem_binary = this_radix.get_binary_byte(this_radix.memory[parseInt("0x" + this_value)]);
				this_reg_binary = this_radix.get_binary_byte(this_radix.register_A);

				this_radix.do_and(this_mem_binary, this_reg_binary);

				this_radix.memory_loc++;

				//this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "and_value")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_mem_binary = this_radix.get_binary_byte(this_value);
				this_reg_binary = this_radix.get_binary_byte(this_radix.register_A);

				this_radix.do_and(this_mem_binary, this_reg_binary);

				this_radix.memory_loc++;

				//this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "adc_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_sum = parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]) + parseInt("0x" + this_radix.register_A) + this_radix.bit_C;

				if (this_sum > 255)
				{
					this_sum -= 255;
					this_radix.bit_C = 1;
				}
				else
				{
					this_radix.bit_C = 0;
				}

				if (this_sum == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_A = this_sum.toString(16);

				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "adc_value")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_sum = parseInt("0x" + this_value) + parseInt("0x" + this_radix.register_A) + this_radix.bit_C;

				if (this_sum > 255)
				{
					this_sum -= 255;
					this_radix.bit_C = 1;
				}
				else
				{
					this_radix.bit_C = 0;
				}

				if (this_sum == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_A = this_sum.toString(16);

				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "sbc_address")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_sum = parseInt("0x" + this_radix.register_A) - parseInt("0x" + this_radix.memory[parseInt("0x" + this_value)]) - this_radix.bit_C;

				if (this_sum < 0)
				{
					this_sum += 256;
					this_radix.bit_C = 1;
				}
				else
				{
					this_radix.bit_C = 0;
				}

				if (this_sum == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_A = this_sum.toString(16);

				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "sbc_value")
			{
				var this_value = "";

				while (this_radix.memory[this_radix.memory_loc] != "00")
				{
					this_value += this_radix.memory[this_radix.memory_loc]
					this_radix.memory_loc++;
				}

				this_sum = parseInt("0x" + this_radix.register_A) - parseInt("0x" + this_value) - this_radix.bit_C;

				if (this_sum < 0)
				{
					this_sum += 256;
					this_radix.bit_C = 1;
				}
				else
				{
					this_radix.bit_C = 0;
				}

				if (this_sum == 0)
					this_radix.bit_Z = 1;
				else
					this_radix.bit_Z = 0;

				this_radix.register_A = this_sum.toString(16);

				this_radix.memory_loc++;

				this_radix.bit_N = parseInt(this_radix.get_binary_byte(this_radix.register_A)[0]);

				this_radix.run_flag = 1;
			}
			else if (new_op == "bcc")
			{
				this_value = parseInt("0x" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_C == 0)
				{
					this_radix.memory_loc = this_value;
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "bcs")
			{
				this_value = parseInt("0x" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc++;

				if (this_radix.bit_C == 1)
				{
					this_radix.memory_loc = this_value;
				}
				else
				{
					this_radix.memory_loc++;
				}

				this_radix.run_flag = 1;
			}
			else if (new_op == "jsr")
			{
				this_value = parseInt("0x1" + this_radix.memory[this_radix.memory_loc] + this_radix.memory[this_radix.memory_loc + 1]);
				this_radix.memory_loc += 2;

				this_stack_value = (this_radix.memory_loc - 65536).toString(16);

				var this_length = this_stack_value.length

				for (i = 0; i < 4 - this_length; i++)
					this_stack_value = "0" + this_stack_value;

				this_radix.memory[this_radix.stack_pointer] = this_stack_value.substr(2, 2); 
				this_radix.memory[this_radix.stack_pointer - 1] = this_stack_value.substr(0, 2);
				this_radix.stack_pointer -= 2;

				this_radix.memory_loc = this_value;

				this_radix.run_flag = 1;
			}
			else if (new_op == "rts")
			{
				this_radix.stack_pointer += 2;

				this_value = parseInt("0x1" + this_radix.memory[this_radix.stack_pointer - 1] + this_radix.memory[this_radix.stack_pointer]);
				this_radix.memory_loc = this_value;

				this_radix.run_flag = 1;
			}

			if (!this_radix.check_check_bytes())
				break;
		}
	}
}
