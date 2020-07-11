var fs = require('fs');
var exec = require('child_process').exec;

parseTreeString = "";

var radix1;

var color_palette = new Array();
var color_select = 0;
var color_select_color = new Array();
var color_highlight = "#fc8901";

var color_size = 20;
var sprite_size = 30;

var sprite_map = new Array();
var sprite_code = "";

var sprite_codebox;
var sprite;

var editor_div;
var editor;

var rs_editor;

var main_toolbar;
var status_bar;
var tooltip;

var mouse_x;
var mouse_y;

var tooltip_id;
var tooltip_flag = 0;

var asm_file = "";
var radix_folder = "";
var ctrl_flag = 0

var font_size = 13;

var radix1;
var pre_text;

var channels = new Array();

var sound_data_start = 62500;
var sound_start = 62535;

var sound_comments = new Array();

sound_comments[0] = "set volume";
sound_comments[1] = "set frquency start";
sound_comments[2] = "set frquency min";

sound_comments[3] = "set attack";
sound_comments[4] = "set sustain";
sound_comments[5] = "set decay";

sound_comments[6] = "set change amount and speed";
sound_comments[8] = "set vibrato depth";
sound_comments[9] = "set vibrato speed";

sound_comments[10] = "set lowpass cutoff and sweep";
sound_comments[12] = "set highpass cutoff and sweep";

var memory = new Array();

var code_start = 13840;
var tile_start = 5262;
var map_start = 55000;

var tile_canvas = new Array();
var tile_map = new Array();

for (var i = 0; i < 65535; i++)
{
	memory[i] = "00";
}

