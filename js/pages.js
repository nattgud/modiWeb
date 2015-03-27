// --- Toolbox ---
// Tools for the pageeditor
var tools_marked = -1;
var tools_cid = 0;
var tools_min = false;
var tools_heightvar = 0;
var tools_objects = [];
var tools_cats = [];
var tools_tools = {
	"all": [],
	"P": [],
	"A": [],
	"H1": [],
	"H2": [],
	"H3": [],
	"IMG": [],
	"TABLE": [],
	"UL": []
};
var tools_link2follow = "";
function tools_save() {
	popup("Sparar sidan...");
	tools_mark("none");
	var onclicks = [];
	for(var c = 0; c < obj("pageeditor").children.length; c++) {
		var o = obj("pageeditor").children[c];
		o.style.background = "";
		onclicks[o.id] = o.onclick;
		o.removeAttribute("onclick");
	}
	var toSend = obj("pageeditor").innerHTML;
	ajax("functions/savepage.php?id="+pageId+"&content="+toSend, "GET", "popup");
	for(var c = 0; c < obj("pageeditor").children.length; c++) {
		var o = obj("pageeditor").children[c];
		o.onclick = onclicks[o.id];
	}
}
function tools_load() {
	for(var c = 0; c < obj("pageeditor").children.length; c++) {
		var o = obj("pageeditor").children[c];
		o.id = "el"+c;
		o.vars = [];
		if(o.tagName == "P") {
			o.vars.type = "P";
		} else if(o.tagName == "H1") {
			o.vars.type = "H1";
		} else if(o.tagName == "H2") {
			o.vars.type = "H2";
		} else if(o.tagName == "H3") {
			o.vars.type = "H3";
		} else if(o.tagName == "DIV") {
			if(o.children[0].tagName == "IMG") {
				o.vars.type = "IMG";
			} else {
				alert("ERROR");
			}
		} else if(o.tagName == "TABLE") {
			o.vars.type = "TABLE";
		} else if(o.tagName == "UL") {
			o.vars.type = "UL";
		} else if(o.tagName == "A") {
			o.vars.type = "A";
		}
		var ev = document.createAttribute("onclick");
		if(o.vars.type == "A") {
			ev.value = "tools_mark(this); tools_followLink();";
		} else {
			ev.value = "tools_mark(this);";
		}
		o.setAttributeNode(ev);
	}
	tools_disable(obj("tools_code"));
}
function tools_loadTool(object, cat) {
	if(cat.search(" ") !== -1) {
		for(var v in cat.split(" ")) {
			tools_tools[cat.split(" ")[v]].push(object);
		}
	} else {
		tools_tools[cat].push(object);
	}
}
function tools_changeTools() {
	var disabled = [];
	if(tools_marked !== -1) {
		for(var cat in tools_tools) {
			if(cat !== "all") {
				for(var tool in tools_tools[cat]) {
					var found = false;
					for(var c in disabled) {
						if(disabled[c] == tools_tools[cat][tool]) {
							found = true;
						}
					}
					if(found != true) {
						if(cat != tools_marked.vars.type) {
							var newTool = true;		// fix flyt-swaping
							for(var temp in tools_tools[tools_marked.vars.type]) {
								if(tools_tools[tools_marked.vars.type][temp] == tools_tools[cat][tool]) {
									newTool = false;
								}
							}
							if(newTool === true) {
								tools_disable(tools_tools[cat][tool]);
								disabled.push(tools_tools[cat][tool]);
							}
						} else {
							tools_undisable(tools_tools[cat][tool]);
						}
					}
				}
			}
		}
		tools_undisable(obj("tools_editTools"));
	} else {
		for(var v in tools_tools) {
			if(v !== "all") {
				for(var tool in tools_tools[v]) {
					tools_disable(tools_tools[v][tool]);
				}
			}
		}
		for(var v in tools_tools["all"]) {
			tools_undisable(tools_tools["all"][v]);
		}
		tools_disable(obj("tools_editTools"));
	}
}
function tools_undisable(object) {
	if(object.classList.contains("disabledTool") == true) {
		if(object.tagName == "TR") {
			object.style.display = "table-row";
			setTimeout(function() {
				object.classList.remove("disabledTool");
			}, 1);
		} else {
			object.style.display = "inline";
			setTimeout(function() {
				object.classList.remove("disabledTool");
			}, 1);
		}
	}
}
function tools_disable(object) {
	if(object.classList.contains("disabledTool") != true) {
		setTimeout(function(){
			object.style.display = "none";
		}, 210);
		object.classList.add("disabledTool");
	}
}
function tools_minmax() {
	if(tools_min == false) {
		tools_heightvar = obj("pageeditmenu").style.height;
		obj("pageeditmenu").style.height = "38px";
		obj("pageeditmenu").style.overflowY = "hidden";
		tools_min = true;
	} else {
		obj("pageeditmenu").style.height = tools_heightvar;
		obj("pageeditmenu").style.overflowY = "auto";
		tools_min = false;
	}
}
function tools_create(type) {
	var main = obj("pageeditor");
	var object = document.createElement(type);
	var id = "el"+obj("pageeditor").children.length;
	tools_objects.push(id);
	var ev = document.createAttribute("onclick");
	if(type == "A") {
		ev.value = "tools_mark(this); tools_followLink();";
	} else {
		ev.value = "tools_mark(this);";
	}
	var vars = {
		type: type,
		obj: "this"
	};
	if(type == "P") {
		object.innerHTML = "Nytt text-element";
	} else if(type == "A") {
		object.innerHTML = "Ny länk";
		object.target = "_blank";
	} else if(type == "IMG") {
		vars.obj = "child";
		frame = document.createElement("DIV");
		object.src = "img/tools_emptyimage.png";
		var sub = document.createElement("P");
		sub.classList.add("subtext");
		frame.classList.add("img");
	} else if(type == "TABLE") {
		object.innerHTML = "<tr><td><p>Ny tabell</p></td></tr>";
		vars.border = false;
		vars.borderColor = "#000";
		vars.borderWidth = "1";
		vars.editMode = false;
	} else if(type == "UL") {
		object.innerHTML = "<li><p>Ny lista</p></li>";
		vars.editMode = false;
	}
	if(type != "IMG") {
		object.vars = vars;
		object.setAttributeNode(ev);
		object.id = id;
		main.appendChild(object);
		tools_mark(object);
	} else {
		frame.vars = vars;
		frame.setAttributeNode(ev);
		frame.id = id;
		main.appendChild(frame);
		frame.appendChild(object);
		frame.appendChild(sub);
		tools_mark(frame);
	}
}
function tools_editType(type, object) {
	if(tools_marked !== -1) {
		if(type == "none") {
			obj("toolsContent").value = "";
		} else if(type == "P") {
			text = object.innerHTML;
			obj("toolsContent").value = text;
		} else if(type == "A") {
			text = object.innerHTML;
			obj("toolsContent").value = text;
			obj("toolsLink").value = object.href;
		} else if(type == "H1") {
			text = object.innerHTML;
			obj("toolsContent").value = text;
		} else if(type == "H2") {
			text = object.innerHTML;
			obj("toolsContent").value = text;
		} else if(type == "H3") {
			text = object.innerHTML;
			obj("toolsContent").value = text;
		} else if(type == "IMG") {
			var chosen = 0;
			var src = tools_marked.children[0].src
			for(var c = 0; c < obj("toolsImageUrl").options.length; c++) {
				if(obj("toolsImageUrl").options[c].value == src.substr(-obj("toolsImageUrl").options[c].value.length)) {
					chosen = c;
				}
			}
			obj("toolsImageUrl").selectedIndex = chosen;
			obj("toolsImageMaxwidth").value = tools_marked.style.maxWidth.replace("px", "");
			tools_updateImage();
		}
	}
}
function tools_change() {
	if(tools_marked !== -1) {
		if(obj("toolsContent").value != "") {
			tools_marked.innerHTML = obj("toolsContent").value;
		} else {
			popup("Du måste fylla i text");
		}
		tools_updateCodearea();
	}
}
function tools_detailEdit() {
	if(tools_marked !== -1) {
		if(tools_marked.vars.editMode == false) {
			if(tools_marked.vars.type == "TABLE") {
				for(var r = 0; r < tools_marked.rows.length; r++) {
					for(var c = 0; c < tools_marked.rows[r].cells.length; c++) {
						var str = tools_marked.rows[r].cells[c].innerHTML;
						str = str.replace("<p>", "");
						str = str.replace("</p>", "");
						tools_marked.rows[r].cells[c].innerHTML = "<input type='text' value='"+str+"' />";
						tools_marked.rows[r].cells[c].children[0].size = str.length;
					}
				}
				tools_marked.vars.editMode = true;
			} else if(tools_marked.vars.type == "UL") {
				for(var c = 0; c < tools_marked.children.length; c++) {
					var str = tools_marked.children[c].innerHTML;
					str = str.replace("<p>", "");
					str = str.replace("</p>", "");
					tools_marked.children[c].innerHTML = "<input type='text' value='"+str+"' />";
					tools_marked.children[c].size = str.length;
				}
				tools_marked.vars.editMode = true;
			}
		} else {
			popup("Redigerar redan objektet");
		}
	}
}
function tools_detailEditSave() {
	if(tools_marked !== -1) {
		if(tools_marked.vars.editMode == true) {
			if(tools_marked.vars.type == "TABLE") {
				for(var r = 0; r < tools_marked.rows.length; r++) {
					for(var c = 0; c < tools_marked.rows[r].cells.length; c++) {
						var str = tools_marked.rows[r].cells[c].children[0].value;
						tools_marked.rows[r].cells[c].innerHTML = "<p>"+str+"</p>";
					}
				}
				tools_marked.vars.editMode = false;
			} else if(tools_marked.vars.type == "UL") {
				for(var c = 0; c < tools_marked.children.length; c++) {
					var str = tools_marked.children[c].children[0].value;
					tools_marked.children[c].innerHTML = "<p>"+str+"</p>";
				}
				tools_marked.vars.editMode = false;
			}
		}
		tools_updateCodearea();
	}
}
function tools_changeLink() {
	if(tools_marked !== -1) {
		if(obj("toolsLink").value != "") {
			if(obj("toolsLink").value.length > 3) {
				if((obj("toolsLink").value.substr(0, 4) != "http") && (obj("toolsLink").value.substr(0, 3) != "ftp") && (obj("toolsLink").value.substr(0, 4) != "mail")) {
					obj("toolsLink").value = "http://"+obj("toolsLink").value;
					setTimeout(function(){ tools_changeLink(); }, 200);
				} else {
					tools_marked.href = obj("toolsLink").value;
				}
			} else {
				tools_marked.href = obj("toolsLink").value;
			}
		} else {
			tools_marked.removeAttribute("href");
			popup("Länken är tom");
		}
		tools_updateCodearea();
	}
}
function tools_followLink() {
	if(tools_marked !== -1) {
		if(tools_marked.vars.type == "A") {
			if(tools_marked.href != "") {
				if(tools_link2follow == tools_marked) {
					tools_link2follow = "";
				} else {
					popup("Är du säker på att du vill följa denna länken? Klicka igen.");
					tools_link2follow = tools_marked;
					setTimeout(function() {
						tools_link2follow = "";
						popup("Länk ej följd");
					}, 1500);
					event.preventDefault();
					return false;
				}
			}
		}
	}
}
function tools_mark(object) {
	if(object != "none") {
		tools_marked = object;
		obj("tools_current").innerHTML = "<b>Markerat:</b> "+tools_marked.id;
		tools_editType(tools_marked.vars.type, object);
		for(var c = 0; c < obj("pageeditor").children.length; c++) {
			obj("pageeditor").children[c].style.background = "";
		}
		object.style.background = "#FA9DAF";
	} else {
		tools_marked = -1;
		obj("tools_current").innerHTML = "Välj ett element";
		tools_editType("none", "");
	}
	tools_changeTools();
	tools_updateCodearea();
}
function tools_del() {
	if(tools_marked !== -1) {
		obj("pageeditor").removeChild(tools_marked);
		tools_mark("none");
		tools_editCode(false);
	} else {
		popup("Inget markerat");
	}
}
function tools_move(dir) {
	if(tools_marked !== -1) {
		var pos = 0;
		for(var c = 0; c < obj("pageeditor").children.length; c++) {
			if(obj("pageeditor").children[c] == tools_marked) {
				var co = obj("pageeditor").children[c];
				if(dir == "up") {
					if(c == 0) {
						popup("Redan först");
					} else {
						obj("pageeditor").insertBefore(co, obj("pageeditor").children[c-1]);
						return;
					}
				} else if(dir == "down") {
					if(c == obj("pageeditor").children.length-1) {
						popup("Redan sist");
					} else {
						obj("pageeditor").insertBefore(obj("pageeditor").children[c+1], co);
						return;
					}
				}
			}
		}
	} else {
		popup("Inget markerat");
	}
}
function tools_align(align) {
	if(tools_marked != -1) {
		tools_marked.style.textAlign = align;
		tools_updateCodearea();
	}
}
function tools_textSize(size) {
	if(tools_marked != -1) {
		var str = tools_marked.innerHTML;
		
		var main = obj("pageeditor");
		var object = document.createElement(size);
		var id = tools_marked.id//"el"+tools_cid;
		//tools_objects.push(id);
		var ev = document.createAttribute("onclick");
		ev.value = "tools_mark(this);";
		var vars = {
			type: size,
			obj: "this"
		};
		object.innerHTML = str;
		object.vars = vars;
		object.setAttributeNode(ev);
		object.id = id;
		object.style.textAlign = tools_marked.style.textAlign;
		object.style.float = tools_marked.style.float;
		object.style.display = tools_marked.style.display;
		main.appendChild(object);
		obj("pageeditor").replaceChild(object, tools_marked);
		tools_mark(object);
		tools_updateCodearea();
	}
}
function tools_displayType(display) {
	if(tools_marked != -1) {
		tools_marked.style.display = display;
		tools_updateCodearea();
	}
}
function tools_float(floatTo) {
	if(tools_marked != -1) {
		if(floatTo != "none") {
			tools_marked.style.float = floatTo;
			if(floatTo == "left") {
				tools_marked.style.clear = "right";
			} else if(floatTo == "right") {
				tools_marked.style.clear = "left";
			}
		} else {
			if(tools_marked.style.float == "none") {
				popup("Elementet flyter redan inte");
			} else {
				tools_marked.style.float = "none";
			}
		}
		tools_updateCodearea();
	}
}
function tools_maxWidth() {
	if(tools_marked != -1) {
		if((obj("toolsImageMaxwidth").value != "") && (obj("toolsImageMaxwidth").value != 0)) {
			tools_marked.style.maxWidth = obj("toolsImageMaxwidth").value+"px";
		} else {
			tools_marked.style.maxWidth = "";
		}
		tools_updateCodearea();
	}
}
function tools_tableRow(type) {
	if(tools_marked != -1) {
		if(type == "add") {
			var row = tools_marked.insertRow(-1);
			var fcell = row.insertCell(-1);
			if(tools_marked.vars.editMode == true) {
				fcell.innerHTML = "<input type='text' value='Ny cell' />";
				fcell.children[0].size = 7;
			} else {
				fcell.innerHTML = "<p>Ny cell</p>";
			}
			for(var c = 1; c < tools_marked.rows[0].cells.length; c++) {
				var cell = row.insertCell(-1);
				if(tools_marked.vars.editMode == true) {
					cell.innerHTML = "<input type='text' value='Ny cell' />";
					cell.children[0].size = 7;
				} else {
					cell.innerHTML = "<p>Ny cell</p>";
				}
			}
			tools_updTableBorders();
		} else {
			tools_marked.deleteRow(-1);
			if(tools_marked.rows.length == 0) {
				tools_del();
			} else {
				tools_updTableBorders();
			}
		}
		tools_updateCodearea();
	}
}
function tools_tableCell(type) {
	if(tools_marked != -1) {
		if(type == "add") {
			for(var v in tools_marked.rows) {
				if((v != "length") && (v != "item") && (v != "namedItem")) {
					var row = tools_marked.rows[v];
					var cell = row.insertCell(-1);
					if(tools_marked.vars.editMode == true) {
						cell.innerHTML = "<input type='text' value='Ny cell' />";
						cell.children[0].size = 7;
					} else {
						cell.innerHTML = "<p>Ny cell</p>";
					}
				}
			}
			tools_updTableBorders();
		} else {
			for(var c = 0; c < tools_marked.rows.length; c++) {
				tools_marked.rows[c].deleteCell(-1);
			}
			if(tools_marked.rows[0].cells.length == 0) {
				tools_del();
			}else {
				tools_updTableBorders();
			}
		}
		tools_updateCodearea();
	}
}
function tools_updTableBorders() {
	if(tools_marked != -1) {
		if(tools_marked.vars.border == true) {
			var style = tools_marked.vars.borderWidth+"px solid "+tools_marked.vars.borderColor;
			for(var row = 0; row < tools_marked.rows.length; row++) {
				for(var cell = 0; cell < tools_marked.rows[row].cells.length; cell++) {
					var theCell = tools_marked.rows[row].cells[cell];
					theCell.style.border = style;
				}
			}
		} else {
			for(var row = 0; row < tools_marked.rows.length; row++) {
				for(var cell = 0; cell < tools_marked.rows[row].cells.length; cell++) {
					tools_marked.rows[row].cells[cell].style.border = "none";
				}
			}
		}
	}
}
function tools_tableBorder(type) {
	if(tools_marked != -1) {
		if(type == "add") {
			if(tools_marked.vars.border == true) {
				popup("Tabellen har redan kanter");
			} else {
				tools_marked.vars.border = true;
			}
		} else {
			if(tools_marked.vars.border == false) {
				popup("Tabellen saknar redan kanter");
			} else {
				tools_marked.vars.border = false;
			}
		}
		tools_updTableBorders();
		tools_updateCodearea();
	}
}
function tools_list(todo) {
	if(tools_marked != -1) {
		if(todo == "add") {
			var li = document.createElement("LI");
			li.innerHTML = "<p>Punkt</p>";
			tools_marked.appendChild(li);
		} else {
			if(tools_marked.children.length == 1) {
				tools_del();
			} else {
				tools_marked.removeChild(tools_marked.children[tools_marked.children.length-1]);
			}
		}
		tools_updateCodearea();
	}
}

