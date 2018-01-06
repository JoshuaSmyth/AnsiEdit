// Query DOM
var canvas_main = document.getElementById("canvas_main");
var canvas_cursor = document.getElementById("canvas_cursor");
var canvas_tileset = document.getElementById("canvas_tileset");
var btn_save = document.getElementById("btnSave");
var btn_export_png = document.getElementById("btnExportPNG");
var btn_new = document.getElementById("btnNew");
var btn_del = document.getElementById("btnDel");
var btn_export = document.getElementById("btnJson");
var btn_import = document.getElementById("btnImportJson");
var images_list = document.getElementById("myImages"); 

// Declare other globals
var canvas_main_ctx = canvas_main.getContext("2d");
var canvas_cursor_ctx = canvas_cursor.getContext("2d");
var canvas_tileset_ctx=canvas_tileset.getContext("2d");
var canvas_tileset_data = canvas_tileset_ctx.getImageData(0,0,289,105);

var tool_pen = document.getElementById("tool_pen");
var tool_clone = document.getElementById("tool_clone");
var tool_walk = document.getElementById("tool_walk");

var txtArea = document.getElementById("txtArea"); 

var txtNorth = document.getElementById("txtNorth");
var txtSouth = document.getElementById("txtSouth");
var txtEast = document.getElementById("txtEast");
var txtWest = document.getElementById("txtWest");

function Color(r,g,b) {
    this.Red = r;
    this.Green = g;
    this.Blue = b;

    this.ToHex = function() {
        return "#" + ((1 << 24) + (this.Red << 16) + (this.Green << 8) + this.Blue).toString(16).slice(1, 7);
    };
}

var cursor = new function() {
    this.Id = 177;
    this.Fgc = 15;
    this.Bgc = 0;
};

var tile_width = 8;
var tile_height = 12;
function Tile() {
    this.Id = 0;
    this.Fgc =0;
    this.Bgc = 0;
    this.W = 1;          // True
};

toolEnum = {
    PAINT: 0,
    CLONE: 1,
    WALK: 2
};
var tool_mode = toolEnum.PAINT;
tool_pen.onclick = function () {
    tool_mode = toolEnum.PAINT;
    drawMap();
};
tool_clone.onclick = function () {
    tool_mode = toolEnum.CLONE;
    drawMap();
};
tool_walk.onclick = function () {
    tool_mode = toolEnum.W;
    drawMap();
};

function mapHeader()
{
    Id = 0,
    Name = ""
}

var map_width = 60;
var map_height = 20;
function Map()
{    
    this.Id = 0;

    this.Tiles = new Array(map_width);
      for (var i = 0; i < map_width; i++) {
        this.Tiles[i] = new Array(map_height);
      }

    for(var x=0;x<map_width;x++) {
        for(var y=0;y<map_height;y++) {
            this.Tiles[x][y] = new Tile();
            this.Tiles[x][y].Bgc = 0; 
            this.Tiles[x][y].Fgc = 15;
            this.Tiles[x][y].Id = 0;
            this.Tiles[x][y].W = 0;
        }
    }

    this.N = 0;

    this.S = 0;

    this.E = 0;

    this.W = 0;
}

var map_array = new Array();
map_array.push(new Map());
var currentMap = map_array[0];
 console.log(map_array[0]);

 var palette = new Array();
var currentMapId = 0;

palette[0] = new Color(20, 12, 28);
palette[1] = new Color(70, 38, 53);
palette[2] = new Color(49, 53, 109);
palette[3] = new Color(80, 77, 80);

palette[4] = new Color(134, 78, 50);
palette[5] = new Color(53, 102, 37);
palette[6] = new Color(208, 74, 76);
palette[7] = new Color(114, 110, 108);

palette[8] = new Color(89, 125, 205);
palette[9] = new Color(209, 124, 44);
palette[10] = new Color(137, 149, 165);
palette[11] = new Color(111, 170, 47);