window.onload = function()
{
	radix1 = new radix();

	if (localStorage.radix_folder != undefined)
		radix_folder = localStorage.radix_folder

	document.body.style.overflow = "hidden";
	document.body.style.backgroundColor = "#252525";

	for (var i = 0; i < 16; i++)
	{
		sprite_map[i] = new Array();

		for (var j = 0; j < 16; j++)
		{
			sprite_map[i][j] = 0;
		}
	}


	var sound_area = document.createElement("div");
	sound_area.id = "sound_area";
	sound_area.style.position = "absolute";

	// set game area location
	sound_area.style.left = "0px";
	sound_area.style.top = "38px";

	// set game area size
	sound_area.style.width = "935px";
	sound_area.style.height = window.innerHeight - 80 + "px";

    if (parseInt(sound_area.style.height) > 775)
    	sound_area.style.height = "775px";

	sound_area.style.overflow = "hidden";

	// set miscelanneous attributes
	sound_area.style.backgroundColor = "#151515";

	document.body.appendChild(sound_area);

	channels[0] = new sound_panel({
		"id": "channel1",
    	"x": 10,
    	"y": 10,
    	"height": 418,
    	"width": 200,
    	"background": "#404040",
    	"font_color": "#00d0ff",
    	"caption": "Channel 1 (Square)",
    	"checked": true
	});

	channels[1] = new sound_panel({
		"id": "channel2",
    	"x": 220,
    	"y": 10,
    	"height": 418,
    	"width": 200,
    	"background": "#404040",
    	"font_color": "#00ff05",
    	"caption": "Channel 2 (Sine)",
    	"checked": false
	});

	channels[2] = new sound_panel({
		"id": "channel3",
    	"x": 430,
    	"y": 10,
    	"height": 418,
    	"width": 200,
    	"background": "#404040",
    	"font_color": "#ffff00",
    	"caption": "Channel 3 (Noise)",
    	"checked": false
	});

	var test_button = document.createElement("div");
	test_button.id = "test_button";
	test_button.style.position = "absolute";

	test_button.style.left = "10px";
	test_button.style.top = "440px";

	test_button.style.width = "40px";
	test_button.style.height = "20px";

	test_button.style.backgroundColor = "#c0c0c0";

	test_button.style.paddingTop = "3px";

	test_button.style.fontFamily = "Arial";
	test_button.style.fontSize = "14px";

	test_button.innerHTML = "<center>Test</center>"

	sound_area.appendChild(test_button);

	sound_codebox = document.createElement("div");
	sound_codebox.id = "sound_codebox";
	sound_codebox.style.position = "absolute";

	// set game area location
	sound_codebox.style.left = "640px";
	sound_codebox.style.top = "10px";

	// set game area size
	sound_codebox.style.width = "270px";
	sound_codebox.style.height = "418px";

	// set miscelanneous attributes
	sound_codebox.style.backgroundColor = "#080808";

	sound_codebox.style.fontFamily = "Courier";
	sound_codebox.style.fontSize = "12px";
	sound_codebox.style.color = "#dddddd";

	sound_codebox.style.userSelect = "text";
	sound_codebox.contentEditable = "true";
	sound_codebox.style.overflowY = "scroll";

	sound_area.appendChild(sound_codebox);
	generate_sound_code();

	test_button.onclick = function()
	{
		var this_file = "";

		for (var i = 0; i < 3; i++)
		{
			for (var j = 0; j < 14; j++)
			{
				if (channels[i].get_box_check() == true)
					this_file += channels[i].get_box_value(j) + ";";
				else
					this_file += "0;";
			}
		}

		var file_name = radix_folder + "\\carts\\tone.txt";
		var tone_length = 1000;

		fs.writeFileSync(file_name, this_file);

		exec("cd " + radix_folder + " & love carts -t " + tone_length, function callback(error, stdout, stderr){
    			// code
			});
	}

	// create element
	var sprite_area = document.createElement("div");
	sprite_area.id = "sprite_area";
	sprite_area.style.position = "absolute";

	// set game area location
	sprite_area.style.left = "0px";
	sprite_area.style.top = "38px";

	// set game area size
	sprite_area.style.width = "935px";
	sprite_area.style.height = window.innerHeight - 80 + "px";

    if (parseInt(sprite_area.style.height) > 775)
    	sprite_area.style.height = "775px";

	sprite_area.style.overflow = "hidden";

	// set miscelanneous attributes
	sprite_area.style.backgroundColor = "#151515";

	// add game area to body of document
	document.body.appendChild(sprite_area);

	var palette = document.createElement("canvas");
	palette.id = "palette";
	palette.style.position = "absolute";

	palette.style.left = "590px";
	palette.style.top = "10px";

	palette.width = 320;
	palette.height = 320;

	sprite_area.appendChild(palette);

	var this_color = 0;

	var ctx = palette.getContext("2d");

	for (var i = 0; i < 16; i++)
	{
		for (var j = 0; j < 16; j++)
		{
			ctx.fillStyle = get_byte_color(this_color.toString(16));
			ctx.fillRect(j * color_size, i * color_size, color_size, color_size);

			color_palette[this_color] = get_byte_color(this_color.toString(16));
			this_color++;
		}
	}

	palette.onmouseup = function(evt)
	{
		var this_x = Math.floor((parseInt(evt.pageX) - parseInt(evt.target.style.left)) / color_size);
		var this_y = Math.floor((parseInt(evt.pageY) - parseInt(evt.target.style.top) - parseInt(sprite_area.style.top)) / color_size);

		var this_color = (this_y * 16) + this_x;
	
		if (color_select != 3)
		{	
			color_select_color[color_select] = this_color;

			var color_area = document.getElementById("color_area_" + color_select);
			color_area.style.backgroundColor = color_palette[this_color];

			var ctx = document.getElementById("sprite").getContext("2d");
			var ctx2 = document.getElementById("preview").getContext("2d");

			for (var i = 0; i < 16; i++)
			{
				for (var j = 0; j < 16; j++)
				{
					if (sprite_map[i][j] == (color_select + 1))
					{
						ctx.fillStyle = color_palette[color_select_color[color_select]];
						ctx.fillRect(j * sprite_size, i * sprite_size, sprite_size, sprite_size);

						ctx2.fillStyle = color_palette[color_select_color[color_select]];
						ctx2.fillRect(j * 4, i * 4, 4, 4);
					}
				}
			}
		}

		generate_code();
	}

	sprite = document.createElement("canvas");
	sprite.id = "sprite";
	sprite.style.position = "absolute";

	sprite.style.left = "10px";
	sprite.style.top = "10px";

	sprite.width = 480;
	sprite.height = 480;

	sprite_area.appendChild(sprite);

	var ctx = sprite.getContext("2d");

	for (var i = 0; i < 16; i++)
	{
		for (var j = 0; j < 16; j++)
		{
			ctx.fillStyle = "#303030"
			ctx.fillRect((j * sprite_size) + 2, (i * sprite_size) + 2, sprite_size - 4, sprite_size - 4);
		}
	}

	sprite.onmouseup = function(evt)
	{
		var this_x = Math.floor((parseInt(evt.pageX) - parseInt(evt.target.style.left)) / sprite_size);
		var this_y = Math.floor((parseInt(evt.pageY) - parseInt(evt.target.style.top) - parseInt(sprite_area.style.top)) / sprite_size);

		if (color_select != 3)
		{
			var ctx = evt.target.getContext("2d");

			ctx.fillStyle = color_palette[color_select_color[color_select]];
			ctx.fillRect(this_x * sprite_size, this_y * sprite_size, sprite_size, sprite_size);

			var ctx2 = document.getElementById("preview").getContext("2d");

			ctx2.fillStyle = color_palette[color_select_color[color_select]];
			ctx2.fillRect(this_x * 4, this_y * 4, 4, 4);

			sprite_map[this_y][this_x] = color_select + 1;
		}
		else
		{
			var ctx = evt.target.getContext("2d");

			ctx.clearRect(this_x * sprite_size, this_y * sprite_size, sprite_size, sprite_size);

			ctx.fillStyle = "#303030"
			ctx.fillRect((this_x * sprite_size) + 2, (this_y * sprite_size) + 2, sprite_size - 4, sprite_size - 4);

			var ctx2 = document.getElementById("preview").getContext("2d");

			ctx2.clearRect(this_x * 4, this_y * 4, 4, 4);

			sprite_map[this_y][this_x] = 0;
		}

		generate_code();
	}

	for (var i = 0; i < 4; i++)
	{
		var color_area = document.createElement("div");
		color_area.id = "color_area_" + i;
		color_area.style.position = "absolute";

		// set game area location
		color_area.style.left = "510px";
		color_area.style.top = (10 + (60 * i)) + "px";

		// set game area size
		color_area.style.width = "40px";
		color_area.style.height = "40px";

		// set miscelanneous attributes
		color_area.style.backgroundColor = color_palette[0];
		color_select_color[i] = 0;

		color_area.style.borderStyle = "solid";		
		color_area.style.borderColor = color_highlight;

		if (i == 0)
			color_area.style.borderWidth = "2px";
		else
			color_area.style.borderWidth = "0px";

		if (i == 3)
			color_area.innerHTML = "<img id = 'colorerase_3' src = 'lib/erase1.png'>";

		// add game area to body of document
		sprite_area.appendChild(color_area);

		color_area.onmouseup = function(evt)
		{
			color_select = parseInt(evt.target.id.substr(11, 1));

			for (var i = 0; i < 4; i++)
			{
				var color_area = document.getElementById("color_area_" + i);

				if (i == color_select)
				{
					color_area.style.left = "508px";
					color_area.style.borderWidth = "2px";
				}
				else
				{
					color_area.style.left = "510px";
					color_area.style.borderWidth = "0px";				
				}
			}
		}
	}

	var map_code = document.createElement("div");
	map_code.id = "map_code_" + i;
	map_code.style.position = "absolute";

	// set game area location
	map_code.style.left = "510px";
	map_code.style.top = (10 + (60 * i)) + "px";

	// set game area size
	map_code.style.width = "40px";
	map_code.style.height = "40px";

	// set miscelanneous attributes
	map_code.style.backgroundColor = color_palette[3];

	map_code.style.borderStyle = "solid";		
	map_code.style.borderColor = color_highlight;

	map_code.style.borderWidth = "0px";

	map_code.innerHTML = "<img id = 'colorerase_3' src = 'lib/mapcode.png'>";	

	sprite_area.appendChild(map_code);

	map_code.onmouseup = function(evt)
	{
		extract_code();
	}

	var preview = document.createElement("canvas");
	preview.id = "preview";
	preview.style.position = "absolute";

	preview.style.left = "590px";
	preview.style.top = "350px";

	preview.width = 64;
	preview.height = 64;

	preview.style.backgroundColor = "#000000";

	sprite_area.appendChild(preview);

	sprite_codebox = document.createElement("div");
	sprite_codebox.id = "sprite_codebox";
	sprite_codebox.style.position = "absolute";

	// set game area location
	sprite_codebox.style.left = "10px";
	sprite_codebox.style.top = "500px";

	// set game area size
	sprite_codebox.style.width = "910px";
	sprite_codebox.style.height = parseInt(sprite_area.style.height) - 510 + "px";

	// set miscelanneous attributes
	sprite_codebox.style.backgroundColor = "#080808";

	sprite_codebox.style.fontFamily = "Courier";
	sprite_codebox.style.fontSize = "12px";
	sprite_codebox.style.color = "#dddddd";

	sprite_codebox.style.userSelect = "text";
	sprite_codebox.contentEditable = "true";
	sprite_codebox.style.overflowY = "scroll";

	sprite_area.appendChild(sprite_codebox);

	rscript_check = document.createElement("input");
	rscript_check.id = "rscript_check";
	rscript_check.style.position = "absolute";
	rscript_check.type = "checkbox";

	rscript_check.style.left = "510px";
	rscript_check.style.top = "470px";

	rscript_check.checked = true;

	sprite_area.appendChild(rscript_check);

	rscript_check_label = document.createElement("div");
	rscript_check_label.style.position = "absolute";

	rscript_check_label.style.top = "471px";
	rscript_check_label.style.left = "530px";

	rscript_check_label.style.color = "#00ff05";
	rscript_check_label.style.fontFamily = "Arial";
	rscript_check_label.style.fontSize = "14px";

	rscript_check_label.innerHTML = "RScript Code";

	sprite_area.appendChild(rscript_check_label);

	asm_check = document.createElement("input");
	asm_check.id = "asm_check";
	asm_check.style.position = "absolute";
	asm_check.type = "checkbox";

	asm_check.style.left = "650px";
	asm_check.style.top = "470px";

	sprite_area.appendChild(asm_check);

	asm_check_label = document.createElement("div");
	asm_check_label.style.position = "absolute";

	asm_check_label.style.top = "471px";
	asm_check_label.style.left = "670px";

	asm_check_label.style.color = "#ffff00";
	asm_check_label.style.fontFamily = "Arial";
	asm_check_label.style.fontSize = "14px";

	asm_check_label.innerHTML = "Assembly Code";

	sprite_area.appendChild(asm_check_label);

	rscript_check.onclick = function(evt)
	{
		if (this.checked == true)
			document.getElementById("asm_check").checked = false;
		else
			document.getElementById("asm_check").checked = true;

		generate_code();
	}

	asm_check.onclick = function(evt)
	{
		if (this.checked == true)
			document.getElementById("rscript_check").checked = false;
		else
			document.getElementById("rscript_check").checked = true;

		generate_code();
	}

	generate_code();


	var map_area = document.createElement("div");
	map_area.id = "map_area";
	map_area.style.position = "absolute";

	// set game area location
	map_area.style.left = "0px";
	map_area.style.top = "38px";

	// set game area size
	map_area.style.width = "1235px";
	map_area.style.height = window.innerHeight - 80 + "px";

    if (parseInt(map_area.style.height) > 775)
    	map_area.style.height = "775px";

	map_area.style.overflow = "hidden";

	// set miscelanneous attributes
	map_area.style.backgroundColor = "#151515";

	// add game area to body of document
	document.body.appendChild(map_area);

	var map_tiles = document.createElement("div");
	map_tiles.id = "map_tiles";
	map_tiles.style.position = "absolute";

	map_tiles.style.left = "10px";
	map_tiles.style.top = "10px";

	map_tiles.style.width = "140px";
	map_tiles.style.height = "500px";

	map_tiles.style.backgroundColor = "#2f4756";

	map_tiles.style.overflowY = "scroll";

	map_area.appendChild(map_tiles);

	var map_div = document.createElement("div");
	map_div.id = "map_div";
	map_div.style.position = "absolute";

	map_div.style.left = "170px";
	map_div.style.top = "10px";

	map_div.style.width = "1035px";
	map_div.style.height = "500px";

	map_div.style.backgroundColor = "#10191e";

	map_div.style.overflowY = "scroll";

	map_area.appendChild(map_div);

	var map_canvas = document.createElement("canvas");
	map_canvas.id = "map_canvas";
	map_canvas.style.position = "absolute";

	map_canvas.style.left = "0px";
	map_canvas.style.top = "0px";

	map_canvas.width = 1024;
	map_canvas.height = 768;

	map_canvas.style.overflowY = "scroll";

	map_div.appendChild(map_canvas);

	map_div.onmousemove = function(e)
	{
		var this_x = Math.floor((e.pageX  - 170) / 64);
		var this_y = Math.floor((e.pageY + parseInt(this.scrollTop) - 48) / 64);

		var marker2 = document.getElementById("map_marker");
		marker2.style.left = (this_x * 64) + "px";
		marker2.style.top = (this_y * 64) + "px";
	}

	for (var i = 0; i < 12; i++)
	{
		tile_map[i] = new Array();

		for (var j = 0; j < 16; j++)
		{
			tile_map[i][j] = 0;
		}
	}

	var map_marker = document.createElement("img");
	map_marker.id = "map_marker";
	map_marker.style.position = "absolute";

	map_marker.style.left = "-100px";
	map_marker.style.top = "-100px";

	map_marker.style.width = "64px";
	map_marker.style.height = "64px";

	map_marker.src = "lib/marker2.png";

	map_marker.style.overflowY = "scroll";

	map_div.appendChild(map_marker);

	map_marker.onmouseup = function(e)
	{
		var this_x = Math.floor((e.pageX - 170) / 64);
		var this_y = Math.floor((e.pageY + parseInt(document.getElementById("map_div").scrollTop) - 48) / 64);

		var marker2 = document.getElementById("tile_marker");
		var tile_select = ((parseInt(marker2.style.top) / 64) * 2) + (parseInt(marker2.style.left) / 64);

		var ctx = document.getElementById("map_canvas").getContext("2d");
		ctx.clearRect(this_x * 64, this_y * 64, 64, 64);
		ctx.drawImage(tile_canvas[tile_select], this_x * 64, this_y * 64);

		tile_map[this_y][this_x] = tile_select;

		generate_map_code();
	}

	var rload_button = document.createElement("div");
	rload_button.id = "rload_button";
	rload_button.style.position = "absolute";

	rload_button.style.left = "10px";
	rload_button.style.top = "540px";

	rload_button.style.width = "60px";
	rload_button.style.height = "20px";

	rload_button.style.backgroundColor = "#c0c0c0";

	rload_button.style.paddingTop = "5px";

	rload_button.style.fontFamily = "Arial";
	rload_button.style.fontSize = "12px";

	rload_button.innerHTML = "<center>Load R</center>"

	map_area.appendChild(rload_button);

	rload_button.onclick = function() {
		compile_script();
		compile_program(2);
	}

	for (var i = 0; i < 96; i++)
	{
		tile_canvas[i] = document.createElement("canvas");

		tile_canvas[i].id = "palette";
		tile_canvas[i].style.position = "absolute";

		tile_canvas[i].style.left = ((i % 2) * 64) + "px";
		tile_canvas[i].style.top = (Math.floor(i / 2) * 64) + "px";

		tile_canvas[i].width = 64;
		tile_canvas[i].height = 64;

		map_tiles.appendChild(tile_canvas[i]);

		tile_canvas[i].onmouseup = function(e)
		{
			var marker2 = document.getElementById("tile_marker");
			marker2.style.left = this.style.left;
			marker2.style.top = this.style.top;
		}
	}

	var tile_marker = document.createElement("img");
	tile_marker.id = "tile_marker";
	tile_marker.style.position = "absolute";

	tile_marker.style.left = "0px";
	tile_marker.style.top = "0px";

	tile_marker.style.width = "64px";
	tile_marker.style.height = "64px";

	tile_marker.src = "lib/marker2.png";

	tile_marker.style.overflowY = "scroll";

	map_tiles.appendChild(tile_marker);

	map_codebox = document.createElement("div");
	map_codebox.id = "map_codebox";
	map_codebox.style.position = "absolute";

	// set game area location
	map_codebox.style.left = "170px";
	map_codebox.style.top = "520px";

	// set game area size
	map_codebox.style.width = "1035px";
	map_codebox.style.height = parseInt(sprite_area.style.height) - 530 + "px";

	// set miscelanneous attributes
	map_codebox.style.backgroundColor = "#080808";

	map_codebox.style.fontFamily = "Courier";
	map_codebox.style.fontSize = "12px";
	map_codebox.style.color = "#dddddd";

	map_codebox.style.userSelect = "text";
	map_codebox.contentEditable = "true";
	map_codebox.style.overflowY = "scroll";

	map_area.appendChild(map_codebox);

	var upload_code = document.createElement("div");
	upload_code.id = "upload_code_" + i;
	upload_code.style.position = "absolute";

	// set game area location
	upload_code.style.left = "124px";
	upload_code.style.top = "520px";

	// set game area size
	upload_code.style.width = "40px";
	upload_code.style.height = "40px";

	// set miscelanneous attributes
	upload_code.style.backgroundColor = color_palette[3];

	upload_code.style.borderStyle = "solid";		
	upload_code.style.borderColor = color_highlight;

	upload_code.style.borderWidth = "0px";

	upload_code.innerHTML = "<img id = 'colorerase_3' src = 'lib/mapcode.png'>";	

	map_area.appendChild(upload_code);

	upload_code.onmouseup = function(evt)
	{
		compile_script();
		compile_program(2);
		extract_map_code();
	}


	editor_div = document.createElement("div");
	editor_div.id = "editor";
	editor_div.style.position = "absolute";

	editor_div.style.top = "38px";
	editor_div.style.left = "0px";

	editor_div.style.width = window.innerWidth - parseInt(editor_div.style.left) + "px";
	editor_div.style.height = window.innerHeight - parseInt(editor_div.style.top) - 20 + "px";

	document.body.appendChild(editor_div);

	editor = ace.edit("editor");
	editor.setShowPrintMargin(false);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/lisp");

	document.getElementById('editor').style.fontSize = font_size + "px";


	rs_editor_div = document.createElement("div");
	rs_editor_div.id = "rs_editor";
	rs_editor_div.style.position = "absolute";

	rs_editor_div.style.top = "38px";
	rs_editor_div.style.left = "0px";

	rs_editor_div.style.width = window.innerWidth - parseInt(rs_editor_div.style.left) + "px";
	rs_editor_div.style.height = window.innerHeight - parseInt(rs_editor_div.style.top) - 20 + "px";

	document.body.appendChild(rs_editor_div);

	rs_editor = ace.edit("rs_editor");
	rs_editor.setShowPrintMargin(false);
    rs_editor.setTheme("ace/theme/monokai");
    rs_editor.session.setMode("ace/mode/lua");
    rs_editor.session.setOption("useWorker", false);
	rs_editor.session.setUseWrapMode(true);

	//rs_editor.session.setOptions({
    //	indentedSoftWrap: false
	//});

	document.getElementById('rs_editor').style.fontSize = font_size + "px";


    main_toolbar = new toolbar({
    	"id": "main_toolbar",
    	"x": 0,
    	"y": 0,
    	"height": "38",
    	"width": window.innerWidth,
    	"background": "#202020",
    	"button_width": 28,
    	"button_gap": 8,
    	"back_color": "#0a482a",
    	"hover_color": "#505050"
    });

    main_toolbar.add_button("lib/openbutton.png", "Open", function()
    {
    	if (editor_div.style.zIndex == 10)
    		document.getElementById("loadDialog").accept = ".asm";
    	else
    		document.getElementById("loadDialog").accept = ".rl";

    	chooseFile("#loadDialog");
    });

	main_toolbar.add_button("lib/savebutton.png", "Save", function()
    {
   		if (asm_file != "")
   		{
   			fs.writeFile(asm_file, editor.getValue(), function (err) {
	      		if (err) throw err;

	    		console.log("File saved.");
	    		status_bar.innerHTML = "Saved " + asm_file;
	    		setTimeout(clear_status, 1000);
	    	});
   		}

   		editor.focus();
    });

    main_toolbar.add_button("lib/saveasbutton.png", "Save as", function()
    {
    	if (editor_div.style.zIndex == 10)
    		document.getElementById("saveDialog").accept = ".asm";
    	else
    		document.getElementById("saveDialog").accept = ".rl";

    	chooseFile("#saveDialog");
    });

    main_toolbar.add_blank();

    main_toolbar.add_button("lib/scriptbutton.png", "REAL editor", function()
    {
    	sprite_area.style.zIndex = 9;
    	map_area.style.zIndex = 9;
    	sound_area.style.zIndex = 9;
    	editor_div.style.zIndex = 9;
    	rs_editor_div.style.zIndex = 10;

		rs_editor.focus();
    });

    main_toolbar.add_button("lib/codebutton.png", "Assembly editor", function()
    {
    	sprite_area.style.zIndex = 9;
    	map_area.style.zIndex = 9;
    	sound_area.style.zIndex = 9;
    	editor_div.style.zIndex = 10;
    	rs_editor_div.style.zIndex = 9;

		editor.focus();
    });

	main_toolbar.add_blank();

    main_toolbar.add_button("lib/spritebutton.png", "Sprite editor", function()
    {
    	sprite_area.style.zIndex = 11;
    	map_area.style.zIndex = 9;
    	sound_area.style.zIndex = 9;
    	//editor_div.style.zIndex = 9;
    });

	main_toolbar.add_button("lib/mapbutton.png", "Map editor", function()
    {
    	sprite_area.style.zIndex = 9;
    	map_area.style.zIndex = 11;
    	sound_area.style.zIndex = 9;
    	//editor_div.style.zIndex = 9;
    });

	main_toolbar.add_button("lib/fxbutton.png", "Sound editor", function()
    {
    	sound_area.style.zIndex = 11;
    	map_area.style.zIndex = 9;
    	sprite_area.style.zIndex = 9;
    	//editor_div.style.zIndex = 9;
    });

    main_toolbar.add_blank();

    main_toolbar.add_button("lib/rfolderbutton.png", "Radix folder", function()
    {
    	chooseFile("#radixDialog");
    });

    main_toolbar.add_button("lib/compilebutton.png", "Compile code", function()
    {
    	if (editor_div.style.zIndex == 10)
    	{
	    	if (radix_folder != "" && asm_file != "")
	    	{
	    		compile_program(0);
	    	}
    	}
    	else
    	{
    		compile_script();
    	}
    });

    main_toolbar.add_button("lib/playbutton.png", "Run program", function()
    {
    	if (radix_folder != "" && asm_file != "")
    	{
    		compile_program(1);
    	}
    });

    status_bar = document.createElement("div");
    status_bar.id = "status_bar";
    status_bar.style.position = "absolute";

    status_bar.style.left = "0px";
    status_bar.style.top = 38 + parseInt(editor_div.style.height) + "px";

    status_bar.style.width = window.innerWidth + "px";
    status_bar.style.height = "20px";

    status_bar.style.backgroundColor = "#c0c0c0";
    status_bar.style.color_select = "#101010";
    status_bar.style.fontSize = "12px";
    status_bar.style.fontFamily = "Arial";

    status_bar.style.paddingTop = "3px";
    status_bar.style.paddingLeft = "3px";

    status_bar.style.zIndex = 11;

    document.body.appendChild(status_bar);

    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";

    tooltip.style.left = "-1000px";
    tooltip.style.top = "0px";

    tooltip.style.backgroundColor = "#c0c0c0";
    tooltip.style.color_select = "#101010";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontFamily = "Arial";

    tooltip.style.paddingTop = "1px";
    tooltip.style.paddingLeft = "1px";
    tooltip.style.paddingRight = "2px";

    tooltip.style.zIndex = 1000;

    document.body.appendChild(tooltip);

	fs.readFile("text.asm", 'utf8', function (err, this_code) 
    {
    	if (err) 
        {
        	return console.log(err);
    	}

		pre_text = this_code;
	});

	sprite_area.style.zIndex = 9;
	sound_area.style.zIndex = 9;
	editor_div.style.zIndex = 9;
	rs_editor_div.style.zIndex = 10;

    rs_editor.focus();
}

