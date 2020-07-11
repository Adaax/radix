memory = {}

pixelCodes = {}

register_A = 0
register_X = 0
register_Y = 0

bit_N = 0
bit_Z = 0
bit_C = 0
bit_D = 0

code_start = 13872
code_pointer = 13872

key_start = 8
tile_start = 5294
read_start = 0
time_counter = 0

move_flag = 0

sprite_start = 11793
map_start = 4106
object_start = 4682
collision_start = 4938
sound_data_start = 5258
sound_start = 5291

stack_start = 4000
stack_pointer = 4000

code_address = 0
stop_flag = 0
game_page = 0

quit_flag = 0
quit_counter = 0

memory_loc = code_start

tiles = {}
sprites = {}

sprite_flag = {}
sprite_x = {}
sprite_y = {}
sprite_z = {}
sprite_angle = {}
sprite_sprite = {}

map_array = {}

output_string = ""

for i = 0, 575 do
	map_array[i] = 0
end

for i = 0, 65535 do
	memory[i] = "00"
end

local sfxr = require("sfxr")

channels = {}
channels[0] = sfxr.newSound()
channels[0].waveform = 0
channels[1] = sfxr.newSound()
channels[1].waveform = 2
channels[2] = sfxr.newSound()
channels[2].waveform = 3

channel1 = sfxr.newSound()
channel2 = sfxr.newSound()
channel3 = sfxr.newSound()

function love.load(arg)
	love.window.setTitle("Radix Emulator 0.1.0");
	set_icon()

	min_dt = 1 / 60
   	next_time = love.timer.getTime()

	if arg[1] == "-t" then
		go_sound()
		quit_flag = 1
		quit_counter = tonumber(arg[2])
	else
		game_code = love.filesystem.read(arg[1] .. ".rdx")
		store_code(game_code)
	end

	tile_canvas = love.graphics.newCanvas(1024, 1024)
	sprite_canvas = love.graphics.newCanvas(1024, 1024)

	draw_background_tiles()
	draw_sprite_tiles()
end

function love.draw()
    --love.graphics.print(memory[10], 100, 120)
    love.graphics.setColor(1, 1, 1)
    draw_background()
    draw_sprites()
    check_collides()
    play_sounds()

    --love.graphics.draw(sprite_canvas, 0, 0)
    --love.graphics.draw(sprite0, 64, 64, 0, -1, -1)

    if memory[1] ~= "00" then
    	memory[1] = "00"
	end

	local cur_time = love.timer.getTime()
	if next_time <= cur_time then
    	next_time = cur_time
    	return
   	elseif move_flag == 1 then
   		move_flag = 0
   		love.timer.sleep(next_time - cur_time)
   	end
end

function love.update(dt)
	if quit_flag == 1 and time_counter == quit_counter then
		love.event.quit()
	end

	next_time = next_time + min_dt

  	time_counter = time_counter + 1

  	if time_counter == 100000 then
  		time_counter = 0
  	end

  	--print(dt)
  	run_keys()
    run_code()

	if memory[5] ~= "00" then
		print(memory[5])
		output_string = output_string .. memory[5] .. "\n"
		memory[5] = "00"
	elseif memory[7] ~= "00" then
		reset_cartrdge()
	end

	--trace(14592, 15)
end

function love.quit()
	print(output_string)
	this_write = love.filesystem.write("output.txt", output_string, all)
	print(this_write)
end

function trace(mem_start, mem_length)
	this_trace = ""

	for i = mem_start, mem_start + mem_length - 1 do
		this_trace = this_trace .. memory[i] .. " "
	end

	print(this_trace)
end

function go_sound()
	tone_code = love.filesystem.read("tone.txt")

	tone_bytes = {}
	tone_bytes = split(tone_code, ";")

    channel1.waveform = 0

    channel1.volume.master = tone_bytes[0] / 255
    channel1.frequency.start = tone_bytes[1] / 255
    channel1.frequency.min = tone_bytes[2] / 255

    channel1.envelope.attack = tone_bytes[3] / 255
    channel1.envelope.sustain = tone_bytes[4] / 255
    channel1.envelope.decay = tone_bytes[5] / 255

    channel1.change.amount = (tone_bytes[6] - 8) / 15
    channel1.change.speed = tone_bytes[7] / 15

    channel1.vibrato.depth = tone_bytes[8] / 255
    channel1.vibrato.speed = tone_bytes[9] / 255

	channel1.lowpass.cutoff = tone_bytes[10] / 15
    channel1.lowpass.sweep = (tone_bytes[11] - 8) / 15

	channel1.highpass.cutoff = tone_bytes[12] / 15
    channel1.highpass.sweep = (tone_bytes[13] - 8) / 15

    channel2.waveform = 2

    channel2.volume.master = tone_bytes[14] / 255
    channel2.frequency.start = tone_bytes[15] / 255
    channel2.frequency.min = tone_bytes[16] / 255

    channel2.envelope.attack = tone_bytes[17] / 255
    channel2.envelope.sustain = tone_bytes[18] / 255
    channel2.envelope.decay = tone_bytes[19] / 255

    channel2.change.amount = (tone_bytes[20] - 8) / 15
    channel2.change.speed = tone_bytes[21] / 15

    channel2.vibrato.depth = tone_bytes[22] / 255
    channel2.vibrato.speed = tone_bytes[23] / 255

	channel2.lowpass.cutoff = tone_bytes[24] / 15
    channel2.lowpass.sweep = (tone_bytes[25] - 8) / 15

	channel2.highpass.cutoff = tone_bytes[26] / 15
    channel2.highpass.sweep = (tone_bytes[27] - 8) / 15

    channel3.waveform = 3

    channel3.volume.master = tone_bytes[28] / 255
    channel3.frequency.start = tone_bytes[29] / 255
    channel3.frequency.min = tone_bytes[30] / 255

    channel3.envelope.attack = tone_bytes[31] / 255
    channel3.envelope.sustain = tone_bytes[32] / 255
    channel3.envelope.decay = tone_bytes[33] / 255

    channel3.change.amount = (tone_bytes[34] - 8) / 15
    channel3.change.speed = tone_bytes[35] / 15

    channel3.vibrato.depth = tone_bytes[36] / 255
    channel3.vibrato.speed = tone_bytes[37] / 255

	channel3.lowpass.cutoff = tone_bytes[38] / 15
    channel3.lowpass.sweep = (tone_bytes[39] - 8) / 15

	channel3.highpass.cutoff = tone_bytes[40] / 15
    channel3.highpass.sweep = (tone_bytes[41] - 8) / 15

	love.audio.newSource(channel1:generateSoundData()):play()
	love.audio.newSource(channel2:generateSoundData()):play()
	love.audio.newSource(channel3:generateSoundData()):play()