function tools_getAllObjects(type) {
	if (typeof(type)==='undefined') type = "";
	var objects = [];
	for(var v in obj("pageeditor").children) {
		for(var v2 in tools_objects) {
			if(type != "") {
				if(obj("pageeditor").children[v].tagName == type) {
					objects.push(obj("pageeditor").children[v]);
				}
			} else {
				objects.push(obj("pageeditor").children[v]);
			}
		}
	}
	return objects;
}
function tools_updateImage() {
	if(tools_marked != -1) {
		if(obj("toolsImageUrl").value != "false") {
			tools_marked.children[0].src = obj("toolsImageUrl").value;
			for(var c in subtextsIndex) {
				if(subtextsIndex[c] == obj("toolsImageUrl").value) {
					tools_marked.children[1].innerHTML = subtexts[c];
				}
			}
		} else {
			tools_marked.children[0].src = "img/tools_emptyimage.png";
		}
		tools_updateCodearea();
	}
}
function tools_updateCodearea() {
	obj("codearea").value = tools_marked.innerHTML;
	obj("codearea").rows = Math.ceil((obj("codearea").value.length)/35);
}
function tools_editCode(set) {
	if(typeof set == "undefined") {
		if(obj("tools_code").classList.contains("disabledTool")) {
			tools_undisable(obj("tools_code"));
			tools_updateCodearea();
		} else {
			tools_disable(obj("tools_code"));
		}
	}
	if(set == true) {
		tools_undisable(obj("tools_code"));
		tools_updateCodearea();
	} else {
		tools_disable(obj("tools_code"));
	}
}
function tools_updateCode() {
	tools_marked.innerHTML = obj("codearea").value;
	tools_mark(tools_marked);
}