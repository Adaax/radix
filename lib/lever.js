var lever_registry = new Array();
var levers = new Array();
var lever;

var scrollbarWidth = 12;

lever_add_registry = function(this_lever)
{
	for (var i = 0; i < lever_registry.length; i++)
		if (lever_registry[i].type == this_lever.type)
			break;

	lever_registry[i] = this_lever;

	//lever_registry[i].create_event = new CustomEvent(lever_registry[i].create);
}

lever_add_create_function = function(event_id, this_function)
{
	addEventListener(event_id, this_function, false);
}

lever_add_update_function = function(event_id, this_function)
{
	addEventListener(event_id, this_function, false);
}

lever_create = function(this_game, this_lever)
{
	for (var i = 0; i < lever_registry.length; i++)
		if (lever_registry[i].type == this_lever.type)
			break;

	if (i < lever_registry.length)
	{
		for (var j = 0; j < levers.length; j++)
			if (levers[j].name == this_lever.name)
				break;

		levers[j] = this_lever;

		var this_event = new CustomEvent(lever_registry[i].create, {"detail": {"game": this_game, "lever": levers[j]}});
		dispatchEvent(this_event);
	}
}

lever_update = function(this_game, this_lever)
{
	for (var i = 0; i < lever_registry.length; i++)
		if (lever_registry[i].type == this_lever.type)
			break;

	if (i < lever_registry.length)
	{
		for (var j = 0; j < levers.length; j++)
			if (levers[j].name == this_lever.name)
				break;

		levers[j] = this_lever;

		var this_event = new CustomEvent(lever_registry[i].update, {"detail": {"game": this_game, "lever": levers[j]}});
		dispatchEvent(this_event);
	}	
}

lever_remove = function(this_lever, this_index)
{
	if (document.getElementById(this_lever.id) != undefined)
		document.getElementById(this_lever.id).parentElement.removeChild(document.getElementById(this_lever.id));

	levers.splice(this_index, 1);
}

lever_remove_group = function(this_group)
{
	for (var i = 0; i < levers.length; i++)
	{
		if (levers[i].group == this_group)
		{
			lever_remove(levers[i], i);
			i--;
		}
	}
}

get_lever = function(lever_name)
{
	for (var i = 0; i < levers.length; i++)
		if (levers[i].name == lever_name)
			return levers[i];

	return undefined;
}

lever_add_registry({
	"type": "panel_button",
	"create": "create_panel_button"
});

lever_add_registry({
	"type": "frame",
	"create": "create_frame"
});

lever_add_registry({
	"type": "readout_basic",
	"create": "create_readout_basic",
	"update": "update_readout_basic"
});

lever_add_registry({
	"type": "adjuster_basic",
	"create": "create_adjuster_basic",
	"update": "update_adjuster_basic"
});

lever_add_registry({
	"type": "label_basic",
	"create": "create_label_basic"
});

lever_add_registry({
	"type": "list",
	"create": "create_list"
});

lever_add_registry({
	"type": "entry_composite",
	"create": "create_entry_composite"
});

lever_add_create_function("create_panel_button", function(e) {
	//console.log(e.detail.lever.type + " " + e.detail.game.main_area.style.width);

	// flag and create custom events
	if (e.detail.lever.select != undefined)
		e.detail.lever.select_event = new CustomEvent(e.detail.lever.select);

	// create panel button
	for (i = 0; i < 10; i++)
		if (document.getElementById(e.detail.game.name + "_panel_" + i) == undefined)
			break;

	if (i == 10)
	{
		console.log("Maximum number of panel buttons exceeded.");
		return;
	}

	panel_id = e.detail.game.name + "_panel_" + i;
	e.detail.lever.id = panel_id;

	// create element
	var panel_button = document.createElement("div");
	panel_button.id = panel_id;
	panel_button.style.position = "absolute";

	// set turn button location within game area
	panel_button.style.left = (parseInt(e.detail.game.game_width) - e.detail.game.turn_button_style.width - e.detail.game.turn_button_style.space) - ((e.detail.game.turn_button_style.width + e.detail.game.turn_button_style.space) * (i + 1)) + "px";
	panel_button.style.top = (parseInt(e.detail.game.game_height) - e.detail.game.turn_button_style.height - e.detail.game.turn_button_style.space) + "px";

	panel_button.style.width = e.detail.game.turn_button_style.width + "px";
	panel_button.style.height = e.detail.game.turn_button_style.height + "px";

	panel_button.style.backgroundColor = e.detail.game.turn_button_style.background;

	panel_button.style.color = e.detail.game.turn_button_style.font_color;
	panel_button.style.fontFamily = e.detail.game.turn_button_style.font_family;
	panel_button.style.fontSize = e.detail.game.turn_button_style.font_size;

	panel_button.style.cursor = e.detail.game.turn_button_style.cursor;

	panel_button.style.borderStyle = "solid";
	panel_button.style.borderWidth = "1px";		
	panel_button.style.borderColor = e.detail.game.turn_button_style.border_color;

	panel_button.innerHTML = "<center><table style = 'vertical-align: middle' height = '" + e.detail.game.turn_button_style.height + "px' cellspacing = '0' cellpadding = '0'><td>" + e.detail.lever.label + "</td></table></center>";

	e.detail.game.main_area.appendChild(panel_button);

	panel_button.onclick = (function (game, lever)
	{
		return function(evt)
		{
			dispatchEvent(lever.select_event);
		}
	}) (e.detail.game, e.detail.lever);
});

