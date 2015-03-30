//Initialize the HTML5 canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth - 10;
ctx.canvas.height = window.innerHeight - 20;

//Set properties of items and variables
var circle = { speed: 250, x: c.width / 2, y: c.height / 2, radius: 32 }
var chicken = { x: 0, y: 0 };
var chickenwingseaten = 0;
var celeryeaten = 0;

//Initialize Player
var nicReady = false;
var nicImage = new Image();
nicImage.onload = function () {
	nicReady = true;
}
nicImage.src = "NicCageFace.png";

//Initialize Chicken
var chickenReady = false;
var chickenImage = new Image();
chickenImage.onload = function () {
	chickenReady = true;
}
chicken.x = Math.random() * window.innerWidth * 0.8;
chicken.y = Math.random() * window.innerHeight * 0.8;
chickenImage.src = "chicken.png";

//Initialize Celery
var celeryReady = false;
var celeryImage = new Image();
celeryImage.onload = function () {
	celeryReady = true;
}
celeryImage.src = "celery.png";

function celeryfunc(x, y, hv, vv, angle) {
	this.x = x || 0;
	this.y = y || 0;
	this.hv = hv || 0;
	this.vv = vv || 0;
	this.angle = angle || 0;
}

//Set Celery Movement State
var protectingchicken = false;

var celeryarr = [];

function addcelery(hv, vv) {
	celeryarr.push(new celeryfunc(Math.random() * window.innerWidth * 0.8, Math.random() * window.innerHeight * 0.8, hv, vv));
}

addcelery(4 * Math.random() + 2, 4 * Math.random() + 2);

//Returns string "right" if object1 is to the right of object2 and "left" otherwise
function horizontaldirection(object1, object2) {
	var horizontal = object1.x - object2.x;
	if (horizontal > 0) {
		var horizontalobject1 = "right";
	}
	else if (horizontal < 0) {
		var horizontalobject1 = "left";
	}
	return horizontalobject1;
}

//Returns string "top" if object1 is above object2 and "bottom" otherwise
function verticaldirection(object1, object2) {
	var vertical = object1.y - object2.y + 60;
	if (vertical > 0) {
		var verticalobject1 = "top";
	}
	else if (vertical < 0) {
		var verticalobject1 = "bottom";
	}
	return verticalobject1;
}

//Causes object2 to be attracted to object1. 
//Precondition: object2 must have properties hv and vv (horizontal velocity and vertical velocity)
function attract(object1, object2) {
	var h = horizontaldirection(object1, object2);
	var v = verticaldirection(object1, object2);
	if ((h === "left" && object2.hv > 0) || (h === "right" && object2.hv < 0)) {
		object2.hv = -object2.hv;
	}
	if ((v === "top" && object2.vv < 0) || (v === "bottom" && object2.vv > 0)) {
		object2.vv = -object2.vv;
	}
}

//Returns a true if object is on the screen and false otherwise
function onscreen(object) {
	return (object.x > -10 && object.x < window.innerWidth && object.y > -10 && object.y < window.innerHeight);
}
//Causes object2 to be repeled by object1
//Precondition: object2 must have properties hv and vv (horizontal velocity and vertical velocity)
function repel(object1, object2) {
	var h = horizontaldirection(object1, object2);
	var v = verticaldirection(object1, object2);
	if ((h === "left" && object2.hv < 0) || (h === "right" && object2.hv > 0)) {
		object2.hv = -object2.hv;
	}
	if ((v === "top" && object2.vv > 0) || (v === "bottom" && object2.vv < 0)) {
		object2.vv = -object2.vv;
	} 
}

//Returns the distance between object1 and object2 (in pixels)
function distance(object1, object2) {
	return (Math.sqrt(Math.pow((object1.x-object2.x),2) + Math.pow((object1.y-object2.y),2)));
}

//Returns the angle made by object1 and object2 with respect to object1's x coordinate
function findangle(object1, object2) {
	var x_len = object2.x - object1.x;
	var y_len = object2.y - object1.y;
	var angle = Math.atan(y_len/x_len);
	if (horizontaldirection(object1, object2) === "right") {
		angle = angle + Math.PI;
	}
	return angle;
}

//Causes object2 to circle around object1 at a radius r
function circlearoundobject(object1, object2, r) {
	var l = celeryarr.length;
	object2.x = object1.x + Math.cos(object2.angle) * r;
	object2.y = object1.y + Math.sin(object2.angle) * r;
	object2.angle = (object2.angle + 0.04) % (2*Math.PI);
}

//Initialize arrow key detection
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