window.onresize = function()
{
	editor_div.style.width = window.innerWidth - parseInt(editor_div.style.left) + "px";
	editor_div.style.height = window.innerHeight - parseInt(editor_div.style.top) - 20 + "px";

	rs_editor_div.style.width = window.innerWidth - parseInt(editor_div.style.left) + "px";
	rs_editor_div.style.height = window.innerHeight - parseInt(editor_div.style.top) - 20 + "px";

	main_toolbar.set_width(window.innerWidth);

    status_bar.style.top = 38 + parseInt(editor_div.style.height) + "px";
    status_bar.style.width = window.innerWidth + "px";

    sprite_area.style.height = window.innerHeight - 80 + "px";
    document.getElementById("map_area").style.height = window.innerHeight - 80 + "px";

    if (parseInt(sprite_area.style.height) > 775)
    	sprite_area.style.height = "775px";

	sprite_codebox.style.height = parseInt(sprite_area.style.height) - 510 + "px";
}

window.onkeydown = function(e) 
{
	evt = e || window.event;

	if (evt.keyCode == 17)
	{
		ctrl_flag = 1;
	}
	else if (evt.keyCode == 83)
	{
		if (ctrl_flag == 1 && asm_file != "")
   		{
   			if (editor_div.style.zIndex == 10)
    		{
	   			fs.writeFile(asm_file, editor.getValue(), function (err) {
		      		if (err) throw err;

		    		console.log("File saved.");
		    		status_bar.innerHTML = "Saved " + asm_file;
		    		setTimeout(clear_status, 1000);
		    	});
	   		}
	   		else
    		{
	   			fs.writeFile(asm_file, rs_editor.getValue(), function (err) {
		      		if (err) throw err;

		    		console.log("File saved.");
		    		status_bar.innerHTML = "Saved " + asm_file;
		    		setTimeout(clear_status, 1000);
		    	});
	   		}
   		}
	}
	else if (evt.keyCode == 79)
	{
		if (ctrl_flag == 1)
		{
			chooseFile("#loadDialog");
		}
	}
	else if (evt.keyCode == 187)
	{
		if (ctrl_flag == 1)
		{
			font_size += 1

			if (font_size > 20)
				font_size = 20;

			document.getElementById('editor').style.fontSize = font_size + "px";
			document.getElementById('rs_editor').style.fontSize = font_size + "px";
		}
	}
	else if (evt.keyCode == 189)
	{
		if (ctrl_flag == 1)
		{
			font_size -= 1

			if (font_size < 10)
				font_size = 10;

			document.getElementById('editor').style.fontSize = font_size + "px";
			document.getElementById('rs_editor').style.fontSize = font_size + "px";
		}
	}
	else if (evt.keyCode == 116)
	{
		if (radix_folder != "" && asm_file != "")
    	{
    		compile_program(1)
    	}
	}
}

window.onkeyup = function(e) 
{
	evt = e || window.event;

	if (evt.keyCode == 17)
	{
		ctrl_flag = 0;
	}
}

window.onmousemove = function(e)
{
	mouse_x = e.pageX;
	mouse_y = e.pageY;
}

compile_program = function(run_program)
{
	var compile_flag = 0;

	try
	{
		parseTreeString = "";
		radixasm.parse(editor.getValue().replaceAll("\t", " "));

		parseTreeString = "";
		radixasm.parse(editor.getValue().replaceAll("\t", " "));

		status_bar.innerHTML = "Program compiled correctly; no errors.";
	    setTimeout(clear_status, 2000);

	    compile_flag = 1;
		//console.log(parseTreeString);
	}
	catch (e)
	{
		status_bar.innerHTML = "Program failed to compile.";
	    setTimeout(clear_status, 2000);

		console.log(e.message);
	}

	if (compile_flag == 1)
	{
		var program_name = asm_file.substring(asm_file.lastIndexOf("\\") + 1, asm_file.length - 3);

		var file_name = radix_folder + "\\carts\\" + program_name + ".rdx";

		fs.writeFileSync(file_name, parseTreeString);

		if (run_program == 1)
		{
			exec("cd " + radix_folder + " & love carts " + program_name, function callback(error, stdout, stderr){
				fs.readFile(process.env.APPDATA + "\\LOVE\\carts\\output.txt", 'utf8', function (err, this_output) 
		        {
		        	if (err) 
		            {
		            	return console.log(err);
		        	}

		        	else if (this_output != "")
		        	{
		    			alert(this_output);
		    		}
		    	});

    			//output_file = fs.readFileSync("%appdata%\\LOVE\\carts\\output.txt", "utf8");
    			//console.log(output_file);
			});
		}
		else if (run_program == 2)
		{
			load_code(parseTreeString);
			load_tiles();
		}
	}
}

compile_script = function()
{
	var compile_flag = 0;

	try
	{
		parseTreeString = "";
		st_pt = 0;
		pt = 0;
		sub_count = 0;
		statementString = "";

		rscript.parse(rs_editor.getValue().replaceAll("\t", " "));

		status_bar.innerHTML = "Program compiled correctly; no errors.";
	    setTimeout(clear_status, 2000);

	    compile_flag = 1;
	    parseTreeString = parseTreeString.replaceAll("--\n", "");
		//console.log(parseTreeString);

	    editor.setValue(pre_text + parseTreeString);
    	editor.selection.clearSelection();
		editor.navigateFileStart();
		editor.focus();
	}
	catch (e)
	{
		status_bar.innerHTML = "Program failed to compile.";
	    setTimeout(clear_status, 2000);

		console.log(e.stack);
		//console.log(statementString);
	}	
}

load_code = function(this_code)
{
	var code_bytes = this_code.split(";");
	var code_address = code_start;

	for (var i = 0; i < code_bytes.length; i++)
	{
		if (code_bytes[i].substr(0, 1) == "$")
		{
			code_address = parseInt("0x" + code_bytes[i].substr(1, code_bytes[i].length - 1));	
		}
		else
		{
			memory[code_address] = code_bytes[i];
			code_address++;
		}
	}
}

load_tiles = function()
{
	for (var i = 0; i < 96; i++)
	{
		var read_start = tile_start + (i * ((4 * 16) + 3));
		var color_settings = new Array();

		var bitmap_code = "";

		for (var j = 0; j < 3; j++)
		{
			color_settings[j] = memory[read_start + j];
			bitmap_code += memory[read_start + j];
		}

		read_start += 3;

		for (j = 0; j < 16; j++)
		{
			for (k = 0; k < 4; k++)
				bitmap_code += get_binary_byte(memory[read_start + k]);

			read_start += 4;
		}

		read_start = tile_start + (i * ((4 * 16) + 3)) + 3;

		for (j = 0; j < 16; j++)
		{
			var binary_line = "";

			for (k = 0; k < 4; k++)
				binary_line += get_binary_byte(this.memory[read_start + k]);

			for (k = 0; k < 32; k += 2)
			{
				this_color = parseInt(binary_line.substr(k, 2), 2);

				if (this_color != 0)
				{
					var ctx = tile_canvas[i].getContext("2d");
					ctx.fillStyle = get_byte_color(color_settings[this_color - 1]);
					ctx.fillRect((k / 2) * 4, j * 4, 4, 4);
				}
			}

			read_start += 4;
		}
	}
}