end

function set_icon()
	icon = love.graphics.newImage("radix_icon.png")
	icon_canvas = love.graphics.newCanvas(28, 28)

	love.graphics.setCanvas(icon_canvas)
	love.graphics.setColor(1, 1, 1)
	love.graphics.draw(icon, 0, 0)
	love.graphics.setCanvas()

	love.window.setIcon(icon_canvas:newImageData(0, none, 0, 0, 28, 28))
end

function reset_cartrdge()
	love.event.quit("restart")
end

function play_sounds()
	for i = 0, 2 do
		if (memory[sound_start + i] ~= "00") then
			j = sound_data_start + (i * 11)

			channels[i].volume.master = tonumber(memory[j], 16) / 255
			channels[i].frequency.start = tonumber(memory[j + 1], 16) / 255
			channels[i].frequency.min = tonumber(memory[j + 2], 16) / 255

			channels[i].envelope.attack = tonumber(memory[j + 3], 16) / 255
			channels[i].envelope.sustain = tonumber(memory[j + 4], 16) / 255
			channels[i].envelope.decay = tonumber(memory[j + 5], 16) / 255

			channels[i].change.amount = (tonumber(string.sub(memory[j + 6], 1, 1), 16) - 8) / 15
			channels[i].change.speed = tonumber(string.sub(memory[j + 6], 2, 2), 16) / 15

			channels[i].vibrato.depth = tonumber(memory[j + 7], 16) / 255
			channels[i].vibrato.speed = tonumber(memory[j + 8], 16) / 255

			channels[i].lowpass.cutoff = tonumber(string.sub(memory[j + 9], 1, 1), 16) / 15
			channels[i].lowpass.sweep = (tonumber(string.sub(memory[j + 9], 2, 2), 16) - 8) / 15

			channels[i].highpass.cutoff = tonumber(string.sub(memory[j + 10], 1, 1), 16) / 15
			channels[i].highpass.sweep = (tonumber(string.sub(memory[j + 10], 2, 2), 16) - 8) / 15

			love.audio.newSource(channels[i]:generateSoundData()):play()
			memory[sound_start + i] = "00"
		end
	end
end

function check_collides()
	read_start = collision_start

	for i = 0, 63 do
		read_start = (collision_start + (i * 5))

		this_data = {}

		for j = 0, 4 do
			this_data[j] = tonumber(memory[read_start], 16)
			read_start = read_start + 1
		end

		if not(tonumber(this_data[0], 16) == 0 and tonumber(this_data[1], 16) == 0) then
			this_object1 = this_data[0]
			this_x1 = sprite_x[this_object1]
			this_y1 = sprite_y[this_object1]

			this_object2 = this_data[1]
			this_x2 = sprite_x[this_object2]
			this_y2 = sprite_y[this_object2]

			this_distance = math.sqrt(math.pow(this_x1 - this_x2, 2) + math.pow(this_y1 - this_y2, 2))

			if this_distance <= (tonumber(this_data[2], 16) * 4) + (tonumber(this_data[3], 16) * 4) and this_y1 >= 0 and this_y2 >= 0 then
				memory[(collision_start + (i * 5)) + 4] = "01"
			else
				memory[(collision_start + (i * 5)) + 4] = "00"
			end
		end
	end
end