//Updates the objects x, y coordinates
var update = function (modifier) {
	if (38 in keysDown) {
		circle.y -= circle.speed * modifier;
	}
	if (40 in keysDown) {
		circle.y += circle.speed * modifier;
	}
	if (37 in keysDown) {
		circle.x -= circle.speed * modifier;
	}
	if (39 in keysDown) {
		circle.x += circle.speed * modifier;
	}
	if (circle.x + 100 < 0) {
		circle.x = window.innerWidth;
	}
	if (circle.x > window.innerWidth) {
		circle.x = 0;
	}
	if (circle.y + 100 < 0) {
		circle.y = window.innerHeight;
	}
	if (circle.y > window.innerHeight) {
		circle.y = 0;
	}

	if (circle.x + 50 <= (chicken.x + 80) && chicken.x <= (circle.x + 40)
		&& circle.y + 100 <= (chicken.y + 50) && chicken.y <= (circle.y + 90)) {
		chicken.x = Math.random() * window.innerWidth * 0.8;
		chicken.y = Math.random() * window.innerHeight * 0.8;
		++chickenwingseaten; 
		if (chickenwingseaten % 3 == 0) {
			addcelery(4 * Math.random() + 2, 4 * Math.random() + 2);
		}
	}
	//Changes Celery Movement State 
	var l = celeryarr.length;
	if (l % 4 == 0) {
		protectingchicken = true;
	}
	if (protectingchicken && (l % 4 == 1)) {
		protectingchicken = false;
	}
	for (var i = 0; i < l; i++) {
		if (!protectingchicken) {
			celeryarr[i].x += celeryarr[i].hv;
			celeryarr[i].y += celeryarr[i].vv;
			if (!onscreen(celeryarr[i])) {
				celeryarr[i].x = Math.random() * window.innerWidth * 0.8;
				celeryarr[i].y = Math.random() * window.innerHeight * 0.8;
			} 
		}
		else if (protectingchicken) {
			if (distance(chicken, celeryarr[i]) >= 200) {
				attract(chicken, celeryarr[i]);
				celeryarr[i].x += celeryarr[i].hv;
				celeryarr[i].y += celeryarr[i].vv; 
				celeryarr[i].angle = findangle(chicken, celeryarr[i]);
			}
			else if (distance(chicken, celeryarr[i]) < 200) {
				circlearoundobject(chicken, celeryarr[i], distance(chicken, celeryarr[i]));
			}	
		}
		if (celeryarr[i].x + 100 > window.innerWidth || celeryarr[i].x < 0) {
			celeryarr[i].hv = -celeryarr[i].hv;
		}
		if (celeryarr[i].y + 100 > window.innerHeight || celeryarr[i].y < 0) {
			celeryarr[i].vv = -celeryarr[i].vv;
		}
		if (celeryarr[i] != null && (circle.x <= (celeryarr[i].x + 80) && celeryarr[i].x <= (circle.x + 50)
		&& circle.y + 100 <= (celeryarr[i].y + 70) && celeryarr[i].y + 30 <= (circle.y + 110))) {
			celeryarr[i].x = Math.random() * window.innerWidth * 0.8;
			celeryarr[i].y = Math.random() * window.innerHeight * 0.8;
			++celeryeaten; 
		}
	}
}

//Draws objects on canvas
var render = function () {
	if (nicReady) {
		ctx.clearRect(0,0, c.width, c.height);
		ctx.drawImage(nicImage, circle.x, circle.y);
	}
	if (chickenReady) {
		ctx.drawImage(chickenImage, chicken.x, chicken.y);
	}
	if (celeryReady) {
		var l = celeryarr.length;
		for (var i = 0; i < l; i++) {
			if (celeryarr[i] != null) {
				ctx.drawImage(celeryImage, celeryarr[i].x, celeryarr[i].y);
			}
		}
	}

	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Chicken Wings Eaten: " + chickenwingseaten, 32, 32);

	ctx.fillStyle = "rgb(255,0,0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("Don't eat Celery: " + celeryeaten + "/3", 32, 32);

	ctx.fillStyle = "green";
	ctx.font = "24px Helvetica";
	ctx.fillText("Current Highscore: 69", window.innerWidth - 300, 32);
}

var main = function () {
	var now = Date.now();
	var delta = now - then; 

	update(delta / 1000);
	render();

	then = now;
	if (celeryeaten >= 3) {
		ctx.clearRect(0,0, c.width, c.height);
		ctx.fillStyle = "rgb(255,0,0)";
		ctx.font = "24px Helvetica";
		var x = c.width / 2;
		var y = c.height / 2 - 10;
		ctx.textAlign = 'center';
		ctx.fillText("Game Over!!!", x, y);
		ctx.fillStyle = "green";
		ctx.fillText("Press Enter to Restart", x, y + 50);
		if (13 in keysDown) {
			celeryeaten = 0;
			chickenwingseaten = 0;
			celeryarr = [];
			addcelery(4 * Math.random() + 2, 4 * Math.random() + 2);
		}
	}

	requestAnimationFrame(main);
}



requestAnimationFrame = window.requestAnimationFrame || window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
var then = Date.now();
render();
main();