clear_status = function()
{
	status_bar.innerHTML = "";
}

move_tooltip = function()
{
	tooltip.style.left = mouse_x + 12 + "px";
	tooltip.style.top = mouse_y + 4 + "px";
}

function chooseFile(name) 
{
	var chooser = document.querySelector(name);

	chooser.addEventListener("change", function(evt) {
  		if (name == "#loadDialog")
  		{
  			asm_file = this.value;

  			fs.readFile(this.value, 'utf8', function (err, this_code) 
	        {
	        	if (err) 
	            {
	            	return console.log(err);
	        	}

	    		status_bar.innerHTML = "Opened " + asm_file;
	    		setTimeout(clear_status, 1000);

	    		if (editor_div.style.zIndex == 10)
	    		{
		        	editor.setValue(this_code);
		        	editor.selection.clearSelection();
					editor.navigateFileStart();
					editor.focus();
				}
				else
				{
		        	rs_editor.setValue(this_code);
		        	rs_editor.selection.clearSelection();
					rs_editor.navigateFileStart();
					rs_editor.focus();
				}
	    	});
  		}
  		else if (name == "#saveDialog")
  		{
  			asm_file = this.value;

  			if (editor_div.style.zIndex == 10)
	    	{
	  			fs.writeFile(asm_file, editor.getValue(), function (err) {
		      		if (err) throw err;
		    		console.log("File saved.");
		    	});

		    	editor.focus();
	    	}
	    	else
	    	{
	  			fs.writeFile(asm_file, rs_editor.getValue(), function (err) {
		      		if (err) throw err;
		    		console.log("File saved.");
		    	});

		    	rs_editor.focus();
	    	}
  		}
  		else if (name == "#radixDialog")
  		{
  			localStorage.radix_folder = this.value;
  		}
	}, false);

	chooser.click();  
}

function sound_panel(this_data)
{
	this.boxes = new Array();

	this.panel_div = document.createElement("div");
	this.panel_div.id = this_data.id;
	this.panel_div.style.position = "absolute";

	this.panel_div.style.top = this_data.y + "px";
	this.panel_div.style.left = this_data.x + "px";

	this.panel_div.style.width = this_data.width + "px";
	this.panel_div.style.height = this_data.height + "px";

	this.panel_div.style.backgroundColor = this_data.background;

	document.getElementById("sound_area").appendChild(this.panel_div);

	this.panel_check = document.createElement("input");
	this.panel_check.id = this_data.id + "_check";
	this.panel_check.style.position = "absolute";
	this.panel_check.type = "checkbox";

	this.panel_check.checked = this_data.checked;

	this.panel_check.style.top = "4px";
	this.panel_check.style.left = "5px";

	document.getElementById(this_data.id).appendChild(this.panel_check);

	this.panel_check.onclick = function()
	{
		generate_sound_code();
	}

	this.panel_label = document.createElement("div");
	this.panel_label.style.position = "absolute";

	this.panel_label.style.top = "5px";
	this.panel_label.style.left = "27px";

	this.panel_label.style.color = this_data.font_color;
	this.panel_label.style.fontFamily = "Arial";
	this.panel_label.style.fontSize = "14px";

	this.panel_label.innerHTML = this_data.caption;

	document.getElementById(this_data.id).appendChild(this.panel_label);

	this.boxes[0] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 34,
		"font_color": "#e0e0e0",
		"caption": "Volume:",
		"min": 0,
		"max": 255,
		"default": 100
	});

	this.boxes[1] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 54,
		"font_color": "#e0e0e0",
		"caption": "Frequency Start:",
		"min": 0,
		"max": 255,
		"default": 100
	});

	this.boxes[2] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 74,
		"font_color": "#e0e0e0",
		"caption": "Frequency Min:",
		"min": 0,
		"max": 255,
		"default": 0
	});

	this.boxes[3] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 114,
		"font_color": "#e0e0e0",
		"caption": "Attack:",
		"min": 0,
		"max": 255,
		"default": 10
	});

	this.boxes[4] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 134,
		"font_color": "#e0e0e0",
		"caption": "Sustain:",
		"min": 0,
		"max": 255,
		"default": 50
	});

	this.boxes[5] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 154,
		"font_color": "#e0e0e0",
		"caption": "Decay:",
		"min": 0,
		"max": 255,
		"default": 10
	});

	this.boxes[6] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 194,
		"font_color": "#e0e0e0",
		"caption": "Change Amount:",
		"min": 0,
		"max": 15,
		"default": 8
	});

	this.boxes[7] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 214,
		"font_color": "#e0e0e0",
		"caption": "Change Speed:",
		"min": 0,
		"max": 15,
		"default": 0
	});

	this.boxes[8] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 254,
		"font_color": "#e0e0e0",
		"caption": "Vibrato Depth:",
		"min": 0,
		"max": 255,
		"default": 0
	});

	this.boxes[9] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 274,
		"font_color": "#e0e0e0",
		"caption": "Vibrato Speed:",
		"min": 0,
		"max": 255,
		"default": 0
	});

	this.boxes[10] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 314,
		"font_color": "#e0e0e0",
		"caption": "Lowpass Cutoff:",
		"min": 0,
		"max": 15,
		"default": 15
	});

	this.boxes[11] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 334,
		"font_color": "#e0e0e0",
		"caption": "Lowpass Sweep:",
		"min": 0,
		"max": 15,
		"default": 8
	});

	this.boxes[12] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 374,
		"font_color": "#e0e0e0",
		"caption": "Highpass Cutoff:",
		"min": 0,
		"max": 15,
		"default": 0
	});

	this.boxes[13] = new sound_box({
		"panel_id": this_data.id,
		"id": this_data.id + "_box_0",
		"x": 8,
		"y": 394,
		"font_color": "#e0e0e0",
		"caption": "Highpass Sweep:",
		"min": 0,
		"max": 15,
		"default": 8
	});

	this.get_box_value = function(this_num)
	{
		return this.boxes[this_num].get_value();
	}

	this.get_box_check = function()
	{
		return this.panel_check.checked
	}
}

function sound_box(this_data)
{
	this.box_label = document.createElement("div");
	this.box_label.id = this_data.id + "_label";
	this.box_label.style.position = "absolute";

	this.box_label.style.top = this_data.y + "px";
	this.box_label.style.left = this_data.x + "px";

	this.box_label.style.color = this_data.font_color;
	this.box_label.style.fontFamily = "Arial";
	this.box_label.style.fontSize = "12px";	

	this.box_label.innerHTML = this_data.caption;

	document.getElementById(this_data.panel_id).appendChild(this.box_label);

	this.box_input = document.createElement("input");
	this.box_input.id = this_data.id + "_input";
	this.box_input.style.position = "absolute";
	this.box_input.type = "text";

	this.box_input.style.top = this_data.y - 1 + "px";
	this.box_input.style.left = this_data.x + 100 + "px";

	this.box_input.style.width = "27px";
	this.box_input.style.height = "10px";

	this.box_input.style.fontFamily = "Arial";
	this.box_input.style.fontSize = "12px";

	this.box_input.value = this_data.default;

	document.getElementById(this_data.panel_id).appendChild(this.box_input);

	this.box_range = document.createElement("div");
	this.box_range.id = this_data.id + "_label";
	this.box_range.style.position = "absolute";

	this.box_range.style.top = this_data.y + "px";
	this.box_range.style.left = this_data.x + 135 + "px";

	this.box_range.style.color = this_data.font_color;
	this.box_range.style.fontFamily = "Arial";
	this.box_range.style.fontSize = "12px";	

	this.box_range.innerHTML = "(" + this_data.min + " - " + this_data.max + ")";

	document.getElementById(this_data.panel_id).appendChild(this.box_range);

	this.box_input.onblur = (function (this_min, this_max)
		{
			return function(evt)
			{
				if (isNaN(evt.target.value))
					evt.target.value = this_min;
				else if (parseInt(evt.target.value) < this_min)
					evt.target.value = this_min;
				else if (parseInt(evt.target.value) > this_max)
					evt.target.value = this_max;

				generate_sound_code();
			}
		}) (this_data.min, this_data.max);	

	this.get_value = function()
	{
		return this.box_input.value;
	}
}

function toolbar(this_data)
{
	this.toolbar_div = document.createElement("div");
	this.toolbar_div.id = this_data.id;
	this.toolbar_div.style.position = "absolute";

	this.toolbar_div.style.top = this_data.y + "px";
	this.toolbar_div.style.left = this_data.x + "px";

	this.toolbar_div.style.width = this_data.width + "px";
	this.toolbar_div.style.height = this_data.height + "px";

	this.toolbar_div.style.backgroundColor = this_data.background;

	document.body.appendChild(this.toolbar_div);

	this.button_width = this_data.button_width;
	this.button_gap = this_data.button_gap;
	this.back_color = this_data.back_color;
	this.hover_color = this_data.hover_color;

	this.button_index = 0;
	this.buttons = new Array();

	this.set_width = function(this_width)
	{
		this.toolbar_div.style.width = this_width + "px";
	}

	this.add_button = function(this_src, this_tooltip, this_function)
	{
		this.buttons[this.button_index] = document.createElement("img");
		this.buttons[this.button_index].id = this.toolbar_div.id + "_button_" + this.button_index;
		this.buttons[this.button_index].style.position = "absolute";

		this.buttons[this.button_index].style.top = ((parseInt(this.toolbar_div.style.height) - this.button_width) / 2) + "px";
		this.buttons[this.button_index].style.left = this.button_gap + ((this.button_gap + this.button_width) * this.button_index) + "px";
		this.buttons[this.button_index].style.backgroundColor = this.back_color;

		this.buttons[this.button_index].src = this_src;
		this.toolbar_div.appendChild(this.buttons[this.button_index]);

		this.buttons[this.button_index].onmouseover = (function (this_button, this_toolbar, this_tooltip)
		{
			return function(evt)
			{
				this_button.style.backgroundColor = this_toolbar.hover_color;

				tooltip.innerHTML = this_tooltip;
				tooltip_flag = 1;
				tooltip_id = setTimeout(move_tooltip, 500);
			}
		}) (this.buttons[this.button_index], this, this_tooltip);	

		this.buttons[this.button_index].onmouseout = (function (this_button, this_toolbar)
		{
			return function(evt)
			{
				this_button.style.backgroundColor = this_toolbar.back_color;

				tooltip.style.left = "-1000px";
				tooltip_flag = 0;
				clearTimeout(tooltip_id);
			}
		}) (this.buttons[this.button_index], this);

		this.buttons[this.button_index].onclick = (function (button, this_function)
		{
			return function(evt)
			{
				this_function();
			}
		}) (this.buttons[this.button_index], this_function);

		this.button_index++;
	}

	this.add_blank = function()
	{
		this.buttons[this.button_index] = null;
		this.button_index++;
	}
}