palette[12] = new Color(208, 170, 152);
palette[13] = new Color(112, 195, 203);
palette[14] = new Color(217, 211, 93);
palette[15] = new Color(219, 233, 209);

 

canvas_main_ctx.fillStyle="#000000";
canvas_main_ctx.fillRect(0,0,480,240);

canvas_cursor_ctx.fillStyle=palette[15].ToHex();
canvas_cursor_ctx.fillRect(0,0,8,16);

function refreshCursor()
{
	// Fill background
	canvas_cursor_ctx.fillStyle=palette[cursor.Bgc].ToHex();
	canvas_cursor_ctx.fillRect(0,0,tile_width,tile_height);

    var canvas_cursor_data = canvas_cursor_ctx.getImageData(0, 0, tile_width, tile_height);
	
    // Draw foreground
    var tileX = Math.floor(cursor.Id % 32);
    var tileY = Math.floor(cursor.Id / 32);

    var sX = tileX*(tile_width+1)+1;      // The +1's are because of the border
    var sY = tileY*(tile_height+1)+1;

    // Foreground
    var foreground = palette[cursor.Fgc];
    var background = palette[cursor.Bgc];

    for(var y =0;y<tile_height;y++) {
        for(var x=0;x<tile_width;x++) {

            var s = (sX+sY*289)*4;  // Topleft corner
            s += x*4 + y*289*4;

            var r = canvas_tileset_data.data[s];
            var d = (x+y*tile_width)*4;

            if (r > 0)  // TODO Remove branch
            {
                canvas_cursor_data.data[d] = foreground.Red;    // Red 
                canvas_cursor_data.data[d+1] = foreground.Green;    // Green 
                canvas_cursor_data.data[d+2] = foreground.Blue;    // Blue
            }  
            else
            {
                canvas_cursor_data.data[d] = background.Red;    // Red 
                canvas_cursor_data.data[d+1] = background.Green;    // Green 
                canvas_cursor_data.data[d+2] = background.Blue;    // Blue
            }
        }
    }

    canvas_cursor_ctx.putImageData(canvas_cursor_data,0,0);
}

function drawMap()
{
    var canvas_main_ctx_data = canvas_main_ctx.getImageData(0,0,480,240);

    // Draw foreground
    var p1=0;
    for(var y=0;y<map_height;y++) {
        for(var x=0;x<map_width;x++) {

            var tileId = currentMap.Tiles[x][y].Id;
            var tileX = Math.floor(tileId % 32);
            var tileY = Math.floor(tileId / 32);

            var sX = tileX*(tile_width+1)+1;      // The +1's are because of the border
            var sY = tileY*(tile_height+1)+1;
            var s = (sX+sY*289)*4;  // Topleft corner
            
            // Foreground
            var foreground = palette[currentMap.Tiles[x][y].Fgc];
            var background = palette[currentMap.Tiles[x][y].Bgc];
            // Draw tile
            var destPixel = x*4*8 + y*480*12*4;
            for(var j=0;j<12;j++) {
                for(var i=0;i<8;i++) {

                    var src_pixel = canvas_tileset_data.data[s + i*4 + j*289*4];

                    if (src_pixel> 0)  // TODO Remove branch
                    {
                        canvas_main_ctx_data.data[destPixel] = foreground.Red;
                        canvas_main_ctx_data.data[destPixel+1] = foreground.Green;
                        canvas_main_ctx_data.data[destPixel+2] = foreground.Blue;
                    }
                    else
                    {
                        canvas_main_ctx_data.data[destPixel] = background.Red;
                        canvas_main_ctx_data.data[destPixel+1] = background.Green;
                        canvas_main_ctx_data.data[destPixel+2] = background.Blue;
                    }
                    destPixel += 4;
                }
                destPixel+=(480-8)*4;
            }
        }
    }

    canvas_main_ctx.putImageData(canvas_main_ctx_data, 0, 0);

    // Render non-walk areas
    canvas_main_ctx.globalAlpha = 0.5;
    canvas_main_ctx.fillStyle = "#FF00FF";
    if (tool_mode == toolEnum.W) {
        console.log("render non-walk area");
        for (var y = 0; y < map_height; y++) {
            for (var x = 0; x < map_width; x++) {
                if(currentMap.Tiles[x][y].W) {
                    canvas_main_ctx.fillRect(x*tile_width, y*tile_height, tile_width, tile_height);
                }
            }
        }
    }
}