lever_add_create_function("create_frame", function(e) {
	// flag and create custom events
	if (e.detail.lever.close_select != undefined)
		e.detail.lever.select_event = new CustomEvent(e.detail.lever.close_select);

	if (e.detail.lever.select != undefined)
		e.detail.lever.select_event = new CustomEvent(e.detail.lever.select);

	frame_id = e.detail.game.name + "_" + e.detail.lever.name;
	e.detail.lever.id = frame_id;

	// create element
	var frame = document.createElement("div");

	frame.id = frame_id;
	frame.style.position = "absolute";	

	frame.style.left = e.detail.lever.x + "px";
	frame.style.top = e.detail.lever.y + "px";

	frame.style.width = e.detail.lever.width + "px";
	frame.style.height = e.detail.lever.height + "px";

	frame.style.backgroundColor = e.detail.lever.background;
	frame.style.zIndex = 1000;

	e.detail.game.main_area.appendChild(frame);

	var frame_close = document.createElement("img");
	frame_close.id = e.detail.game.name + "_" + e.detail.lever.name + "_close_image";
	frame_close.style.position = "absolute";
	frame_close.style.cursor = "pointer";
	frame_close.src = e.detail.lever.close_image;

	frame_close.onload = (function (this_frame)
	{
		return function(evt)
		{
			evt.target.style.left = (parseInt(this_frame.style.width) - parseInt(evt.target.width) - 2) + "px";
			evt.target.style.top = 2 + "px";
		}
	}) (frame);

	frame.appendChild(frame_close);

	frame_close.onclick = (function (game, lever)
	{
		return function(evt)
		{
			dispatchEvent(lever.select_event);
		}
	}) (e.detail.game, e.detail.lever);
});

lever_add_create_function("create_readout_basic", function(e) {
	readout_id = e.detail.game.name + "_" + e.detail.lever.name;
	e.detail.lever.id = readout_id;

	// create element
	var readout = document.createElement("table");

	readout.id = readout_id;
	readout.style.position = "absolute";	

	readout.style.left = e.detail.lever.x + "px";
	readout.style.top = e.detail.lever.y + "px";
	readout.style.width = e.detail.lever.width + "px";

	readout.style.verticalAlign = "middle";
	readout.cellPadding = "0px";
	readout.cellSpacing = "0px";

	readout.style.color = e.detail.lever.font_color;
	readout.style.fontFamily = e.detail.lever.font_family;
	readout.style.fontSize = e.detail.lever.font_size;

	//readout.innerHTML = e.detail.lever.caption + ": " + e.detail.lever.object[e.detail.lever.variable];

	if (e.detail.lever.frame == undefined)
		e.detail.game.main_area.appendChild(readout);
	else
		document.getElementById(get_lever(e.detail.lever.frame).id).appendChild(readout);

	var readout_caption = document.createElement("td");
	readout_caption.style.textAlign = "right";
	readout_caption.innerHTML = e.detail.lever.caption;

	readout.appendChild(readout_caption);

	var readout_variable = document.createElement("td");
	readout_variable.id = readout_id + "_variable";
	readout_variable.style.textAlign = "center";
	readout_variable.style.width = e.detail.lever.variable_width + "px";

	readout_variable.style.color = e.detail.lever.variable_font_color;
	readout_variable.style.backgroundColor = e.detail.lever.variable_background;

	readout_variable.style.borderStyle = "solid";
	readout_variable.style.borderWidth = "1px";
	readout_variable.style.borderColor = e.detail.lever.variable_border;

	readout_variable.innerHTML = e.detail.lever.object[e.detail.lever.variable];

	readout.appendChild(readout_variable);
});