function draw_sprites()
	this_draw_page = tonumber(memory[3], 16)
	this_draw_offset = tonumber(memory[4], 16)

	for i = 0, 31 do
		sprite_flag[i] = 0
	end

	draw_counter = 0

	for i = 0, 31 do
		read_start = object_start + (i * 8)

		this_data = {}

		for j = 0, 7 do
			this_data[j] = memory[read_start]
			read_start = read_start + 1
		end

		--if memory[1] ~= "00" then				
		--	move_flag = 1
		--end

		if not(tonumber(this_data[0], 16) == 0) then
			draw_counter = draw_counter + 1

			this_sprite = tonumber(this_data[0], 16)
			print(this_sprite)
			this_angle = tonumber(string.sub(get_binary_byte(this_data[6]), 7, 8), 2)
			this_z = tonumber(string.sub(get_binary_byte(this_data[6]), 2, 6), 2)
			--print(this_sprite .. " " .. this_angle .. " " .. this_z)

			this_page = tonumber(this_data[1], 16)

			if this_page ~= 0 then
				sprite_flag[i] = 1

				this_x = ((256 * (this_page - 1)) + tonumber(this_data[2], 16)) * 4
				this_x = this_x - (this_draw_page * 1024)

				this_y = tonumber(this_data[3], 16) * 4

				move_x = 0
				move_y = 0

				if memory[1] ~= "00" then				
					move_flag = 1
					move_x_binary = get_binary_byte(this_data[4]);
					move_y_binary = get_binary_byte(this_data[5]);

					if string.sub(move_x_binary, 1, 1) == "0" then
						if string.sub(move_x_binary, 2, 2) == "0" then
							move_x = tonumber(string.sub(move_x_binary, 3), 2)
						else
							this_val = tonumber(string.sub(move_x_binary, 3), 2)

							if this_val <= 8 then
								if math.fmod(time_counter, this_val) == 0 then
									move_x = 1
								else
									move_x = 0
								end
							elseif this_val <= 16 then
								if math.fmod(time_counter, 16) < this_val then
									move_x = 1
								else
									move_x = 0
								end
							else
								if math.fmod(time_counter, 16) < (this_val - 16) then
									move_x = 2
								else
									move_x = 1;
								end
							end
						end
					else
						if string.sub(move_x_binary, 2, 2) == "0" then
							move_x = tonumber(string.sub(move_x_binary, 3), 2) * -1
						else
							this_val = tonumber(string.sub(move_x_binary, 3), 2)

							if this_val <= 8 then
								if math.fmod(time_counter, this_val) == 0 then
									move_x = -1
								else
									move_x = 0
								end
							elseif this_val <= 16 then
								if math.fmod(time_counter, 16) < this_val then
									move_x = -1
								else
									move_x = 0
								end
							else
								if math.fmod(time_counter, 16) < (this_val - 16) then
									move_x = -2
								else
									move_x = -1;
								end
							end
						end
					end

					if string.sub(move_y_binary, 1, 1) == "0" then
						if string.sub(move_y_binary, 2, 2) == "0" then
							move_y = tonumber(string.sub(move_y_binary, 3), 2)
						else
							this_val = tonumber(string.sub(move_y_binary, 3), 2)

							if this_val <= 8 then
								if math.fmod(time_counter, this_val) == 0 then
									move_y = 1
								else
									move_y = 0
								end
							elseif this_val <= 16 then
								if math.fmod(time_counter, 16) < this_val then
									move_y = 1
								else
									move_y = 0
								end
							else
								if math.fmod(time_counter, 16) < (this_val - 16) then
									move_y = 2
								else
									move_y = 1;
								end
							end
						end
					else
						if string.sub(move_y_binary, 2, 2) == "0" then
							move_y = tonumber(string.sub(move_y_binary, 3), 2) * -1
						else
							this_val = tonumber(string.sub(move_y_binary, 3), 2)

							if this_val <= 8 then
								if math.fmod(time_counter, this_val) == 0 then
									move_y = -1
								else
									move_y = 0
								end
							elseif this_val <= 16 then
								if math.fmod(time_counter, 16) < this_val then
									move_y = -1
								else
									move_y = 0
								end
							else
								if math.fmod(time_counter, 16) < (this_val - 16) then
									move_y = -2
								else
									move_y = -1;
								end
							end
						end
					end
				end

				if (tonumber(memory[2]) ~= 0) then
					move_x = 0
					move_y = 0
				end

				this_data[1] = tonumber(this_data[1], 16)
				this_data[2] = tonumber(this_data[2], 16) + move_x;

				if this_data[2] > 255 then
					this_data[1] = tonumber(this_data[1], 16) + 1
					this_data[2] = this_data[2] - 256
				elseif this_data[2] < 0 then
					this_data[1] = tonumber(this_data[1], 16) - 1
					this_data[2] = this_data[2] + 256
				end

				this_data[3] = tonumber(this_data[3], 16) + move_y

				if (this_data[3] > 255) then
					this_data[3] = 0
				end

				--relative_x = ((this_x + (move_x * 4) - 32) + parseInt(game.map_div.style.left)) / 4;

				--if (relative_x >= 0 && relative_x <= 255)
				--{
				--	memory[(object_start + (i * 8)) + 6] = parseInt("1" + get_binary_byte(this_data[6]).substring(1, 8), 2).toString(16);
				--	memory[(object_start + (i * 8)) + 7] = relative_x.toString(16);
				--}
				--else
				--{
				--	memory[(object_start + (i * 8)) + 6] = parseInt("0" + get_binary_byte(this_data[6]).substring(1, 8), 2).toString(16);;
				--	memory[(object_start + (i * 8)) + 7] = "00";
				--}

				memory[(object_start + (i * 8)) + 1] = tohex(this_data[1])
				memory[(object_start + (i * 8)) + 2] = tohex(this_data[2])
				memory[(object_start + (i * 8)) + 3] = tohex(this_data[3])

				--game.set_object_pixel_x(radix_objects[i], this_x + (move_x * 4) - 32);
				--game.set_object_pixel_y(radix_objects[i], this_y + (move_y * 4) - 32);

				sprite_x[i] = this_x + (move_x * 4) - game_page + ((this_page - 1) * 1024)
				sprite_y[i] = this_y + (move_y * 4)

				sprite_z[i] = this_z
				sprite_angle[i] = this_angle
				sprite_sprite[i] = this_sprite
			else
				sprite_x[i] = -100
				sprite_y[i] = -100
			end
		end
	end

	sprite_draw_flag = 1

	while sprite_draw_flag ~= -1 do
		sprite_draw_flag = -1
		sprite_z_min = 10000

		for i = 0, 31 do
			if sprite_flag[i] == 1 then
				--print(sprite_sprite[i])
				if sprite_z[i] <= sprite_z_min then
					sprite_draw_flag = i
					sprite_z_min = sprite_z[i]
				end
			end
		end

		if sprite_draw_flag ~= -1 then
			sprite_flag[sprite_draw_flag] = 0

			if sprite_angle[sprite_draw_flag] == 1 then
				love.graphics.draw(sprites[sprite_sprite[sprite_draw_flag]], sprite_x[sprite_draw_flag] + 32, sprite_y[sprite_draw_flag] - 32, 0, -1, 1)
			elseif sprite_angle[sprite_draw_flag] == 2 then
				love.graphics.draw(sprites[sprite_sprite[sprite_draw_flag]], sprite_x[sprite_draw_flag] + 32, sprite_y[sprite_draw_flag] - 32, 1.5708, 1, 1)
			elseif sprite_angle[sprite_draw_flag] == 3 then
				love.graphics.draw(sprites[sprite_sprite[sprite_draw_flag]], sprite_x[sprite_draw_flag] - 32, sprite_y[sprite_draw_flag] + 32, -1.5708, 1, 1)
			else
				love.graphics.draw(sprites[sprite_sprite[sprite_draw_flag]], sprite_x[sprite_draw_flag] - 32, sprite_y[sprite_draw_flag] - 32)
			end
		end
	end
