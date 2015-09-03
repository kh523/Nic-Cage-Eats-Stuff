//Initialize the HTML5 canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth - 10;
ctx.canvas.height = window.innerHeight - 20;

//Set properties of items and variables
var player = { speed: 250, x: c.width / 2, y: c.height / 2, radius: 32, invulnerable: false, immobile: false }
var token = { x: 0, y: 0 };
var tokenseaten = 0;
var enemyeaten = 0;

//Initialize Player
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
	playerReady = true;
}
playerImage.src = "NicCageFace.png";

//Initialize Token
var tokenReady = false;
var tokenImage = new Image();
tokenImage.onload = function () {
	tokenReady = true;
}
token.x = Math.random() * window.innerWidth * 0.8;
token.y = Math.random() * window.innerHeight * 0.8;
tokenImage.src = "chicken.png";

//Initialize Enemy
var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function () {
	enemyReady = true;
}
enemyImage.src = "celery.png";

function enemyfunc(x, y, hv, vv, angle) {
	this.x = x || 0;
	this.y = y || 0;
	this.hv = hv || 0;
	this.vv = vv || 0;
	this.angle = angle || 0;
}

var protectingtoken = false;

var enemyarr = [];

// Adds an enemy with horizontal velocity hv and vertical velocity vv
function addenemy(hv, vv) {
	enemyarr.push(new enemyfunc(Math.random() * window.innerWidth * 0.8, Math.random() * window.innerHeight * 0.8, hv, vv));
}

// Initialize one enemy
addenemy(4 * Math.random() + 2, 4 * Math.random() + 2);

//Returns string "right" if object1 is to the right of object2 and "left" otherwise
function horizontaldirection(object1, object2) {
	var horizontal = object1.x - object2.x;
	var horizontalobject1;
	if (horizontal > 0) {
		horizontalobject1 = "right";
	}
	else if (horizontal < 0) {
		horizontalobject1 = "left";
	}
	else if (horizontal == 0) {
		horizontalobject1 = "equal";
	}
	return horizontalobject1;
}

//Returns string "top" if object1 is above object2 and "bottom" otherwise
function verticaldirection(object1, object2) {
	var vertical = object1.y - object2.y;
	var verticalobject1;
	if (vertical > 0) {
		verticalobject1 = "top";
	}
	else if (vertical < 0) {
		verticalobject1 = "bottom";
	}
	return verticalobject1;
}

//Causes object2 to be attracted to object1 by changing the hv and vv of object2 in the direction of object1. 
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
	var l = enemyarr.length;
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
	if (!player.immobile) {
		if (38 in keysDown) {
			player.y -= player.speed * modifier;
		}
		if (40 in keysDown) {
			player.y += player.speed * modifier;
		}
		if (37 in keysDown) {
			player.x -= player.speed * modifier;
		}
		if (39 in keysDown) {
			player.x += player.speed * modifier;
		}
	}
	if (32 in keysDown) {
		player.invulnerable = true;
		player.immobile = true
		playerImage.src = "NicCageFace Translucent.png";
	}
	else {
		player.invulnerable = false;
		player.immobile = false;
		playerImage.src = "NicCageFace.png";
	}
	if (player.x + 100 < 0) {
		player.x = window.innerWidth;
	}
	if (player.x > window.innerWidth) {
		player.x = 0;
	}
	if (player.y + 100 < 0) {
		player.y = window.innerHeight;
	}
	if (player.y > window.innerHeight) {
		player.y = 0;
	}

	//Detects collisions with token
	if (player.x + 50 <= (token.x + 80) && token.x <= (player.x + 40)
		&& player.y + 100 <= (token.y + 50) && token.y <= (player.y + 90)) {
		token.x = Math.random() * window.innerWidth * 0.8;
		token.y = Math.random() * window.innerHeight * 0.8;
		++tokenseaten; 
		if (tokenseaten % 3 == 0) {
			addenemy(4 * Math.random() + 2, 4 * Math.random() + 2);
		}
	}

	//Changes Enemy Movement State 
	var l = enemyarr.length;
	if (l % 4 == 0) {
		protectingtoken = true;
	}
	if (protectingtoken && (l % 4 == 1)) {
		protectingtoken = false;
	}
	for (var i = 0; i < l; i++) {
		if (!protectingtoken) {
			enemyarr[i].x += enemyarr[i].hv;
			enemyarr[i].y += enemyarr[i].vv;
			if (!onscreen(enemyarr[i])) {
				enemyarr[i].x = Math.random() * window.innerWidth * 0.8;
				enemyarr[i].y = Math.random() * window.innerHeight * 0.8;
			} 
		}
		else if (protectingtoken) {
			if (distance(token, enemyarr[i]) >= 200) {
				attract(token, enemyarr[i]);
				enemyarr[i].x += enemyarr[i].hv;
				enemyarr[i].y += enemyarr[i].vv; 
				enemyarr[i].angle = findangle(token, enemyarr[i]);
			}
			else if (distance(token, enemyarr[i]) < 200) {
				circlearoundobject(token, enemyarr[i], distance(token, enemyarr[i]));
			}	
		}
		if (enemyarr[i].x + 100 > window.innerWidth || enemyarr[i].x < 0) {
			enemyarr[i].hv = -enemyarr[i].hv;
		}
		if (enemyarr[i].y + 100 > window.innerHeight || enemyarr[i].y < 0) {
			enemyarr[i].vv = -enemyarr[i].vv;
		}

		//Detects collisions with enemy
		if ((enemyarr[i] != null && (player.x <= (enemyarr[i].x + 80) && enemyarr[i].x <= (player.x + 50) && !player.invulnerable)
		&& player.y + 100 <= (enemyarr[i].y + 70) && enemyarr[i].y + 30 <= (player.y + 110))) {
			enemyarr[i].x = Math.random() * window.innerWidth * 0.8;
			enemyarr[i].y = Math.random() * window.innerHeight * 0.8;
			++enemyeaten; 
		}
	}
}

//Draws objects on canvas
var render = function () {
	if (playerReady) {
		ctx.clearRect(0,0, c.width, c.height);
		ctx.drawImage(playerImage, player.x, player.y);
	}
	if (tokenReady) {
		ctx.drawImage(tokenImage, token.x, token.y);
	}
	if (enemyReady) {
		var l = enemyarr.length;
		for (var i = 0; i < l; i++) {
			if (enemyarr[i] != null) {
				ctx.drawImage(enemyImage, enemyarr[i].x, enemyarr[i].y);
			}
		}
	}

	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Chicken Legs Eaten: " + tokenseaten, 32, 32);

	ctx.fillStyle = "rgb(255,0,0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("Don't eat Celery: " + enemyeaten + "/3", 32, 32);

	ctx.fillStyle = "green";
	ctx.font = "24px Helvetica";
	ctx.fillText("Current Highscore: 69", window.innerWidth - 300, 32);

	//Game Over
	if (enemyeaten >= 3) {
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
			enemyeaten = 0;
			tokenseaten = 0;
			enemyarr = [];
			addenemy(4 * Math.random() + 2, 4 * Math.random() + 2);
			player.x = c.width / 2;
			player.y = c.height / 2;
		}
	}
}

var main = function () {
	var now = Date.now();
	var delta = now - then; 

	update(delta / 1000);
	render();

	then = now;

	requestAnimationFrame(main);
}

requestAnimationFrame = window.requestAnimationFrame || window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
var then = Date.now();
main();