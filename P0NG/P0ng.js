// Basic Pong functionality taken from straker's project here:
// https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

import {AI} from "AI.js";

//Variables
var gameID, animateID;
var leftPoints, rightPoints, leftScore, rightScore, bounces;
const winningPoints = 5;
const scoringDelay = 1000;
var canvas, context, maxPaddleY, maxBallY, leftPaddle, rightPaddle, ball;
const pixel = 16;
const paddleHeight = pixel * 5; // 80
var paddleSpeed = 6;
var ballSpeed = 5;
var ballSpeedRatio = ballSpeed/pixel * .75;
var two_player = false;
var ai;


//DOM stuff

canvas = document.getElementById('game');
context = canvas.getContext('2d');
maxPaddleY = canvas.height - paddleHeight;

leftPaddle = {
	// start in the middle of the game on the left side
	x: pixel * 2,
	y: (canvas.height - paddleHeight) / 2,
	yc: function() {return this.y + this.height/2;},
	set_yc: function(_y) {this.y = _y - this.height/2;},
	width: pixel,
	height: paddleHeight,

	// paddle velocity
	up: 0,
	down: 0
};
rightPaddle = {
	// start in the middle of the game on the right side
	x: canvas.width - pixel * 3,
	y: (canvas.height - paddleHeight) / 2,
	yc: function() {return this.y + this.height/2;},
	width: pixel,
	height: paddleHeight,

	// paddle velocity
	up: 0,
	down: 0
};
ball = {
	// start in the middle of the game
	x: (canvas.width - pixel) / 2,
	y: (canvas.height - pixel) / 2,
	yc: function() {return this.y + this.height/2;},
	width: pixel,
	height: pixel,

	// keep track of when need to reset the ball position
	scoring: false,

	// ball velocity (start going to the top-right corner)
	dx: ballSpeed,
	dy: -ballSpeed
};
maxBallY = canvas.height - ball.height;

leftScore = $("#leftScore");
rightScore = $("#rightScore");

//Draw initial positions
draw();
cancelAnimationFrame(animateID);

//Buttons
$("#startButton").on("click touchstart", function() {
	two_player = false;
	startGame();
});
$("#twoPlayer").click(function() {
	two_player = true;
	startGame();
});
$("#infoButton").on("click touchstart", function() {
	window.open('https://docs.google.com/spreadsheets/d/1mx3Xh_Ko7WkvPbPRbsnvfbbALWHY9QnkYhUcO2QWqo0/edit?usp=sharing', '_blank').focus();
});
if(window.isMobile()) {
	$("#twoPlayer").hide();
}

//Controller buttons
$("#controls").hide();
$("#controls > button:nth-child(2)").on("touchstart", function() {
	rightPaddle.up = 1;
});
$("#controls > button:nth-child(2)").on("touchend", function() {
	rightPaddle.up = 0;
});
$("#controls > button:last-child").on("touchstart", function() {
	rightPaddle.down = 1;
});
$("#controls > button:last-child").on("touchend", function() {
	rightPaddle.down = 0;
});


// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

//Scoring
function scorePoint(isRight) {
	ball.scoring = true;
	//Award a point, stop if won
	if (isRight) {
		if (++rightPoints >= winningPoints)
			gameOver(1);
	} else {
		if (++leftPoints >= winningPoints)
			gameOver(0);
	}
	
	updateScore();
	
	// give some time for the player to recover before launching the ball again
	resetBall();
}
function updateScore() {
	leftScore.text(leftPoints);
	rightScore.text(rightPoints);
}

//Object move logic
//Ball
function bounce(paddle) {
	//Bounce back
	ball.dx *= -1;
	
	//Find new speed -> pixel distance between midpoints * base speed
	ball.dy = ((ball.y + ball.height/2) - (paddle.y + paddle.height/2)) * ballSpeedRatio;
	//Set limits to speed
	//ball.dy = Math.max(Math.min(ball.dy, ballMaxRatio * ballSpeed), -ballMaxRatio * ballSpeed);
	
	//Count bounces
	++bounces;
}
function resetBall() {
	//Center the ball
	ball.x = (canvas.width - ball.width) / 2;
	ball.y = (canvas.height - ball.height) / 2;
	
	//Wait
	ball.dx = ball.dy = 0;
	
	//Randomize the direction
	setTimeout(function() {
		ball.dx = ballSpeed * (Math.floor(Math.random() * 2)? -1 : 1);
		ball.dy = ballSpeed * (Math.floor(Math.random() * 2)? -1 : 1);
		ball.scoring = false;
	}, scoringDelay);
}
// listen to keyboard events to move the paddles
$(document).keydown(function(e) {
	switch(e.which) {
		case 38: //Up
			rightPaddle.up = 1;
			break;
		case 40: //Down
			rightPaddle.down = 1;
			break;
		case 87: //W
			if (two_player)
				leftPaddle.up = 1;
			break;
		case 83: //S
			if (two_player)
				leftPaddle.down = 1;
			break;
	}
});
// listen to keyboard events to stop the paddle if key is released
$(document).keyup(function(e) {
	switch(e.which) {
		case 38: //Up
			rightPaddle.up = 0;
			break;
		case 40: //Down
			rightPaddle.down = 0;
			break;
		case 87: //W
			if (two_player)
				leftPaddle.up = 0;
			break;
		case 83: //S
			if (two_player)
				leftPaddle.down = 0;
			break;
	}
});