end

function run_keys()
	if love.keyboard.isDown("left") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber("1" .. string.sub(keydown_byte, 2, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber("0" .. string.sub(keydown_byte, 2, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end

	if love.keyboard.isDown("up") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 1) .. "1" .. string.sub(keydown_byte, 3, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 1) .. "0" .. string.sub(keydown_byte, 3, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end

	if love.keyboard.isDown("right") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 2) .. "1" .. string.sub(keydown_byte, 4, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 2) .. "0" .. string.sub(keydown_byte, 4, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end

	if love.keyboard.isDown("down") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 3) .. "1" .. string.sub(keydown_byte, 5, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 3) .. "0" .. string.sub(keydown_byte, 5, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end

	if love.keyboard.isDown("z") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 4) .. "1" .. string.sub(keydown_byte, 6, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 4) .. "0" .. string.sub(keydown_byte, 6, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end

	if love.keyboard.isDown("x") then
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 5) .. "1" .. string.sub(keydown_byte, 7, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	else
		keydown_byte = get_binary_byte(memory[key_start])
		keydown_byte = tohex(tonumber(string.sub(keydown_byte, 1, 5) .. "0" .. string.sub(keydown_byte, 7, 8), 2))

		if string.len(keydown_byte) == 1 then
			keydown_byte = "0" .. keydown_byte
		end

		memory[key_start] = keydown_byte
	end
end

function draw_background()
	this_rgb = get_byte_color(memory[6])
	love.graphics.setBackgroundColor(this_rgb[0], this_rgb[1], this_rgb[2])

	read_start = map_start + (16 * 12 * 3)

	this_page = tonumber(memory[3], 16)
	this_offset = tonumber(memory[4], 16)

	game_page = (this_page * 1024) - (this_offset * 4)

	read_start = map_start;
	this_counter = 0

	for i = 0, 11 do
		for j = 0, 15 do
			this_tile = tonumber(memory[read_start], 16)
			this_tile_image = tiles[this_tile]
			love.graphics.draw(this_tile_image, (j * 64) - (this_page * 1024) - (this_offset * 4), i * 64)

			map_array[this_counter] = this_tile

			read_start = read_start + 1
			this_counter = this_counter + 1
		end
	end

	for i = 0, 11 do
		for j = 0, 15 do
			this_tile = tonumber(memory[read_start], 16)
			this_tile_image = tiles[this_tile]
			love.graphics.draw(this_tile_image, ((j + 16) * 64) - (this_page * 1024) - (this_offset * 4), i * 64)

			map_array[this_counter] = this_tile

			read_start = read_start + 1
			this_counter = this_counter + 1
		end
	end

	for i = 0, 11 do
		for j = 0, 15 do
			this_tile = tonumber(memory[read_start], 16)
			this_tile_image = tiles[this_tile]
			love.graphics.draw(this_tile_image, ((j + 32) * 64) - (this_page * 1024) - (this_offset * 4), i * 64)

			map_array[this_counter] = this_tile

			read_start = read_start + 1
			this_counter = this_counter + 1
		end
	end
end

function draw_sprite_tiles()
	love.graphics.setCanvas(sprite_canvas)

	for i = 0, 31 do
		read_start = sprite_start + (i * ((4 * 16) + 3))
		color_settings = {}

		bitmap_code = ""

		for j = 0, 2 do
			color_settings[j] = memory[read_start + j]
			bitmap_code = bitmap_code .. memory[read_start + j]
		end

		read_start = read_start + 3

		for j = 0, 15 do
			for k = 0, 3 do
				bitmap_code = bitmap_code .. get_binary_byte(memory[read_start + k])
			end
			read_start = read_start + 4
		end

		read_start = sprite_start + (i * ((4 * 16) + 3)) + 3

		if bitmap_code ~= pixelCodes[i] then
			pixelCodes[i] = bitmap_code
			--game.pixelFlags[i] = 1;

			for j = 0, 15 do
				binary_line = ""

				for k = 0, 3 do
					binary_line = binary_line .. get_binary_byte(memory[read_start + k]);
				end

				for k = 0, 31, 2 do
					this_color = tonumber(string.sub(binary_line, k + 1, k + 2), 2)

					if this_color ~= 0 then
						this_rgb = get_byte_color(color_settings[this_color - 1])

						love.graphics.setColor(this_rgb[0], this_rgb[1], this_rgb[2])
						love.graphics.rectangle("fill", (math.fmod(i, 16) * 64) + ((k / 2) * 4), (math.floor(i / 16) * 64) + (j * 4), 4, 4)
						--var ctx = game.pixelTiles[i].getContext("2d");
						--ctx.fillStyle = this.get_byte_color(color_settings[this_color - 1]);
						--ctx.fillRect((k / 2) * 4, j * 4, 4, 4);
					end
				end

				read_start = read_start + 4
			end
		end
	end

	love.graphics.setCanvas()

	for i = 0, 31 do
		sprites[i] = love.graphics.newImage(sprite_canvas:newImageData(0, none, (math.fmod(i, 16) * 64), (math.floor(i / 16) * 64), 64, 64))
	end
end

function draw_background_tiles()
	love.graphics.setCanvas(tile_canvas)

	for i = 0, 95 do
		read_start = tile_start + (i * ((4 * 16) + 3))
		color_settings = {}

		bitmap_code = ""

		for j = 0, 2 do
			color_settings[j] = memory[read_start + j]
			bitmap_code = bitmap_code .. memory[read_start + j]
		end

		read_start = read_start + 3

		for j = 0, 15 do
			for k = 0, 3 do
				bitmap_code = bitmap_code .. get_binary_byte(memory[read_start + k])
			end
			read_start = read_start + 4
		end

		read_start = tile_start + (i * ((4 * 16) + 3)) + 3

		if bitmap_code ~= pixelCodes[i] then
			pixelCodes[i] = bitmap_code
			--game.pixelFlags[i] = 1;

			for j = 0, 15 do
				binary_line = ""

				for k = 0, 3 do
					binary_line = binary_line .. get_binary_byte(memory[read_start + k]);
				end

				for k = 0, 31, 2 do
					this_color = tonumber(string.sub(binary_line, k + 1, k + 2), 2)

					if this_color ~= 0 then
						this_rgb = get_byte_color(color_settings[this_color - 1])

						love.graphics.setColor(this_rgb[0], this_rgb[1], this_rgb[2])
						love.graphics.rectangle("fill", (math.fmod(i, 16) * 64) + ((k / 2) * 4), (math.floor(i / 16) * 64) + (j * 4), 4, 4)
						--var ctx = game.pixelTiles[i].getContext("2d");
						--ctx.fillStyle = this.get_byte_color(color_settings[this_color - 1]);
						--ctx.fillRect((k / 2) * 4, j * 4, 4, 4);
					end
				end

				read_start = read_start + 4
			end
		end
	end

	love.graphics.setCanvas()

	for i = 0, 95 do
		tiles[i] = love.graphics.newImage(tile_canvas:newImageData(0, none, (math.fmod(i, 16) * 64), (math.floor(i / 16) * 64), 64, 64))
	end
end

function get_memory(this_location)
	return memory[this_location]
end

function set_memory(this_location, this_value)
	memory[this_location] = this_value
end

function store_code(this_code)
	code_bytes = split(this_code, ";")

	for i = 0, tablelength(code_bytes) do
		if code_bytes[i] == undefined then
			break
		elseif string.sub(code_bytes[i], 1, 1) == "$" then
			code_address = tonumber(string.sub(code_bytes[i], 2), 16)
		else
			memory[code_address] = code_bytes[i]
			code_address = code_address + 1
		end
	end
end

function run_code()
	if stop_flag == 0 and memory[1] == "00" then
		for i = 0, 100000 do
			new_code = memory[memory_loc]
			memory_loc = memory_loc + 1
			--print(new_code)

			if new_code == "00" then
				stop_flag = 1
			elseif new_code == "01" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_A = this_value
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(this_value, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "02" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_A = memory[tonumber(this_value, 16)]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "15" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_A = memory[tonumber(this_value, 16) + tonumber(register_X, 16)]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "17" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_A = memory[tonumber(this_value, 16) + tonumber(register_Y, 16)]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "37" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_address_low = memory[tonumber(this_value, 16)]
				if string.len(this_address_low) == 1 then
					this_address_low = "0" .. this_address_low
				end

				this_address_high =  memory[tonumber(this_value, 16) + 1]

				this_address = tonumber(this_address_high .. this_address_low, 16) + tonumber(register_Y, 16)

				register_A = memory[this_address]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "03" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				memory[tonumber(this_value, 16)] = register_A
				memory_loc = memory_loc + 1	
			elseif new_code == "16" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				memory[tonumber(this_value, 16) + tonumber(register_X, 16)] = register_A
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end				
			elseif new_code == "18" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				memory[tonumber(this_value, 16) + tonumber(register_Y, 16)] = register_A
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(register_A, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end	
			elseif new_code == "38" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_address_low = memory[tonumber(this_value, 16)]
				if string.len(this_address_low) == 1 then
					this_address_low = "0" .. this_address_low
				end

				this_address_high =  memory[tonumber(this_value, 16) + 1]

				this_address = tonumber(this_address_high .. "" .. this_address_low, 16) + tonumber(register_Y, 16)

				memory[this_address] = register_A
				memory_loc = memory_loc + 1
			elseif new_code == "04" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_Y = this_value
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_Y), 1, 1))

				if tonumber(this_value, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "05" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_Y = memory[tonumber(this_value, 16)]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_Y), 1, 1))

				if tonumber(register_Y, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "06" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				memory[tonumber(this_value, 16)] = register_Y
				memory_loc = memory_loc + 1
			elseif new_code == "07" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_X = this_value
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_X), 1, 1))

				if tonumber(this_value, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "08" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				register_X = memory[tonumber(this_value, 16)]
				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_X), 1, 1))

				if tonumber(register_X, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			elseif new_code == "09" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" or (memory[memory_loc] == "00" and memory[memory_loc + 1] == "00") do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				memory[tonumber(this_value, 16)] = register_X
				memory_loc = memory_loc + 1
			elseif new_code == "10" then
				this_value = tonumber(register_Y, 16) - 1;

				if this_value < 0 then
					this_value = 255
				end

				if this_value == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end

				register_Y = tohex(this_value)

				if string.len(register_Y) == 1 then
					register_Y = "0" .. register_Y
				end

				bit_N = tonumber(string.sub(get_binary_byte(register_Y), 1, 1))
			elseif new_code == "14" then
				this_value = tonumber(register_X, 16) - 1;

				if this_value < 0 then
					this_value = 255
				end

				if this_value == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end

				register_X = tohex(this_value)

				if string.len(register_X) == 1 then
					register_X = "0" .. register_X
				end

				bit_N = tonumber(string.sub(get_binary_byte(register_X), 1, 1))
			elseif new_code == "20" then
				this_value = tonumber(register_Y, 16) + 1;

				if this_value > 255 then
					this_value = 0
				end

				if this_value == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end

				register_Y = tohex(this_value)

				if string.len(register_Y) == 1 then
					register_Y = "0" .. register_Y
				end

				bit_N = tonumber(string.sub(get_binary_byte(register_Y), 1, 1))
			elseif new_code == "19" then
				this_value = tonumber(register_X, 16) + 1;

				if this_value > 255 then
					this_value = 0
				end

				if this_value == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end

				register_X = tohex(this_value)

				if string.len(register_X) == 1 then
					register_X = "0" .. register_X
				end

				bit_N = tonumber(string.sub(get_binary_byte(register_X), 1, 1))
			elseif new_code == "25" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				memory_loc = this_value
			elseif new_code == "12" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_Z == 0 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "13" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_Z == 1 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "23" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_N == 0 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "24" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_N == 1 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "21" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if tonumber(register_A, 16) < tonumber(memory[tonumber(this_value, 16)], 16) then
					bit_Z = 0
					bit_C = 0
					bit_N = 1
				elseif tonumber(register_A, 16) == tonumber(memory[tonumber(this_value, 16)], 16) then
					bit_Z = 1
					bit_C = 1
					bit_N = 0
				elseif tonumber(register_A, 16) > tonumber(memory[tonumber(this_value, 16)], 16) then
					bit_Z = 0
					bit_C = 1
					bit_N = 0
				end

				memory_loc = memory_loc + 1
			elseif new_code == "22" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if tonumber(register_A, 16) < tonumber(this_value, 16) then
					bit_Z = 0
					bit_C = 0
					bit_N = 1
				elseif tonumber(register_A, 16) == tonumber(this_value, 16) then
					bit_Z = 1
					bit_C = 1
					bit_N = 0
				elseif tonumber(register_A, 16) > tonumber(this_value, 16) then
					bit_Z = 0
					bit_C = 1
					bit_N = 0
				end

				memory_loc = memory_loc + 1
			elseif new_code == "28" then
				bit_C = 0
			elseif new_code == "39" then
				bit_C = 1
			elseif new_code == "26" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_mem_binary = get_binary_byte(memory[tonumber(this_value, 16)])
				this_reg_binary = get_binary_byte(register_A)

				do_and(this_mem_binary, this_reg_binary)

				memory_loc = memory_loc + 1
			elseif new_code == "27" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_mem_binary = get_binary_byte(this_value)
				this_reg_binary = get_binary_byte(register_A)

				do_and(this_mem_binary, this_reg_binary)

				memory_loc = memory_loc + 1
			elseif new_code == "29" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if bit_D == 0 then
					this_sum = tonumber(memory[tonumber(this_value, 16)], 16) + tonumber(register_A, 16) + bit_C

					if this_sum > 255 then
						this_sum = this_sum - 256
						bit_C = 1
					else
						bit_C = 0
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tohex(this_sum)
				else
					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end

					this_addend1 = tonumber(tostring(tonumber(string.sub(memory[tonumber(this_value, 16)], 1, 1), 16)) .. tostring(tonumber(string.sub(memory[tonumber(this_value, 16)], 2, 2), 16)))
					this_addend2 = tonumber(tostring(tonumber(string.sub(register_A, 1, 1), 16)) .. tostring(tonumber(string.sub(register_A, 2, 2), 16)))

					this_sum = this_addend1 + this_addend2 + bit_C

					if this_sum >= 100 then
						this_sum = this_sum - 100
						bit_C = 1
					else
						bit_C = 0
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tostring(this_sum)

					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end
				end

				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))
			elseif new_code == "30" then
				this_value = memory[memory_loc]
				memory_loc = memory_loc + 1

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if bit_D == 0 then
					this_sum = tonumber(this_value, 16) + tonumber(register_A, 16) + bit_C

					if this_sum > 255 then
						this_sum = this_sum - 256
						bit_C = 1
					else
						bit_C = 0
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tohex(this_sum)
				else
					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end

					this_addend1 = tonumber(tostring(tonumber(string.sub(this_value, 1, 1), 16)) .. tostring(tonumber(string.sub(this_value, 2, 2), 16)))
					this_addend2 = tonumber(tostring(tonumber(string.sub(register_A, 1, 1), 16)) .. tostring(tonumber(string.sub(register_A, 2, 2), 16)))

					this_sum = this_addend1 + this_addend2 + bit_C

					if this_sum >= 100 then
						this_sum = this_sum - 100
						bit_C = 1
					else
						bit_C = 0
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tostring(this_sum)

					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end
				end

				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))
			elseif new_code == "31" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if (bit_D == 0) then
					this_sum = tonumber(register_A, 16) - tonumber(memory[tonumber(this_value, 16)], 16) - (1 - bit_C)

					if this_sum < 0 then
						this_sum = this_sum + 256;
						bit_C = 0
					else
						bit_C = 1
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tohex(this_sum)
				else
					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end

					this_subend1 = tonumber(tostring(tonumber(string.sub(memory[tonumber(this_value, 16)], 1, 1), 16)) .. tostring(tonumber(string.sub(memory[tonumber(this_value, 16)], 2, 2), 16)))
					this_subend2 = tonumber(tostring(tonumber(string.sub(register_A, 1, 1), 16)) .. tostring(tonumber(string.sub(register_A, 2, 2), 16)))

					this_sum = this_subend2 - this_subend1 - (1 - bit_C)

					if this_sum < 0 then
						this_sum = this_sum + 100
						bit_C = 0
					else
						bit_C = 1
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tostring(this_sum)

					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end
				end

				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))
			elseif new_code == "32" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				if (bit_D == 0) then
					this_sum = tonumber(register_A, 16) - tonumber(this_value, 16) - (1 - bit_C)

					if this_sum < 0 then
						this_sum = this_sum + 256;
						bit_C = 0
					else
						bit_C = 1
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tohex(this_sum)
				else
					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end

					this_subend1 = tonumber(tostring(tonumber(string.sub(this_value, 1, 1), 16)) .. tostring(tonumber(string.sub(this_value, 2, 2), 16)))
					this_subend2 = tonumber(tostring(tonumber(string.sub(register_A, 1, 1), 16)) .. tostring(tonumber(string.sub(register_A, 2, 2), 16)))

					this_sum = this_subend2 - this_subend1 - (1 - bit_C)

					if this_sum < 0 then
						this_sum = this_sum + 100
						bit_C = 0
					else
						bit_C = 1
					end

					if this_sum == 0 then
						bit_Z = 1
					else
						bit_Z = 0
					end

					register_A = tostring(this_sum)

					if string.len(register_A) == 1 then
						register_A = "0" .. register_A
					end
				end

				memory_loc = memory_loc + 1

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))
			elseif new_code == "33" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_C == 0 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "34" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 1

				if bit_C == 1 then
					memory_loc = this_value
				else
					memory_loc = memory_loc + 1
				end
			elseif new_code == "35" then
				this_value = tonumber(memory[memory_loc] .. memory[memory_loc + 1], 16)
				memory_loc = memory_loc + 2

				this_stack_value = tohex(memory_loc)

				this_length = string.len(this_stack_value)

				for i = 0, 4 - this_length - 1 do
					this_stack_value = "0" .. this_stack_value
				end

				memory[stack_pointer] = string.sub(this_stack_value, 3, 4)
				memory[stack_pointer - 1] = string.sub(this_stack_value, 1, 2)
				stack_pointer = stack_pointer - 2

				memory_loc = this_value
			elseif new_code == "36" then
				stack_pointer = stack_pointer + 2

				this_value = tonumber(memory[stack_pointer - 1] .. memory[stack_pointer], 16)

				memory_loc = this_value
			elseif new_code == "40" then
				this_binary = get_binary_byte(register_A)

				bit_C = string.sub(this_binary, 8, 8)

				this_binary = "0" .. string.sub(this_binary, 1, 7)

				register_A = tohex(tonumber(this_binary, 2))

				if string.len(register_A) == 1 then
					register_A = "0" .. register_A
				end
			elseif new_code == "41" then
				bit_D = 1
			elseif new_code == "42" then
				bit_D = 0
			elseif new_code == "43" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_mem_binary = get_binary_byte(this_value)
				this_reg_binary = get_binary_byte(register_A)

				do_eor(this_mem_binary, this_reg_binary)

				memory_loc = memory_loc + 1
			elseif new_code == "44" then
				this_binary = get_binary_byte(register_A)

				bit_C = string.sub(this_binary, 1, 1)

				this_binary = string.sub(this_binary, 2, 8) .. "0"

				register_A = tohex(tonumber(this_binary, 2))

				if string.len(register_A) == 1 then
					register_A = "0" .. register_A
				end
			elseif new_code == "45" then
				this_value = ""

				while memory[memory_loc] ~= "00" do
					this_value = this_value .. memory[memory_loc]
					memory_loc = memory_loc + 1
				end

				this_mem_binary = get_binary_byte(memory[tonumber(this_value, 16)])
				this_reg_binary = get_binary_byte(register_A)

				do_eor(this_mem_binary, this_reg_binary)

				memory_loc = memory_loc + 1
			elseif new_code == "46" then
				rnd_num = math.random(0, 255)

				register_A = string.format("%x", rnd_num)

				bit_N = tonumber(string.sub(get_binary_byte(register_A), 1, 1))

				if tonumber(rnd_num, 16) == 0 then
					bit_Z = 1
				else
					bit_Z = 0
				end
			else
				stop_flag = 1
			end

			if stop_flag == 1 then
				break
			elseif memory[1] ~= "00" then
				break
			end
		end
	end