function redrawTile(x, y)
{
    var tile = currentMap.Tiles[x][y];
    var data = canvas_main_ctx.getImageData(0,0,480,240);

    var tileId = tile.Id;
    var tileX = Math.floor(tileId % 32);
    var tileY = Math.floor(tileId / 32);

    var sX = tileX*(tile_width+1)+1;      // The +1's are because of the border
    var sY = tileY*(tile_height+1)+1;
    var s = (sX+sY*289)*4;  // Topleft corner
    
    var foreground = palette[tile.Fgc];
    var background = palette[tile.Bgc];

    // Draw tile
    var destPixel = x*4*8 + y*480*12*4;
    for(var j=0;j<12;j++) {
        for(var i=0;i<8;i++) {

            var src_pixel = canvas_tileset_data.data[s + i*4 + j*289*4];

            if (src_pixel> 0)  // TODO Remove branch
            {
                data.data[destPixel] = foreground.Red;
                data.data[destPixel+1] = foreground.Green;
                data.data[destPixel+2] = foreground.Blue;
            }
            else
            {
                data.data[destPixel] = background.Red;
                data.data[destPixel+1] = background.Green;
                data.data[destPixel+2] = background.Blue;
            }
            destPixel += 4;
        }
        destPixel+=(480-8)*4;
    }

    canvas_main_ctx.putImageData(data, 0, 0);

    canvas_main_ctx.globalAlpha = 0.5;
    canvas_main_ctx.fillStyle = "#FF00FF";
    if (tool_mode == toolEnum.W) {
        console.log("render tile non-walk area");
        if (currentMap.Tiles[x][y].W) {
            canvas_main_ctx.fillRect(x * tile_width, y * tile_height, tile_width, tile_height);
        }
    }
}

var cusid_ele = document.getElementsByClassName('paletteForegroundItem');
for (var i = 0; i < cusid_ele.length; ++i) {
    var item = cusid_ele[i];  
    item.style.background  = palette[i].ToHex();
    item.tag = i;
    item.onclick = function() {
        cursor.Fgc = this.tag;
        refreshCursor();
    };
}

var cusid_ele = document.getElementsByClassName('paletteBackgroundItem');
for (var i = 0; i < cusid_ele.length; ++i) {
    var item = cusid_ele[i];  
    item.style.background  = palette[i].ToHex();
    item.tag = i;
    item.onclick = function() {
        cursor.Bgc = this.tag;
        refreshCursor();
    };
}

var paintTile = function (e) {
    var rect = canvas_main.getBoundingClientRect();

    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var tileX = Math.floor(x / tile_width);
    var tileY = Math.floor(y / tile_height);
    console.log("Tool mode" + tool_mode);

    if (tileX > 80 || tileY < 0)
        return;

    if (tileY > 20 || tileY < 0)
        return;

    if (tool_mode == toolEnum.CLONE) {
        cursor.Bgc = currentMap.Tiles[tileX][tileY].Bgc;
        cursor.Fgc = currentMap.Tiles[tileX][tileY].Fgc;
        cursor.Id = currentMap.Tiles[tileX][tileY].Id;
        refreshCursor();
        tool_pen.click();   // Select the pen tool
        return;
    }

    if (e.button == 2) {

        if (tool_mode == toolEnum.W) {
            currentMap.Tiles[tileX][tileY].W = 0;
        } else {
            currentMap.Tiles[tileX][tileY].Bgc = 0;
            currentMap.Tiles[tileX][tileY].Fgc = 0;
            currentMap.Tiles[tileX][tileY].Id = 0;
        }

    } else {

        if (tool_mode == toolEnum.W) {
            currentMap.Tiles[tileX][tileY].W = 1;
        } else {
            if (currentMap.Tiles[tileX][tileY].Bgc != cursor.Bgc ||
                currentMap.Tiles[tileX][tileY].Fgc != cursor.Fgc ||
                currentMap.Tiles[tileX][tileY].Id != cursor.Id) // Only redraw if true
            {
                currentMap.Tiles[tileX][tileY].Bgc = cursor.Bgc;
                currentMap.Tiles[tileX][tileY].Fgc = cursor.Fgc;
                currentMap.Tiles[tileX][tileY].Id = cursor.Id;
            }
        }
    }
    redrawTile(tileX, tileY);
};