//Main game loop
function gameLoop() {
	
	//AI
	if(!two_player)
		[leftPaddle.up, leftPaddle.down] = ai.loop(ball.x, ball.y, ball.dx, ball.dy, leftPaddle.y, rightPaddle.y);

	// move paddles by their velocity
	leftPaddle.y -= paddleSpeed * (leftPaddle.up - leftPaddle.down);
	rightPaddle.y -= paddleSpeed * (rightPaddle.up - rightPaddle.down);

	// prevent paddles from going through walls
	leftPaddle.y = Math.max(Math.min(leftPaddle.y, maxPaddleY), 0);
	rightPaddle.y = Math.max(Math.min(rightPaddle.y, maxPaddleY), 0);

	// move ball by its velocity
	ball.x += ball.dx;
	ball.y += ball.dy;

	// prevent ball from going through walls by changing its velocity
	if (ball.y <= 0) {
		ball.y *= -1;
		ball.dy *= -1;
	} else if (ball.y >= maxBallY) {
		ball.y = 2 * maxBallY - ball.y;
		ball.dy *= -1;
	}

	// reset ball if it goes past paddle (but only if we haven't already done so)
	//AKA someone is scoring
	if(ball.x < -ball.width && !ball.scoring)
		scorePoint(1); //right
	if(ball.x > canvas.width && !ball.scoring)
		scorePoint(0); //left

	// check to see if ball collides with paddle. if they do change x velocity
	if (collides(ball, leftPaddle)) {
		// move ball next to the paddle otherwise the collision will happen again in the next frame
		ball.x = leftPaddle.x + leftPaddle.width;
		
		//Change the angle
		bounce(leftPaddle);
	} else if (collides(ball, rightPaddle)) {
		// move ball next to the paddle otherwise the collision will happen again in the next frame
		ball.x = rightPaddle.x - ball.width;
		
		//Change the angle
		bounce(rightPaddle);
	}
}

//Start/Stop
function startGame() {
	stopGame();
	toggleButtons("hide");
	$("#wait").css("display", "flex");
	if(two_player)
		gameReady(60);
	else
		ai = new AI(6, 2);
}
function requestAI(gen, row) {
	stopGame();
	toggleButtons("hide");
	$("#wait").css("display", "flex");
	ai = new AI(6, 2, [gen, row]);
}
function gameReady(fps) {
	$("#wait").css("display", "none");

	//Initialize variables
	leftPoints = 0;
	rightPoints = 0;
	bounces = 0;
	updateScore();
	leftPaddle.y = (canvas.height - paddleHeight) / 2;
	rightPaddle.y = (canvas.height - paddleHeight) / 2;
	//Delay ball drop
	ball.scoring = true;
	resetBall();
	
	//Start looping
	gameID = setInterval(gameLoop, 1000/fps);
	animateID = requestAnimationFrame(draw);
}
function stopGame() {
	clearInterval(gameID);
	cancelAnimationFrame(animateID);
	toggleButtons("show");
}
function gameOver(rightWon) {
	stopGame();
	if (rightWon) {
		console.log("Right wins");
	} else {
		console.log("Left wins");
	}
	//Send score
	if(!two_player) {
		let score = (leftPoints-rightPoints) * 1000;
		if(score > 0)
			score -= bounces;
		else
			score += bounces;
		ai.postFitness(score)
	}
}

//Animation
function draw() {
	animateID = requestAnimationFrame(draw);
	
	//Clear last frame
	context.clearRect(0,0,canvas.width,canvas.height);

	// draw paddles
	context.fillStyle = 'white';
	context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
	context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

	// draw ball
	context.fillRect(ball.x, ball.y, ball.width, ball.height);
}

//Hide start/control buttons
function toggleButtons(cmd="toggle") {
	if(cmd === "toggle") {
		if($('#startButton').is(':visible'))
			cmd = "hide";
		else
			cmd = "show";
	}
	if(cmd === "show") {
		$("body > button").show();
		if(window.isMobile()) {
			$("#controls").hide();
			$("#twoPlayer").hide();
		}
	} else if(cmd === "hide") {
		$("body > button").hide();
		if(window.isMobile()) {
			$("#controls").show();
		}
	}
}