lever_add_update_function("update_readout_basic", function(e) {
	document.getElementById(e.detail.game.name + "_" + e.detail.lever.name + "_variable").innerHTML = e.detail.lever.object[e.detail.lever.variable];
});

lever_add_create_function("create_adjuster_basic", function(e) {
	if (e.detail.lever.down_select != undefined)
		e.detail.lever.down_select_event = new CustomEvent(e.detail.lever.down_select);

	if (e.detail.lever.up_select != undefined)
		e.detail.lever.up_select_event = new CustomEvent(e.detail.lever.up_select);

	adjuster_id = e.detail.game.name + "_" + e.detail.lever.name;
	e.detail.lever.id = adjuster_id;

	// create element
	var adjuster = document.createElement("table");

	adjuster.id = adjuster_id;
	adjuster.style.position = "absolute";	

	adjuster.style.left = e.detail.lever.x + "px";
	adjuster.style.top = e.detail.lever.y + "px";
	adjuster.style.width = e.detail.lever.width + "px";

	adjuster.style.verticalAlign = "middle";
	adjuster.cellPadding = "0px";
	adjuster.cellSpacing = "0px";

	adjuster.style.color = e.detail.lever.font_color;
	adjuster.style.fontFamily = e.detail.lever.font_family;
	adjuster.style.fontSize = e.detail.lever.font_size;

	if (e.detail.lever.frame == undefined)
		e.detail.game.main_area.appendChild(adjuster);
	else
		document.getElementById(get_lever(e.detail.lever.frame).id).appendChild(adjuster);

	var adjuster_caption = document.createElement("td");
	adjuster_caption.style.textAlign = "right";
	adjuster_caption.innerHTML = e.detail.lever.caption;

	adjuster.appendChild(adjuster_caption);

	var adjuster_down = document.createElement("td");
	adjuster_down.id = adjuster_id + "_down_td";
	adjuster_down.style.cursor = "pointer";

	adjuster_down.innerHTML = "<img id = '" + adjuster_id + "_down' src='" + e.detail.lever.down_image + "'>";
	adjuster.appendChild(adjuster_down);

	document.getElementById(adjuster_id + "_down").onload = function(evt)
	{
		document.getElementById(evt.target.id + "_td").style.width = parseInt(evt.target.width) + "px";
	}

	adjuster_down.onclick = (function(this_lever)
	{
		return function(evt)
		{
			lever = this_lever;
			dispatchEvent(lever.down_select_event);
		}
	}) (e.detail.lever)

	var adjuster_variable = document.createElement("td");
	adjuster_variable.id = adjuster_id + "_variable";
	adjuster_variable.style.textAlign = "center";
	adjuster_variable.style.width = e.detail.lever.variable_width + "px";

	adjuster_variable.style.color = e.detail.lever.variable_font_color;
	adjuster_variable.style.backgroundColor = e.detail.lever.variable_background;

	adjuster_variable.style.borderStyle = "solid";
	adjuster_variable.style.borderWidth = "1px";
	adjuster_variable.style.borderColor = e.detail.lever.variable_border;

	adjuster_variable.innerHTML = e.detail.lever.object[e.detail.lever.variable];

	adjuster.appendChild(adjuster_variable);

	var adjuster_up = document.createElement("td");
	adjuster_up.id = adjuster_id + "_up_td";
	adjuster_up.style.cursor = "pointer";

	adjuster_up.innerHTML = "<img id = '" + adjuster_id + "_up' src='" + e.detail.lever.up_image + "'>";
	adjuster.appendChild(adjuster_up);

	document.getElementById(adjuster_id + "_up").onload = function(evt)
	{
		document.getElementById(evt.target.id + "_td").style.width = parseInt(evt.target.width) + "px";
	}

	adjuster_up.onclick = (function(this_lever)
	{
		return function(evt)
		{
			lever = this_lever;
			dispatchEvent(lever.up_select_event);
		}
	}) (e.detail.lever)
});

lever_add_update_function("update_adjuster_basic", function(e) {
	document.getElementById(e.detail.game.name + "_" + e.detail.lever.name + "_variable").innerHTML = e.detail.lever.object[e.detail.lever.variable];
});