end

function do_and(byte1, byte2)
	this_and = 0
	this_byte = ""

	for i = 1, 8 do
		if string.sub(byte1, i, i) == "1" and string.sub(byte2, i, i) == "1" then
			this_byte = this_byte .. "1"
			this_and = 1

			if i == 1 then
				bit_N = 1
			end
		else
			this_byte = this_byte .. "0"
		end
	end

	register_A = tohex(tonumber(this_byte, 2))

	if this_and == 1 then
		bit_Z = 0
	else
		bit_Z = 1
	end
end

function do_eor(byte1, byte2)
	this_and = 0
	this_byte = ""

	for i = 1, 8 do
		if (string.sub(byte1, i, i) == "1" or string.sub(byte2, i, i) == "1") and not(string.sub(byte1, i, i) == "1" and string.sub(byte2, i, i) == "1") then
			this_byte = this_byte .. "1"
			this_and = 1

			if i == 1 then
				bit_N = 1
			end
		else
			this_byte = this_byte .. "0"
		end
	end

	register_A = tohex(tonumber(this_byte, 2))

	if this_and == 1 then
		bit_Z = 0
	else
		bit_Z = 1
	end
end

function get_binary_byte(this_byte)
	this_dec = tonumber(this_byte, 16)
	this_binary = tobinary(this_dec)

	for i = 0, 7 - string.len(this_binary) do
		this_binary = "0" .. this_binary
	end

	return this_binary