var loadMap = function() {
    if (typeof(Storage) !== "undefined") {
        var opt;
        if (localStorage.maparray8) {

            console.log("Load from localStorage");

            var data = JSON.parse(localStorage.maparray8);
            map_array = data;
            var map = map_array[0];

            console.log(map_array);


            images_list.options.length = 0;
            for (var i = 0; i < map_array.length; i++) {
                opt = document.createElement("option");
                images_list.options.add(opt);
                opt.text = "Test"; // TODO Get name from map data
                opt.value = i;
            }

            images_list.selectedIndex = 0;
            currentMap = map_array[0];
            drawMap();
        } else {
            opt = document.createElement("option");
            images_list.options.add(opt);
            opt.text = "Test"; // TODO Get name from map data
            opt.value = 0;
        }
    } else {
        alert("Sorry no localStorage available");
    }
};

var saveMap = function() {
 
    var saveData = JSON.stringify(map_array);

    console.log(saveData);
    localStorage.setItem('save_data', saveData);

 /*
        var source = "=" + JSON.stringify(currentMap);
        console.log(source);

        var uri = "http://onethousandapi.maglevstudios.com/api/values/" + currentMap.Id;
        console.log(uri);
         $.ajax({
             url: uri,
             type: 'POST',
             dataType: 'text/plain',
             data: source,
             success: function (data, textStatus, xhr) {
                 console.log(data);
             },
             error: function (xhr, textStatus, errorThrown) {
                 console.log('Error in Operation');
             }
         });
*/
};

var newMap = function() {
    var opt = document.createElement("option");

    images_list.options.add(opt);
    opt.text = "New Map";
    opt.value = images_list.options.length - 1;

    map_array.push(new Map());

/*
    // Server communication
  var uri = 'http://onethousandapi.maglevstudios.com/api/values/?x=0&y=0';

    $(document).ready(function () {
      // Send an AJAX request
      $.getJSON(uri)
          .done(function (data) {
            images_list.options.Clear();      
            map_array.push(map);
          });
    });
*/
};

var loadMapList = function()
{
    console.log("load map list");

    var storageData = localStorage.getItem('save_data');
    if (storageData) {
        var data = JSON.parse(storageData);
        map_array = data;

        for(var item of data) {
            var opt = document.createElement("option");
            images_list.options.add(opt);
            opt.text =  item.Id + "." + item.Name; // TODO Get name from map data
            opt.value = item.Id;
        }

        images_list.selectedIndex  = 0;
        currentMap = map_array[0];
        drawMap();

    } else {
        var opt = document.createElement("option");
        images_list.options.add(opt);
        opt.text =  "new";
        opt.value = 0;
        opt.selected = true;
        map_array.push(new Map());
    }


    // TODO Read from local
/*
    var uri = 'http://onethousandapi.maglevstudios.com/api/values/';

    // Send an AJAX request
    $.getJSON(uri)
        .done(function (data) {
           // console.log(data);   
            images_list.innerHTML = "";
            //var map_headers = JSON.parse(data);
            
            //console.log(data);
            
            jQuery.each(data, function() {
                  opt = document.createElement("option");
                    images_list.options.add(opt);
                    opt.text =  this.Id + "." + this.Name; // TODO Get name from map data
                    opt.value = this.Id;
                });

            images_list.selectedIndex = 0;
            loadMapById(0);
     });
*/
};