lever_add_create_function("create_label_basic", function(e) {
	label_id = e.detail.game.name + "_" + e.detail.lever.name;
	e.detail.lever.id = label_id;

	// create element
	var label = document.createElement("div");

	label.id = label_id;
	label.style.position = "absolute";	

	label.style.left = e.detail.lever.x + "px";
	label.style.top = e.detail.lever.y + "px";

	label.style.color = e.detail.lever.font_color;
	label.style.fontFamily = e.detail.lever.font_family;
	label.style.fontSize = e.detail.lever.font_size;

	label.innerHTML = e.detail.lever.caption;

	if (e.detail.lever.frame == undefined)
		e.detail.game.main_area.appendChild(label);
	else
		document.getElementById(get_lever(e.detail.lever.frame).id).appendChild(label);
});

lever_add_create_function("create_list", function(e) {
	list_id = e.detail.game.name + "_" + e.detail.lever.name;
	e.detail.lever.id = list_id;

	// create element
	var list = document.createElement("div");

	list.id = list_id;
	list.style.position = "absolute";	

	list.style.left = e.detail.lever.x + "px";
	list.style.top = e.detail.lever.y + "px";

	list.style.width = e.detail.lever.width + "px";
	list.style.height = e.detail.lever.height + "px";

	list.style.backgroundColor = e.detail.lever.background;
	list.style.overflowY = "scroll";	
	list.style.overflowX = "hidden";

	if (e.detail.lever.frame == undefined)
		e.detail.game.main_area.appendChild(list);
	else
		document.getElementById(get_lever(e.detail.lever.frame).id).appendChild(list);
});

lever_add_create_function("create_entry_composite", function(e) {
	for (var i = 0; i < 1000; i++)
		if (document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i) == undefined)
			break;

	if (e.detail.lever.select != undefined)
		e.detail.lever.select_event = new CustomEvent(e.detail.lever.select);

	entry_id = e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i;
	e.detail.lever.id = entry_id;

	entry_list = get_lever(e.detail.lever.list);

	// create element
	var entry = document.createElement("div");

	entry.id = entry_id;
	entry.style.position = "absolute";

	entry.style.left = entry_list.entry_space + "px";
	entry.style.top = entry_list.entry_space + ((entry_list.entry_height + entry_list.entry_space) * i) + "px";

	entry.style.width = entry_list.width - (entry_list.entry_space * 2) - (scrollbarWidth + entry_list.entry_space) + "px";
	entry.style.height = entry_list.entry_height + "px";

	entry.style.backgroundColor = e.detail.lever.background;
	entry.style.borderStyle = "solid";
	entry.style.borderWidth = "0px";
	entry.style.borderColor = e.detail.lever.border_color;

	document.getElementById(entry_list.id).appendChild(entry);

	var entry_image = document.createElement("img");
	entry_image.style.position = "absolute";

	entry_image.style.left = e.detail.lever.image_x + "px";
	entry_image.style.top = e.detail.lever.image_y + "px";
	entry_image.src = e.detail.lever.image;

	entry.appendChild(entry_image);

	var entry_label = document.createElement("div");
	entry_label.style.position = "absolute";	

	entry_label.style.left = e.detail.lever.label_x + "px";
	entry_label.style.top = e.detail.lever.label_y + "px";

	entry_label.style.color = e.detail.lever.label_font_color;
	entry_label.style.fontFamily = e.detail.lever.label_font_family;
	entry_label.style.fontSize = e.detail.lever.label_font_size;

	entry_label.innerHTML = e.detail.lever.label;

	entry.appendChild(entry_label);

	entry.onmouseup = (function (this_canvas, this_div, this_lever)
	{
		return function(evt)
		{
			for (var i = 0; i < 1000; i++)
			{
				if (document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i) == undefined)
					break;
				else
				{
					if (document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i).style.borderWidth == "1px")
						document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i).style.left = parseInt(document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i).style.left) + 1 + "px";

					document.getElementById(e.detail.game.name + "_" + e.detail.lever.list + "_entry_" + i).style.borderWidth = "0px";
				}
			}

			this_div.style.borderWidth = "1px";
			this_div.style.left = parseInt(this_div.style.left) - 1 + "px";

			if (this_lever.select_event != undefined)
			{
				lever = this_lever;
				dispatchEvent(lever.select_event);
			}
		}
	}) (e.detail.game, entry, e.detail.lever)
});