end

function get_byte_color(this_num)
	rgb_colors = {}
	binary_num = get_binary_byte(this_num)

	rgb_colors[0] = (tonumber(string.sub(binary_num, 1, 3), 2) * 32) / 255
	rgb_colors[1] = (tonumber(string.sub(binary_num, 4, 6), 2) * 32) / 255
	rgb_colors[2] = (tonumber(string.sub(binary_num, 7, 8), 2) * 64) / 255

	return rgb_colors
end

function get_full_memory(this_location)
	return toCSV(memory)
end

function get_map_memory()
	this_map = memory[map_start]

	for i = map_start + 1, map_start + 191 do
		this_map = this_map .. "," .. memory[i]
	end

	return this_map
end

function split(inputstr, sep)
	counter = 0;

    if sep == nil then
            sep = "%s"
    end

    local t={}

    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
        t[counter] = str
        counter = counter + 1
    end

    return t
end

function tablelength(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

function tobinary(x)
	ret=""
	while x~=1 and x~=0 do
		ret=tostring(x%2)..ret
		x=math.modf(x/2)
	end
	ret=tostring(x)..ret
	return ret
end

function tohex(num)
    local charset = {"0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"}
    local tmp = {}
    repeat
        table.insert(tmp,1,charset[num%16+1])
        num = math.floor(num/16)
    until num==0
    return table.concat(tmp)
end

-- Used to escape "'s by toCSV
function escapeCSV(s)
  if string.find(s, '[,"]') then
    s = '"' .. string.gsub(s, '"', '""') .. '"'
  end
  return s
end

-- Convert from table to CSV string
function toCSV(tt)
  local s = ""
-- ChM 23.02.2014: changed pairs to ipairs 
-- assumption is that fromCSV and toCSV maintain data as ordered array
  for _,p in ipairs(tt) do  
    s = s .. "," .. escapeCSV(p)
  end
  return string.sub(s, 2)      -- remove first comma
end