// Initalize
var imageObj = new Image();

imageObj.onload = function() {
   
    canvas_tileset_ctx.drawImage(imageObj, 0, 0);
    canvas_tileset_data = canvas_tileset_ctx.getImageData(0,0,289,105);
    refreshCursor();

    // Load Map List
    loadMapList(); 
    drawMap();
};
imageObj.src = 'code437.png';


// Attach Events
btn_save.onclick = function() {
    saveMap();
};

btn_export_png.onclick = function() {
 var link = document.getElementById('link');
  link.setAttribute('download', 'Export.png');
  link.setAttribute('href', canvas_main.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
};

var isMouseDown = false;
canvas_main.onmousemove = function(e) {
    if (isMouseDown)
        paintTile(e);
};

canvas_main.onmousedown = function(e) {
    if (e.button == 0)
        isMouseDown = true;

    paintTile(e);
};

canvas_main.onmouseup = function(e) {
    isMouseDown = false;
    paintTile(e);
};

canvas_main.onmouseout = function(e) {
    isMouseDown = false;
};

canvas_main.oncontextmenu = function() {
    return false;
};

canvas_tileset.onclick = function(e) {

    console.log('canvas tileset click');

    var rect = canvas_tileset.getBoundingClientRect();
       
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var tileX = Math.floor(x / (tile_width+1));
    var tileY = Math.floor(y / (tile_height+1));

    cursor.Id = tileX + tileY*32;
    refreshCursor();
};

btn_del.onclick = function() {
    alert("TODO");
};

btn_new.onclick = function() {
    newMap();
};

function loadMapById(x)
{
    console.log("Load map by id:" + x);
    // TODO

    currentMap = map_array[x];
    drawMap();

    /*
    var uri = 'http://onethousandapi.maglevstudios.com/api/values/' + x;

    // Send an AJAX request
    $.getJSON(uri)
        .done(function (data) {
            console.log(data);
            currentMap = JSON.parse(data);
            txtMapname.value = currentMap.Name;
            txtNorth.value = currentMap.N;
            txtSouth.value = currentMap.S;
            txtWest.value = currentMap.W;
            txtEast.value = currentMap.E;
            drawMap();
        });
*/
}

txtMapname.onchange = function()
{
    currentMap.Name = txtMapname.value;
}

txtNorth.onkeyup = function()
{
    if (txtNorth.value == "")
        return;

        if (!isNumber(txtNorth.value))
            txtNorth.value = "0";

        currentMap.N = txtNorth.value;
    
}

txtSouth.onkeyup = function()
{
    if (txtSouth.value == "")
        return;
    
    if (!isNumber(txtSouth.value))
        txtSouth.value = "0";

    currentMap.S = txtSouth.value;
}


txtEast.onkeyup = function()
{
    if (txtEast.value == "")
        return;
    
    if (!isNumber(txtEast.value))
        txtEast.value = "0";

    currentMap.E = txtEast.value;
}


txtWest.onkeyup = function()
{
    if (txtWest.value == "")
        return;
    
    if (!isNumber(txtWest.value))
        txtWest.value = "0";

    currentMap.W = txtWest.value;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

images_list.onclick = function() {
    var x = images_list.selectedIndex;
    loadMapById(x);
};

btn_export.onclick = function() {
    var data = JSON.stringify(currentMap);
    txtArea.value = data;
};

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];

    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    for (var i = 0, f; f = files[i]; i++) {
        var r = new FileReader();
        r.onload = (function (f) {
            return function (e) {
                var contents = e.target.result;
                txtArea.value = contents;
                map_array = JSON.parse(txtArea.value);
                currentMap = map_array[0];
            };
        })(f);

        r.readAsText(f);
    }
};

document.getElementById('files').addEventListener('change', handleFileSelect, false);

btn_import.onclick = function (evt) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        handleFileSelect(evt);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
};

setInterval(function() {
    console.log('Autosave');
    saveMap();

}, 30000);