extract_code = function()
{
	var this_code = sprite_codebox.innerHTML;

	var this_pos = 0;
	var this_row = 0;

	var exit_loop = false;

	while (this_pos < this_code.length && exit_loop == false)
	{
		while (this_code.substr(this_pos, 4) != "byte")
		{
			this_pos++;

			if (this_pos == this_code.length)
			{
				exit_loop = true;
				break;
			}
		}

		if (this_row == 0)
			var this_count = 3;
		else
			var this_count = 4;

		this_pos += 4;

		for (var i = 0; i < this_count; i++)
		{
			if (exit_loop == false)
			{
				while(this_code.substr(this_pos, 1).match(/[a-f|A-F|0-9]/i) == null)
				{
					this_pos++;

					if (this_pos == this_code.length)
					{
						exit_loop = true;
						break;
					}
				}

				if (exit_loop == false)
				{
					this_byte = "";

					while (this_code.substr(this_pos, 1).match(/[a-f|A-F|0-9]/i) != null && this_pos < this_code.length)
					{
						this_byte += this_code.substr(this_pos, 1);
						this_pos++;
					}

					console.log(this_byte);
				}
			}

			if (this_row == 0)
			{
				if (this_byte.length == 2)
					color_select_color[i] = parseInt("0x" + this_byte);
				else
					color_select_color[i] = parseInt(this_byte, 2);

				var color_area = document.getElementById("color_area_" + i);
				color_area.style.backgroundColor = color_palette[color_select_color[i]];
			}
			else
			{
				if (this_byte.length == 2)
					this_byte = get_binary_byte(this_byte);

				for (var j = 0; j < 8; j +=2)
				{
					color_select = parseInt(this_byte.substr(j, 2), 2) - 1;

					if (color_select == -1)
						color_select = 3

					this_x = (i * 4) + (j / 2);
					this_y = this_row - 1;

					if (color_select != 3)
					{
						var ctx = sprite.getContext("2d");

						ctx.fillStyle = color_palette[color_select_color[color_select]];
						ctx.fillRect(this_x * sprite_size, this_y * sprite_size, sprite_size, sprite_size);

						var ctx2 = document.getElementById("preview").getContext("2d");

						ctx2.fillStyle = color_palette[color_select_color[color_select]];
						ctx2.fillRect(this_x * 4, this_y * 4, 4, 4);

						sprite_map[this_y][this_x] = color_select + 1;
					}
					else
					{
						var ctx = sprite.getContext("2d");

						ctx.clearRect(this_x * sprite_size, this_y * sprite_size, sprite_size, sprite_size);

						ctx.fillStyle = "#303030"
						ctx.fillRect((this_x * sprite_size) + 2, (this_y * sprite_size) + 2, sprite_size - 4, sprite_size - 4);

						var ctx2 = document.getElementById("preview").getContext("2d");

						ctx2.clearRect(this_x * 4, this_y * 4, 4, 4);

						sprite_map[this_y][this_x] = 0;
					}
				}
			}
		}

		this_row++;

		if (this_row == 17)
			break;
	}

	generate_code();
}

extract_map_code = function()
{
	var this_code = document.getElementById("map_codebox").innerHTML;

	var this_pos = 0;
	var this_row = 0;

	var this_mapcode = "";

	var exit_loop = false;

	var ctx = document.getElementById("map_canvas").getContext("2d");

	for (var i = 0; i < 12; i++)
	{
		for (var j = 0; j < 16; j++)
		{
			while (this_code.substr(this_pos, 1) != "$")
				this_pos++;

			this_pos++;
			this_mapcode = "";

			while (this_pos < this_code.length && this_code.substr(this_pos, 1) != ",")
			{
				this_mapcode += this_code.substr(this_pos, 1);
				this_pos++;
			}

			this_codeno = parseInt("0x" + this_mapcode)

			ctx.clearRect(j * 64, i * 64, 64, 64);
			ctx.drawImage(tile_canvas[this_codeno], j * 64, i * 64);

			tile_map[i][j] = this_codeno;
		}
	}	
}

get_binary_nybble = function(this_value)
{
	this_nybble = this_value.toString(2);
	this_length = 4 - this_nybble.length

	for (var i = 0; i < this_length; i++)
		this_nybble = "0" + this_nybble;

	return this_nybble;
}

generate_sound_code = function()
{
	sound_code = "";
	register = "a";

	counter = 0;

	for (var i = 0; i < 3; i++)
	{
		if (channels[i].get_box_check() == true)
		{
			for (var j = 0; j < 14; j++)
			{
				if (j != 6 && j != 7 && j < 10)
				{
					this_value = parseInt(channels[i].get_box_value(j)).toString(16);

					if (this_value.length == 1)
						this_value = "0" + this_value;

					sound_code += "ld" + register + " #$" + this_value + "&#09;; "+ sound_comments[j] + "<br>";
					sound_code += "st" + register + " $" + (sound_data_start + counter).toString(16) + "<br>";
				}
				else
				{
					this_n1 = get_binary_nybble(parseInt(channels[i].get_box_value(j)));
					this_n2 = get_binary_nybble(parseInt(channels[i].get_box_value(j + 1)));

					this_value = parseInt((this_n1 + "" + this_n2), 2).toString(16);

					if (this_value.length == 1)
						this_value = "0" + this_value;

					sound_code += "ld" + register + " #$" + this_value + "&#09;; "+ sound_comments[j] + "<br>";
					sound_code += "st" + register + " $" + (sound_data_start + counter).toString(16) + "<br>";

					j++;
				}

				counter++;
			}

			sound_code += "<br>ld" + register + " #$01&#09;; play sound channel " + (i + 1) + "<br>st" + register + " $" + (sound_start + i).toString(16) + "<br><br>";
		}
		else
		{
			counter += 11;
		}
	}

	document.getElementById("sound_codebox").innerHTML = sound_code;	
}

generate_code = function()
{
	sprite_code = "";

	if (document.getElementById("asm_check").checked == true)
	{
		sprite_code = ".byte ";

		for (var i = 0; i < 3; i++)
		{
			this_color = color_select_color[i].toString(16);

			if (this_color.length == 1)
				this_color = "0" + this_color;

			sprite_code += "$" + this_color;

			if (i < 2)
				sprite_code += ", ";		
		}

		sprite_code += "<br>";

		for (var i = 0; i < 16; i++)
		{
			sprite_code += ".byte ";

			for (var j = 0; j < 16; j += 4)
			{
				sprite_code += "$";
				this_byte = "";

				for (k = 0; k < 4; k++)
				{
					this_xy = sprite_map[i][j + k].toString(2);

					if (this_xy.length == 1)
						this_xy = "0" + this_xy;

					this_byte += this_xy;
				}

				this_byte = parseInt(this_byte, 2).toString(16);

				if (this_byte.length == 1)
					this_byte = "0" + this_byte;

				sprite_code += this_byte;

				if (j < 12)
					sprite_code += ", ";
			}

			sprite_code += "<br>";
		}
	}
	else
	{
		sprite_code = "sprite/tile[x].data = ";

		for (var i = 0; i < 3; i++)
		{
			this_color = color_select_color[i].toString(16);

			if (this_color.length == 1)
				this_color = "0" + this_color;

			sprite_code += "$" + this_color;

			if (i < 2)
				sprite_code += ", ";		
		}

		sprite_code += ", ";

		for (var i = 0; i < 16; i++)
		{
			for (var j = 0; j < 16; j += 4)
			{
				sprite_code += "$";
				this_byte = "";

				for (k = 0; k < 4; k++)
				{
					this_xy = sprite_map[i][j + k].toString(2);

					if (this_xy.length == 1)
						this_xy = "0" + this_xy;

					this_byte += this_xy;
				}

				this_byte = parseInt(this_byte, 2).toString(16);

				if (this_byte.length == 1)
					this_byte = "0" + this_byte;

				sprite_code += this_byte;

				if (j < 12)
					sprite_code += ", ";
			}

			sprite_code += ", ";
		}

		sprite_code = sprite_code.substring(0, sprite_code.length - 2);
	}

	document.getElementById("sprite_codebox").innerHTML = sprite_code;
}

generate_map_code = function()
{
	sprite_code = "";

	sprite_code = "map[x].data = ";

	for (var i = 0; i < 12; i++)
	{
		for (var j = 0; j < 16; j++)
		{
			sprite_code += "$" + tile_map[i][j].toString(16) + ", ";
		}
	}

	sprite_code = sprite_code.substring(0, sprite_code.length - 2);

	document.getElementById("map_codebox").innerHTML = sprite_code;
}

get_binary_byte = function(this_num)
{
	var binary_num = parseInt("0x" + this_num).toString(2);
	var binary_length = binary_num.length;

	for (var i = 0; i < 8 - binary_length; i++)
		binary_num = "0" + binary_num;

	return binary_num;
}

get_byte_color = function(this_num)
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

function convert_string_to_bytes(this_string)
{
	var bytes = "";

	for (var i = 0; i < this_string.length; i++)
		bytes += this_string.charCodeAt(i).toString(16) + ";";

	return bytes;
}

function convert_int_to_bytes(this_int)
{
	var bytes = ""

	if (this_int.length % 2 != 0)
		this_int = "0" + this_int;

	for (var i = 0; i < this_int.length; i += 2)
		bytes += this_int.substr(i, 2) + ";";

	return bytes;
}


function doStatementCommand(thisStatement)
{
    parseTreeString += thisStatement;
}

function doCollateStatements(thisStatement1, thisStatement2)
{
    return thisStatement1 + "\n" + thisStatement2;
}

function byte(thisByte)
{
	return thisByte;
}

function doCollateBytes(thisByte1, thisByte2)
{
	return thisByte1 + ";" + thisByte2
}

function byteDefines(thisByte)
{
	return thisByte + ";";
}

function regularByte(thisByte)
{
	return thisByte;
}

function binaryByte(thisByte)
{
	var this_num = parseInt(thisByte, 2).toString(16);
	if (parseInt(thisByte, 2) < 10)
		this_num = "0" + this_num;

	return this_num;
}

function orgAddress(thisValue)
{
	var this_address = parseInt("0x" + thisValue);
	radix1.code_pointer = this_address;

	return "$" + thisValue + ";";
}

function ldaValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("lda_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldaAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("lda_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldaAddressX(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_address_x") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("lda_address_x") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldaAddressY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_address_y") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("lda_address_y") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldaIndirectY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_indirect_y") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("lda_indirect_y") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldaLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("lda_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function ldaLabelY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_address_y") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("lda_address_y") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function ldaIndirectYLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("lda_indirect_y") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("lda_indirect_y") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function staAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sta_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function staAddressX(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address_x") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sta_address_x") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function staAddressY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address_y") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sta_address_y") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function staIndirectY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_indirect_y") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sta_indirect_y") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function staLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sta_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function staLabelY(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address_y") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sta_address_y") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function staLabelX(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_address_x") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sta_address_x") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function staIndirectYLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sta_indirect_y") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sta_indirect_y") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function ldyValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldy_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("ldy_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldyAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldy_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("ldy_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldyLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldy_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("ldy_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function styAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sty_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sty_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function styLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sty_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sty_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function ldxValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldx_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("ldx_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldxAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldx_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("ldx_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function ldxLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("ldx_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("ldx_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function stxAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("stx_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("stx_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function dey()
{
	radix1.code_pointer += (radix1.op_lookup("dey")).split(";").length;
	return radix1.op_lookup("dey") + ";";
}

function dex()
{
	radix1.code_pointer += (radix1.op_lookup("dex")).split(";").length;
	return radix1.op_lookup("dex") + ";";
}

function iny()
{
	radix1.code_pointer += (radix1.op_lookup("iny")).split(";").length;
	return radix1.op_lookup("iny") + ";";
}

function inx()
{
	radix1.code_pointer += (radix1.op_lookup("inx")).split(";").length;
	return radix1.op_lookup("inx") + ";";
}

function defineLabel(thisValue)
{
	this_value = (radix1.code_pointer).toString(16);
	
	if (this_value.length == 5)
		this_value = this_value.substr(1, 4);

	var this_length = this_value.length

	for (i = 0; i < 4 - this_length; i++)
		this_value = "0" + this_value;

	this_value = this_value.substr(0, 2) + ";" + this_value.substr(2, 2);

	radix1.add_label(thisValue, this_value);

	return "";
}

function equAddress(thisLabel, thisValue)
{
	if (thisValue.length == 4)
		thisValue = thisValue.substr(0, 2) + ";" + thisValue.substr(2, 2);

	radix1.add_label(thisLabel, thisValue);

	return "";
}

function jmpLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("jmp") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("jmp") + ";" + radix1.get_label_value(thisValue) + ";";
}

function bneLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("bne") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("bne") + ";" + radix1.get_label_value(thisValue) + ";";
}

function beqLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("beq") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("beq") + ";" + radix1.get_label_value(thisValue) + ";";
}

function bplLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("bpl") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("bpl") + ";" + radix1.get_label_value(thisValue) + ";";
}

function bmiLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("bmi") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("bmi") + ";" + radix1.get_label_value(thisValue) + ";";
}

function cmpAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("cmp_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("cmp_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function cmpValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("cmp_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("cmp_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function clc()
{
	radix1.code_pointer += (radix1.op_lookup("clc")).split(";").length;
	return radix1.op_lookup("clc") + ";";
}

function sec()
{
	radix1.code_pointer += (radix1.op_lookup("sec")).split(";").length;
	return radix1.op_lookup("sec") + ";";
}

function andAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("and_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("and_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function andValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("and_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("and_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function eorAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("eor_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("eor_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function eorValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("eor_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("eor_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function adcAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("adc_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("adc_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function adcValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("adc_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("adc_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function adcLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("adc_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("adc_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function sbcAddress(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sbc_address") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sbc_address") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function sbcValue(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sbc_value") + ";" + convert_int_to_bytes(thisValue) + "00").split(";").length;
	return radix1.op_lookup("sbc_value") + ";" + convert_int_to_bytes(thisValue) + "00;";
}

function sbcLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("sbc_address") + ";" + radix1.get_label_value(thisValue) + ";00").split(";").length;
	return radix1.op_lookup("sbc_address") + ";" + radix1.get_label_value(thisValue) + ";00;";
}

function bccLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("bcc") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("bcc") + ";" + radix1.get_label_value(thisValue) + ";";
}

function bcsLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("bcs") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("bcs") + ";" + radix1.get_label_value(thisValue) + ";";
}

function jsrLabel(thisValue)
{
	radix1.code_pointer += (radix1.op_lookup("jsr") + ";" + radix1.get_label_value(thisValue)).split(";").length;
	return radix1.op_lookup("jsr") + ";" + radix1.get_label_value(thisValue) + ";";
}

function lsrA()
{
	radix1.code_pointer += (radix1.op_lookup("lsr_a")).split(";").length;
	return radix1.op_lookup("lsr_a") + ";";
}

function aslA()
{
	radix1.code_pointer += (radix1.op_lookup("asl_a")).split(";").length;
	return radix1.op_lookup("asl_a") + ";";
}

function ldr()
{
	radix1.code_pointer += (radix1.op_lookup("ldr")).split(";").length;
	return radix1.op_lookup("ldr") + ";";
}

function rts()
{
	radix1.code_pointer += (radix1.op_lookup("rts")).split(";").length;
	return radix1.op_lookup("rts") + ";";
}

function sed()
{
	radix1.code_pointer += (radix1.op_lookup("sed")).split(";").length;
	return radix1.op_lookup("sed") + ";";
}

function cld()
{
	radix1.code_pointer += (radix1.op_lookup("cld")).split(";").length;
	return radix1.op_lookup("cld") + ";";
}


//RScript functions and parser functions
var var_table = new Array();
var mem_pointer = 11;
var temp_pointer = 2000;
var temp_base = 2000;
var temp_types = new Array();

var draw_screen = 0;
var view_screen = 0;

var pt = 0;
var pt_stack = new Array();
var pt_pt = 0;

var if_flag = 0;

var for_pointer = 2500;
var for_stack = new Array();
var for_pt = 0;

var rs_code;
var statementString;
var st_pt = 0;

var sub_names = new Array();
var sub_count = 0;

function get_address(this_var)
{
	for (var i = 0; i < var_table.length; i++)
		if (var_table[i].name == this_var)
			break;

	if (i < var_table.length)
		return var_table[i].address;
	else
	{
		var_table[i] = {};
		var_table[i].name = this_var;
		var_table[i].address = mem_pointer;
		var_table[i].type = "int";

		mem_pointer++;
		return var_table[i].address;
	}
}

function get_type(this_var)
{
	for (var i = 0; i < var_table.length; i++)
		if (var_table[i].name == this_var)
			break;

	if (i < var_table.length)
		return var_table[i].type;
	else
	{
		var_table[i] = {};
		var_table[i].name = this_var;
		var_table[i].address = mem_pointer;
		var_table[i].type = "int";

		mem_pointer++;
		return var_table[i].type;
	}
}

function get_sub(this_sub)
{
	for (var i = 0; i < sub_names.length; i++)
		if (sub_names[i] == this_sub)
			break;

	if (i == sub_names.length)
		sub_names[i] = this_sub;

	return i;
}

function temp_pop()
{
	temp_pointer--;
	return temp_pointer;
}

function doMainDefinition(thisStatements)
{
    parseTreeString += "\torg $3610\n\tlda #$00\n\tsta $03\n\tsta $bd9\n" + statementString + "\n\tjmp Loop\n\n";
    statementString = "";
}

function doLoopDefinition(thisStatements)
{
    parseTreeString += "Loop\n" + statementString + "\n\tldx $bee\n\tinx\n\tstx $bee\n\tlda #$01\n\tsta $01\n\tjmp Loop\n";
    statementString = "";
}

function doSubDefinition(thisSub)
{
    parseTreeString += "\nSub" + get_sub(thisSub) + "\n" + statementString + "\n\trts\n\n";

    sub_names[sub_count] = thisSub;
	sub_count++;

    statementString = "";
}

function doSpriteData(thisData)
{
	return thisData;
}

function doCollateData(thisData1, thisData2)
{
	return thisData1 + "," + thisData2;
}

function doSpriteDataset(thisIndex, thisData)
{
	var spriteString = "";

	var sprite_data = thisData.split(",");
	
	for (var i = 0; i < sprite_data.length; i++)
	{

	}

	var sprite_loc = 11694 + (parseInt(thisIndex) * 67);

	spriteString += "\n\torg $" + sprite_loc.toString(16) + "\n";
	spriteString += "\t.byte " + sprite_data[0] + ", " + sprite_data[1] + ", " + sprite_data[2] + "\n";

	var index = 3;

	for (var i = 0; i < 16; i++)
	{
		spriteString += "\t.byte " + sprite_data[index] + ", " + sprite_data[index + 1] + ", " + sprite_data[index + 2] + ", " + sprite_data[index + 3] + "\n";
		index += 4;	
	}

	parseTreeString += spriteString;
}

function doTileDataset(thisIndex, thisData)
{
	var spriteString = "";

	var sprite_data = thisData.split(",");
	
	for (var i = 0; i < sprite_data.length; i++)
	{

	}

	var sprite_loc = 5262 + (parseInt(thisIndex) * 67);

	spriteString += "\n\torg $" + sprite_loc.toString(16) + "\n";
	spriteString += "\t.byte " + sprite_data[0] + ", " + sprite_data[1] + ", " + sprite_data[2] + "\n";

	var index = 3;

	for (var i = 0; i < 16; i++)
	{
		spriteString += "\t.byte " + sprite_data[index] + ", " + sprite_data[index + 1] + ", " + sprite_data[index + 2] + ", " + sprite_data[index + 3] + "\n";
		index += 4;	
	}

	parseTreeString += spriteString;
}

function doMapDataset(thisIndex, thisData)
{
	var mapString = "";
	var index = 0;

	var map_data = thisData.split(",");
	
	for (var i = 0; i < map_data.length; i++)
	{

	}

	var sprite_loc = map_start + (parseInt(thisIndex) * 192);

	mapString += "\n\torg $" + sprite_loc.toString(16) + "\n";

	for (var i = 0; i < 12; i++)
	{
		mapString += "\t.byte "

		for (var j = 0; j < 16; j++)
		{
			mapString += map_data[index];
			index++;

			if (j < 15)
				mapString += ", ";
		}

		mapString += "\n";
	}

	parseTreeString += mapString;
}

function doCallSubCode(thisSub)
{
	var sub_index = get_sub(thisSub);

	var asm_code = "\tjsr Sub" + sub_index + "\n";
    statementString += asm_code;
}

function doIntCode(thisValue)
{
	var index = var_table.length;

	var_table[index] = {};
	var_table[index].name = thisValue;
	var_table[index].address = mem_pointer;
	var_table[index].type = "int";

	mem_pointer++;
}

function doIndexCode(thisValue, thisLen)
{
	var index = var_table.length;

	var_table[index] = {};
	var_table[index].name = thisValue;
	var_table[index].address = mem_pointer;
	var_table[index].type = "array_int";
	var_table[index].len = Math.floor(parseInt(thisLen) / 2);

	mem_pointer += var_table[index].len;	
}

function doArrayIntCode(thisValue, thisLen)
{
	var index = var_table.length;

	var_table[index] = {};
	var_table[index].name = thisValue;
	var_table[index].address = mem_pointer;
	var_table[index].type = "array_int";
	var_table[index].len = parseInt(thisLen);

	mem_pointer += parseInt(thisLen + 1);
}

function doSetBackground(thisBack)
{
	temp_pop();
	var asm_code = "\tlda $" + temp_pointer.toString(16) + "\n\tsta $06\n";

    statementString += asm_code;
}

function doDrawScreenCode(thisScreen)
{
	draw_screen = thisScreen;

	temp_pop();
	var asm_code = "\tlda $" + temp_pointer.toString(16) + "\n\tsta $bd9\n";

    statementString += asm_code;
}

function doViewScreenCode(thisScreen)
{
	draw_screen = thisScreen;

	temp_pop();
	var asm_code = "\tlda $" + temp_pointer.toString(16) + "\n\tsta $03\n";

    statementString += asm_code;
}

function doDrawMapCode(thisMap)
{
	var asm_code = "";
	var draw_map_start = 4106 + (192 * draw_screen);
	var data_loc = map_start + (parseInt(thisMap) * 192);

	for (var i = 0; i < 12; i++)
	{
		for (j = 0; j < 16; j++)
		{
			asm_code += "\tlda $" + data_loc.toString(16) + "\n\tsta $" + draw_map_start.toString(16) + "\n";
			draw_map_start++;
			data_loc++;
		}
	}

	statementString += asm_code;
}

function doDrawTileCode()
{
	var asm_code = "";

	temp_pop();
	tile_code = temp_pointer.toString(16);

	temp_pop();
	tile_y = temp_pointer.toString(16);

	temp_pop();
	tile_x = temp_pointer.toString(16);

	asm_code += "\tldx #$00\n";

	asm_code += "\tlda $" + tile_y + "\n\tsta $bc8\n\tlda #$10\n\tsta $bc9\n\tjsr mult\n\tlda $bca\n";
	asm_code += "\tclc\n\tadc $" + tile_x + "\n\tsta $bcb\n\tldx $bcb\n";

	asm_code += "\tlda $" + tile_code + "\n";

	asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
	asm_code += "\tsta $100a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tsta $10ca, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tsta $118a, x\npt" + pt + "\n";

	pt++;

	statementString += asm_code;
}

function doGetTileCode()
{
	var asm_code = "";

	temp_pop();
	tile_y = temp_pointer.toString(16);

	temp_pop();
	tile_x = temp_pointer.toString(16);

	asm_code += "\tlda $" + tile_x + "\n\tsta $bf0\n\tlda $" + tile_y + "\n\tsta $bef\n";
	asm_code += "\tjsr gettile\n\tlda $bf2\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doPrintCode(printX, printY, printString)
{
	var asm_code = "";
	print_start = 4106 + (192 * draw_screen) + (parseInt(printY) * 16) + parseInt(printX);

	asm_code += "\tldx #$00\n";

	temp_pop();
	asm_code += "\tlda $" + temp_pointer.toString(16) + "\n\tsta $bc8\n\tlda #$10\n\tsta $bc9\n\tjsr mult\n\tlda $bca\n";

	temp_pop();
	asm_code += "\tclc\n\tadc $" + temp_pointer.toString(16) + "\n\tsta $bcb\n\tldx $bcb\n";

	if (!isNaN(printString))
		printString = printString.toString();

	for (var i = 1; i < printString.length - 1; i++)
	{
		var this_code = printString.charCodeAt(i);
		var draw_flag = 0;

		if (this_code >= 65 && this_code <= 90)
		{
			asm_code += "\tlda #$" + (this_code - 54).toString(16) + "\n" 
			draw_flag = 1;
		}
		else if (this_code >= 48 && this_code <= 57)
		{
			asm_code += "\tlda #$" + (this_code - 47).toString(16) + "\n" 
			draw_flag = 1;
		}
		else if (this_code == 37)
		{
			i++;

			if (printString.charCodeAt(i) == 49)
			{
				asm_code += "\tlda #$" + (this_code + 1).toString(16) + "\n" 
				draw_flag = 1;				
			}
		}

		if (draw_flag == 1)
		{
			asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
			asm_code += "\tsta $100a, x\npt" + pt + "\n";

			pt++;

			asm_code += "\tdey\n\tbne pt" + pt + "\n";
			asm_code += "\tsta $10ca, x\npt" + pt + "\n";

			pt++;

			asm_code += "\tdey\n\tbne pt" + pt + "\n";
			asm_code += "\tsta $118a, x\npt" + pt + "\n";

			pt++;
		}

		asm_code += "\tinx\n";
		print_start++;
	}

	statementString += asm_code;
}

function doPrintExpCode(printX, printY, printExpr)
{
	var asm_code = "";

	temp_pop();
	print_num = temp_pointer.toString(16);

	temp_pop();
	print_y = temp_pointer.toString(16);

	temp_pop();
	print_x = temp_pointer.toString(16);

	asm_code += "\tldx #$00\n";
	asm_code += "\tlda $" + print_y + "\n\tsta $bc8\n\tlda #$10\n\tsta $bc9\n\tjsr mult\n\tlda $bca\n";
	asm_code += "\tclc\n\tadc $" + print_x + "\n\tsta $bcb\n\tldx $bcb\n";

	asm_code += "\tlda $" + print_num + "\n\tsta $bf3\n\tjsr num2dec\n\tlda #$0\n\tsta $bfa\n";

	asm_code += "\tlda $bf6\n\tbeq pt" + pt + "\n\tclc\n\tadc #$01\n";

	pt_hold = pt;
	pt++;

	asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $100a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $10ca, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $118a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tldx $bcb\n\tinx\n\tstx $bcb\n";
	asm_code += "\tlda #$1\n\tsta $bfa\npt" + pt_hold + "\n";


	asm_code += "\tlda $bf7\n\tbne pt" + pt + "\n\tlda $bfa\n\tbeq pt" + (pt + 1) + "\n";;

	pt++;
	pt_hold = pt;
	pt++;

	asm_code += "pt" + (pt - 2) + "\n\tlda $bf7\n\tclc\n\tadc #$01\n";

	asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $100a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $10ca, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $118a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tldx $bcb\n\tinx\n\tstx $bcb\n";
	asm_code += "\tlda #$1\n\tsta $bfa\npt" + pt_hold + "\n";


	asm_code += "\tlda $bf8\n\tjmp pt" + pt + "\n\tlda $bfa\n\tbeq pt" + (pt + 1) + "\n";;

	pt++;
	pt_hold = pt;
	pt++;

	asm_code += "pt" + (pt - 2) + "\n\tlda $bf8\n\tclc\n\tadc #$01\n";

	asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $100a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $10ca, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $118a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tldx $bcb\n\tinx\n\tstx $bcb\n";
	asm_code += "\tlda #$1\n\tsta $bfa\npt" + pt_hold + "\n";


	asm_code += "\tlda $bf9\n\tjmp pt" + pt + "\n\tlda $bfa\n\tbeq pt" + (pt + 1) + "\n";;

	pt++;
	pt_hold = pt;
	pt++;

	asm_code += "pt" + (pt - 2) + "\n\tlda $bf9\n\tclc\n\tadc #$01\n";

	asm_code += "\tldy $bd9\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $100a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $10ca, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tdey\n\tbne pt" + pt + "\n";
	asm_code += "\tldx $bcb\n\tsta $118a, x\npt" + pt + "\n";

	pt++;

	asm_code += "\tldx $bcb\n\tinx\n\tstx $bcb\n";
	asm_code += "\tlda #$1\n\tsta $bfa\npt" + pt_hold + "\n";
	statementString += asm_code;
}

function doRandomCode(thisRange)
{
	var asm_code = "";

	temp_pop();
	range = temp_pointer.toString(16);

	asm_code += "\tlda $" + range + "\n\tsta $bf1\n\tjsr random\n\tlda $bf2\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doPauseCode()
{
	var asm_code = "";

	temp_pop();
	value = temp_pointer.toString(16);

	asm_code += "\tlda $" + value + "\n\tsta $09\n";

	statementString += asm_code;
}

function doResetCode()
{
	var asm_code = "";

	temp_pop();
	value = temp_pointer.toString(16);

	asm_code += "\tlda #$01\n\tsta $07\n";

	statementString += asm_code;
}

function doCreateObjectCode(index, thisSprite, thisX, thisY)
{
	var asm_code = "";
	obj_start = 4682 + (8 * index);

	temp_pop();
	obj_y = temp_pointer.toString(16);

	temp_pop();
	obj_x = temp_pointer.toString(16);

	temp_pop();
	obj_sprite = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $" + obj_sprite + "\n\tsta $124a, x\n";
	asm_code += "\tinx\n\tlda $bd9\n\tclc\n\tadc #$01\n\tsta $124a, x\n";

	asm_code += "\tinx\n\tlda $" + obj_x + "\n\tsta $124a, x\n";
	asm_code += "\tinx\n\tlda $" + obj_y + "\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doSetMoveXCode(index, thisReverse, thisStagger, thisMove)
{
	var asm_code = "";
	obj_start = 4682 + (8 * index);

	temp_pop();
	obj_move = temp_pointer.toString(16);

	temp_pop();
	obj_stagger = temp_pointer.toString(16);

	temp_pop();
	obj_rev = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $" + obj_move + "\n";

	asm_code += "\tldy $" + obj_rev + "\n\tbeq pt" + pt + "\n\tclc\n\tadc #$80\npt" + pt + "\n";

	pt++;

	asm_code += "\tldy $" + obj_stagger + "\n\tbeq pt" + pt + "\n\tclc\n\tadc #$40\npt" + pt + "\n";

	pt++;

	asm_code += "\tinx\n\tinx\n\tinx\n\tinx\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doSetMoveYCode(index, thisReverse, thisStagger, thisMove)
{
	var asm_code = "";
	obj_start = 4682 + (8 * index);

	temp_pop();
	obj_move = temp_pointer.toString(16);

	temp_pop();
	obj_stagger = temp_pointer.toString(16);

	temp_pop();
	obj_rev = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $" + obj_move + "\n";

	asm_code += "\tldy $" + obj_rev + "\n\tbeq pt" + pt + "\n\tclc\n\tadc #$80\npt" + pt + "\n";

	pt++;

	asm_code += "\tldy $" + obj_stagger + "\n\tbeq pt" + pt + "\n\tclc\n\tadc #$40\npt" + pt + "\n";

	pt++;

	asm_code += "\tinx\n\tinx\n\tinx\n\tinx\n\tinx\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doObjectRemoveCode()
{
	var asm_code = "";

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tlda #$00\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doCheckTileSet()
{
	var asm_code = "";

	temp_pop();
	check_y = temp_pointer.toString(16);

	temp_pop();
	check_x = temp_pointer.toString(16);

	temp_pop();
	check_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + check_index + "\n\tsta $bc8\n\tlda #$04\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $bd9\n\tclc\n\tadc #$01\n\tsta $134a, x\n\tinx\n\tlda $" + check_x + "\n\tsta $134a, x\n\tinx\n\tlda $" + check_y + "\n\tsta $134a, x\n";

	statementString += asm_code;
}

function doCheckColSet()
{
	var asm_code = "";

	temp_pop();
	radius_2 = temp_pointer.toString(16);

	temp_pop();
	radius_1 = temp_pointer.toString(16);

	temp_pop();
	check_2 = temp_pointer.toString(16);

	temp_pop();
	check_1 = temp_pointer.toString(16);

	temp_pop();
	check_index = temp_pointer.toString(16);	

	asm_code += "\tlda $" + check_index + "\n\tsta $bc8\n\tlda #$05\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $" + check_1 + "\n\tsta $13ca, x\n\tinx\n\tlda $" + check_2 + "\n\tsta $13ca, x\n"
	asm_code += "\tinx\n\tlda $" + radius_1 + "\n\tsta $13ca, x\n\tinx\n\tlda $" + radius_2 + "\n\tsta $13ca, x\n";

	statementString += asm_code;
}

function doObjectSpriteCode(exp1)
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $124a, x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;	
}

function doObjectXCode(exp1)
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tlda $124a, x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;	
}

function doObjectYCode(exp1)
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tinx\n\tlda $124a, x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;	
}

function doCheckTileTile()
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda #$04\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tinx\n\tlda $134a, x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;	
}

function doCheckColCollide()
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda #$05\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tinx\n\tinx\n\tlda $13ca, x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doObjectSetAngleCode(index, thisAngle)
{
	var asm_code = "";

	temp_pop();
	obj_angle = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tinx\n\tinx\n\tinx\n\tinx\n\tlda $124a, x\n\tand #$fc\n\tclc\n\tadc $" + obj_angle + "\n\tsta $124a, x\n";	

	statementString += asm_code;
}

function doObjectSetSpriteCode(index, thisSprite)
{
	var asm_code = "";

	temp_pop();
	obj_sprite = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tlda $" + obj_sprite + "\n\tsta $124a, x\n";

	statementString += asm_code;	
}

function doObjectSetXCode(index, thisX)
{
	var asm_code = "";

	temp_pop();
	obj_x = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tlda $" + obj_x + "\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doObjectSetYCode(index, thisX)
{
	var asm_code = "";

	temp_pop();
	obj_y = temp_pointer.toString(16);

	temp_pop();
	obj_index = temp_pointer.toString(16);

	asm_code += "\tlda $" + obj_index + "\n\tsta $bc8\n\tlda #$08\n\tsta $bc9\n\tjsr mult\n\tldx $bca\n";
	asm_code += "\tinx\n\tinx\n\tinx\n\tlda $" + obj_y + "\n\tsta $124a, x\n";

	statementString += asm_code;
}

function doLTExpression(thisExp1, thisExp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsec\n\tsbc $" + exp2 + "\n";
	asm_code += "\tbcs pt" + pt + "\n\tbeq pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doGTExpression(thisExp1, thisExp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsec\n\tsbc $" + exp2 + "\n";
	asm_code += "\tbcc pt" + pt + "\n\tbeq pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doEExpression(thisExp1, thisExp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsec\n\tsbc $" + exp2 + "\n";
	asm_code += "\tbne pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doNEExpression(thisExp1, thisExp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsec\n\tsbc $" + exp2 + "\n";
	asm_code += "\tbeq pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doAndExpression(exp1, exp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tclc\n\tadc $" + exp2 + "\n\tsec\n\tsbc #$02\n";
	asm_code += "\tbne pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doOrExpression(exp1, exp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda #$00\n\tsec\n\tsbc $" + exp1 + "\n\tsec\n\tsbc $" + exp2 + "\n";
	asm_code += "\tbeq pt" + pt + "\n\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n\tjmp pt" + (pt + 1) + "\npt" + pt + "\n";

	pt++;

	asm_code += "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\npt" + pt + "\n";

	pt++
	temp_pointer++;

	statementString += asm_code;
}

function doNewLineCode()
{
	statementString += "--\n";
}

function doCollateRStatements(exp1, exp2)
{
	statementString += "--\n";
}

function doIfStatement(exp, stats)
{
	if_flag++;
}

function doCounterCode()
{
	var asm_code = "";

	asm_code += "\tlda $bee\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doCounterResetCode()
{
	var asm_code = "";

	asm_code += "\tlda #$0\n\tsta $bee\n";

	statementString += asm_code;
}	

function doTileGetCode()
{
	var asm_code = "";

	temp_pop()
	var exp = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp + "\n\tsta $bc8\n\tlda #$10\n\tsta $bc9\n\tjsr mult\n\tlda $bca\n";
	asm_code += "\tclc\n\tadc #$08\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doKeyDownCode()
{
	var asm_code = "";
	var key_addr = "8";

	asm_code += "\tlda #$00\n\tsta $be9\n";

	asm_code += "\tlda #$80\n\tand $" + key_addr + "\n\tbeq pt" + pt + "\n\tlda #$01\n\tsta $be9\n\tjmp pt" + (pt + 3) + "\n";
	pt++;

	asm_code += "pt" + (pt - 1) + "\n\tlda #$40\n\tand $" + key_addr + "\n\tbeq pt" + pt + "\n\tlda #$02\n\tsta $be9\n\tjmp pt" + (pt + 2) + "\n";
	pt++;

	asm_code += "pt" + (pt - 1) + "\n\tlda #$20\n\tand $" + key_addr + "\n\tbeq pt" + pt + "\n\tlda #$03\n\tsta $be9\n\tjmp pt" + (pt + 1) + "\n";
	pt++;

	asm_code += "pt" + (pt - 1) + "\n\tlda #$10\n\tand $" + key_addr + "\n\tbeq pt" + pt + "\n\tlda #$04\n\tsta $be9\n";

	asm_code += "pt" + pt + "\n";
	pt++;

	asm_code += "\tlda $be9\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doButtonCode(thisButton)
{
	var asm_code = "";
	var key_addr = "8";

	temp_pop();
	exp = temp_pointer.toString(16);

	asm_code += "\tlda #$00\n\tsta $bea\n\tsta $beb\n\tsta $bed\n";

	asm_code += "\tlda $" + exp + "\n\tsec\n\tsbc #$01\n\tbne pt" + pt + "\n";
	asm_code += "\tlda #$8\n\tand $" + key_addr + "\n\tbeq pt" + (pt + 1) + "\n\tlda #$01\n\tsta $bea\n\tlda $bea\n\tsta $bed\n\tjmp pt" + (pt + 1) + "\n";
	pt++;

	asm_code += "pt" + (pt - 1) + "\n\tlda $" + exp + "\n\tsec\n\tsbc #$02\n\tbne pt" + pt + "\n";
	asm_code += "\tlda #$4\n\tand $" + key_addr + "\n\tbeq pt" + pt + "\n\tlda #$01\n\tsta $beb\n\tlda $beb\n\tsta $bed\n";
	asm_code += "pt" + pt + "\n";
	pt++;

	asm_code += "\tlda $bed\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doSwitchCode()
{
	var asm_code = "";

	temp_pop()
	var exp = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp + "\n\tsta $bec\n";

	statementString += asm_code;
}

function doCaseStatement()
{
	var asm_code = "";

	if (pt_pt > 0)
	{
		pt_pt--;
		asm_code += "pt" + pt_stack[pt_pt] + "\n"; 
	}

	statementString += asm_code;
}

function doCaseCode()
{
	var asm_code = "";

	temp_pop()
	var exp = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp + "\n\tsec\n\tsbc $bec\n\tbne pt" + pt + "\n";

	pt_stack[pt_pt] = pt;
	pt_pt++;

	pt++;

	statementString += asm_code;
}

function doEndSwitchCode()
{
	var asm_code = "";

	pt_pt--;
	asm_code += "pt" + pt_stack[pt_pt] + "\n"; 

	statementString += asm_code;
}

function doForExpression(varName)
{
	var asm_code = "";

	temp_pop();
	var max = temp_pointer.toString(16);

	temp_pop();
	var min = temp_pointer.toString(16);

	asm_code += "\tlda $" + min + "\n\tsta $" + get_address(varName).toString(16) + "\n";
	asm_code += "\tlda $" + max + "\n\tsta $" + for_pointer.toString(16) + "\npt" + pt + "\n";

	for_pointer++;
	for_stack[for_pt] = get_address(varName).toString(16);
	for_pt++;

	pt_stack[pt_pt] = pt;
	pt_pt++;
	pt++;

	statementString += asm_code;
}

function doForCode()
{

}

function doNextExpression()
{
	var asm_code = "";

	for_pointer--;
	for_pt--;
	pt_pt--;

	asm_code += "\tlda $" + for_stack[for_pt] + "\n\tclc\n\tadc #$01\n\tsta $" + for_stack[for_pt] + "\n"; 
	asm_code += "\tlda $" + for_pointer.toString(16) + "\n\tsec\n\tsbc $" + for_stack[for_pt] + "\n\tbpl pt" + pt_stack[pt_pt] + "\n";

	statementString += asm_code;
}

function doThenCode()
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tbeq pt" + pt + "\n";

	pt_stack[pt_pt] = pt;
	pt_pt++;

	pt++;

	statementString += asm_code;
}

function doElseCode()
{
	var asm_code = "";

	pt_pt--;
	var jmp_pt = pt_stack[pt_pt];

	asm_code += "\tjmp pt" + pt + "\n";

	pt_stack[pt_pt] = pt;
	pt_pt++;

	pt++;

	asm_code += "pt" + jmp_pt + "\n";

	statementString += asm_code;
}

function doElseIfCode()
{
	var jmp_pt = pt_stack[pt_pt - 2];
	var rem = pt_stack.splice(pt_pt - 2, 1);

	pt_pt--;

	var index = statementString.lastIndexOf("--");
	statementString = statementString.substring(0, index) + "\txx" + if_flag + "\npt" + jmp_pt + "\n" + statementString.substring(index, statementString.length);
}

function doEndIfStatement()
{
	var asm_code = "";

	pt_pt--;
	var jmp_pt = pt_stack[pt_pt];

	asm_code += "pt" + jmp_pt + "\n";

	statementString += asm_code;

	statementString = statementString.replaceAll("xx" + if_flag, "jmp pt" + jmp_pt + "\n");
	if_flag--;
}

function doWhileCode(thisCode)
{
	
}

function doDoCode()
{
	var asm_code = "";

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tbeq pt" + pt + "\n";

	pt_stack[pt_pt] = pt;
	pt_pt++;

	pt++;

	var index = statementString.lastIndexOf("--");
	statementString = statementString.substring(0, index) + "pt" + pt + "\n" + statementString.substring(index, statementString.length);

	pt_stack[pt_pt] = pt;
	pt_pt++;

	pt++;

	statementString += asm_code;
}

function doWendCode()
{
	var asm_code = "";

	pt_pt--;
	var loop_pt = pt_stack[pt_pt];

	pt_pt--;
	var jmp_pt = pt_stack[pt_pt];

	asm_code += "\tjmp pt" + loop_pt + "\npt" + jmp_pt + "\n";

	statementString += asm_code;	
}

function doAssignmentCode(thisVariable, thisExpression)
{
	var this_type = get_type(thisVariable);

	if (this_type == "int")
	{
		temp_pop();
    	var asm_code = "\tlda $" + temp_pointer.toString(16) + "\n\tsta $" + get_address(thisVariable).toString(16) + "\n";
	}

    statementString += asm_code;
}

function doAssignmentArrayCode(thisVariable, thisIndex, thisExpression)
{
	temp_pop();
	var exp = temp_pointer.toString(16);

	temp_pop();
	var index = temp_pointer.toString(16);

	var asm_code = "\tldx $" + index + "\n\tlda $" + exp + "\n\tsta $" + get_address(thisVariable).toString(16) + ", x\n";

    statementString += asm_code;
}

function doSumExpression(exp1, exp2)
{
	temp_pop();
	exp2_addr = temp_pointer.toString(16);

	temp_pop();
	exp1_addr = temp_pointer.toString(16);

	var asm_code = "\tlda $" + exp1_addr + "\n\tclc\n\tadc $" + exp2_addr + "\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;
}

function doDiffExpression(exp1, exp2)
{
	temp_pop();
	exp2_addr = temp_pointer.toString(16);

	temp_pop();
	exp1_addr = temp_pointer.toString(16);

	var asm_code = "\tlda $" + exp1_addr + "\n\tsec\n\tsbc $" + exp2_addr + "\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

	statementString += asm_code;	
}

function doMultExpression(exp1, exp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bc8\n\tlda $" + exp2 + "\n\tsta $bc9\n\tjsr mult\n\tlda $bca\n";
	asm_code += "\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;


	statementString += asm_code;
}

function doDivExpression(exp1, exp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bb8\n\tlda $" + exp2 + "\n\tsta $bb9\n\tjsr div\n\tlda $bba\n";
	asm_code += "\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;


	statementString += asm_code;
}

function doModExpression(exp1, exp2)
{
	var asm_code = "";

	temp_pop();
	exp2 = temp_pointer.toString(16);

	temp_pop();
	exp1 = temp_pointer.toString(16);

	asm_code += "\tlda $" + exp1 + "\n\tsta $bb8\n\tlda $" + exp2 + "\n\tsta $bb9\n\tjsr div\n\tlda $bbb\n";
	asm_code += "\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;


	statementString += asm_code;
}

function doValueOfExpression(thisExpression)
{
	var asm_code = "\tlda $" + get_address(thisExpression).toString(16) + "\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return thisExpression;
}

function doArrayCode(thisVar, thisIndex)
{
	temp_pop();
	var index = temp_pointer.toString(16);

	var asm_code = "\tldx $" + index + "\n\tlda $" + get_address(thisVar).toString(16) + ", x\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return thisVar;	
}

function doTrueCode()
{
	var asm_code = "\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 1;
}

function doFalseCode()
{
	var asm_code = "\tlda #$00\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 0;	
}

function doLeftCode()
{
	var asm_code = "\tlda #$01\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 1;	
}

function doUpCode()
{
	var asm_code = "\tlda #$02\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 2;	
}

function doRightCode()
{
	var asm_code = "\tlda #$03\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 3;	
}

function doDownCode()
{
	var asm_code = "\tlda #$04\n\tsta $" + temp_pointer.toString(16) + "\n";

	temp_types[temp_pointer - temp_base] = "int";
	temp_pointer++;

    statementString += asm_code;

    return 4;	
}

function doValueOfString(thisString)
{
	return thisString;
}

function doValueOfInteger(thisInteger)
{
	if (thisInteger.substring(0, 1) == "$")
		var this_int = thisInteger.substring(1, thisInteger.length);
	else
		var this_int = parseInt(thisInteger).toString(16);

	var asm_code = "\tlda #$" + this_int + "\n\tsta $" + temp_pointer.toString(16) + "\n";
	temp_pointer++;

    statementString += asm_code;

    return thisInteger;
}

function doBrackets(thisExpression)
{

}

// code borrowed from https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
