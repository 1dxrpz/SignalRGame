var _username = document.querySelector("#player_username").innerHTML;
var connection = new signalR.HubConnectionBuilder().withUrl("/gamehub?username=" + _username).build();
var clients = [];

function checkTabPress(e) {
	"use strict";
	// pick passed event or global event object if passed one is empty
	e = e || event;
	var activeElement;
	
}

var _playersList = document.querySelector(".players");

var body = document.querySelector('body');

function UpdateUsersList(users) {
	var res = "";
	res =
		`<thead><tr>
			<th>Players</th>
		</tr>
		</thead>
		<tbody>`;
	users.forEach(v => {
		res += `
		<tr>
			<td>${v.name}</td>
		</tr>`
    })
	res += `</tbody>`;
	document.querySelector(".players").innerHTML = res;
}

connection.qs = { 'username': _username };

connection.start().then(function () {
    
}).catch(function (err) {
    return console.error(err.toString());
});


connection.on("GetPlayers", (users) => {
	//console.log(users);
});
connection.on("UpdatePlayers", (users) => {
	UpdateUsersList(users);
});

LoadContent({
	PlayerSprite: "https://github.com/1dxrpz/EnJine/raw/main/player.png",
	PlayerRun: "https://github.com/1dxrpz/EnJine/blob/main/player_run.png?raw=true",
	prop: "https://github.com/1dxrpz/EnJine/raw/main/props.png",
	ground: "https://github.com/1dxrpz/EnJine/blob/main/ground.png?raw=true"
});

var players = [];

var Player = CreatePlayer();
var prop = new GameObject();
var ground = new TileMap();
var gameObjects = [Player];

var sound;

EventHandler("resize", v => {
	GameSettings.Window.width = window.innerWidth;
	GameSettings.Window.height = window.innerHeight;
	UpdateResolution();
});

function CreatePlayer() {
	var player = new GameObject();
	player.AddComponent(new Animation({
		spriteSheet: Content.PlayerSprite,
		frameCount: 4,
		animation: 0,
		animationSpeed: .1,
		spriteSize: new vec(50, 37)
	}));
	player.AddComponent(new Collider({
		offset: new vec(80, 150),
		scale: new vec(100, 30)
	}));
	player.AddComponent(new Physics({
		slippery: .25
	}));
	player.AddComponent(new Transform({
		scale: new vec(50 * 5, 37 * 5),
		depth: 1,
		pivot: new vec(50 * 5 / 2, 37 * 5 / 2),
		position: new vec(100, 100)
	}));
	player.AddComponent(new Trigger({
		offset: new vec(80, 150),
		scale: new vec(100, 30)
	}));
	player.AddComponent(new Shadow({
		radius: 40,
		color: new Color(0, .1)
	}));
	return player;
}

EventHandler("start", v => {
	GameSettings.EnableSmoothing = false;
	GameSettings.ShowColliders = false;
	GameSettings.Window.width = window.innerWidth;
	GameSettings.Window.height = window.innerHeight;

	UpdateResolution();

	sound = new SoundEmitter({
		source: ["https://github.com/1dxrpz/EnJine/blob/main/step1.mp3?raw=true",
			"https://github.com/1dxrpz/EnJine/blob/main/step2.mp3?raw=true",
			"https://github.com/1dxrpz/EnJine/blob/main/step3.mp3?raw=true"],
		delay: 400,
		randomize: true,
		volume: .01
	});
	connection.invoke("GetCurrentPlayer", _username);
	ground.source = Content.ground;
	ground.map = [
		[29, 0, 0, 7, 0],
		[0, 0, 13, 0, 9],
		[0, 17, 54, 60, 61],
		[28, 42, 32, 41, 52],
		[0, 0, 57, 56, 0]
	];
	ground.size = new vec(128, 128);
});

var chat_messages = document.querySelector(".messages");
var chat_input = document.querySelector(".chat_input");

chat_input.addEventListener("keyup", (e) => {
	if (e.keyCode == 13) {
		event.preventDefault();
		connection.invoke("SendMesage", _username, chat_input.value);
	}
});
connection.on("ReceiveMessage", (user, message) => {
	chat_messages.innerHTML += `<div class="chatmessage"><span class="username">${user}</span><span class="usermessage">${message}</span></div>`;
});
connection.on("CurrentPlayer", (user) => {
	Player = CreatePlayer();
	players.push({ user: user, player: Player });
});

connection.on("GetPlayers", (users) => {
	users.forEach(v => {
		players.push({ user: v, player: CreatePlayer() });
    })
});
connection.on("Join", (user) => {
	players.push({ user: user, player: CreatePlayer() });
	connection.invoke("SendMesage", '> ' + _username + ' connected', "");
});
connection.on("Disconnect", (user) => {
	var _p = players.find(v => v.user.name == user.name)
	players.splice(players.indexOf(_p), 1);
	connection.invoke("SendMesage", '> ' + _username + ' disconnected', "");
});
connection.on("ReceivePosition", (user, transform, animation) => {
	var _p = players.find(v => v.user.name == user).player;

	//console.log(animation);

	var _an = _p.GetComponent("animation");
	var _tr = _p.GetComponent("transform")

	_tr.position.x = transform.x;
	_tr.position.y = transform.y;
	_an.animation = animation.animation;
	_an.frame = animation.frame;
	_an.mirror = animation.mirror;
	_an.spriteSheet = Content[animation.spriteSheet];
	_an.timer = animation.timer;

	
});

document.body.addEventListener("keydown", e => {
	if (e.keyCode == 9) {
		e.preventDefault();
		_playersList.setAttribute("visible", true);
    }
})
document.body.addEventListener("keyup", e => {
	if (e.keyCode == 9) {
		e.preventDefault();
		_playersList.setAttribute("visible", false);
	}
})

function SerializeContent(value) {
	return Object.keys(Content).find(key => Content[key] === value);
}

EventHandler("update", v => {
	if ((Input.Keyboard.OnKeyUp(Keys.d) || Input.Keyboard.OnKeyUp(Keys.a) || Input.Keyboard.OnKeyUp(Keys.s) || Input.Keyboard.OnKeyUp(Keys.w))
		&& !Input.Keyboard.IsKeyDown(Keys.d) && !Input.Keyboard.IsKeyDown(Keys.a) && !Input.Keyboard.IsKeyDown(Keys.s) && !Input.Keyboard.IsKeyDown(Keys.w)) {
		Player.GetComponent('animation').SetAnimation({
			frameCount: 4,
			animation: 0,
			spriteSheet: Content.PlayerSprite
		});
	}
	if (Input.Keyboard.OnKeyDown(Keys.d) || Input.Keyboard.OnKeyDown(Keys.w) || Input.Keyboard.OnKeyDown(Keys.a) || Input.Keyboard.OnKeyDown(Keys.s)) {
		Player.GetComponent('animation').SetAnimation({
			frameCount: 6,
			animation: 0,
			spriteSheet: Content.PlayerRun
		});
	}

	var direction = new vec();
	var force = new vec();
	if (Input.Keyboard.IsKeyDown(Keys.d)) {
		direction.x = 1;
		Player.GetComponent('animation').mirror.x = 1;
		sound.Play();
	}
	if (Input.Keyboard.IsKeyDown(Keys.a)) {
		direction.x = -1;
		Player.GetComponent('animation').mirror.x = -1;
		sound.Play();
	}
	if (Input.Keyboard.IsKeyDown(Keys.w)) {
		direction.y = -1;
		sound.Play();
	}
	if (Input.Keyboard.IsKeyDown(Keys.s)) {
		direction.y = 1;
		sound.Play();
	}

	var speed = direction.normalize().multiply(10);
	Player.GetComponent('physics').velocity = speed;

	var _pos = Player.GetComponent('transform').position
		.add(
			MainCamera.resolution
				.multiply(.5)
				.invert()
		)
		.add(Player.GetComponent('transform').scale.multiply(.5));
	MainCamera.position = MainCamera.position.lerp(_pos, .1);

	var _pt= Player.GetComponent('transform');
	var _animation = Player.GetComponent('animation');

	//ground.Update();

	connection.invoke("SendPosition", _username, _pt.position,
		{
			frame: _animation.frame,
			animation: _animation.animation,
			mirror: _animation.mirror,
			spriteSheet: SerializeContent(_animation.spriteSheet),
			timer: _animation.timer
		});
	players
		.sort((a, b) => {
			var _a = a.player.GetComponent('transform');
			var _b = b.player.GetComponent('transform');
			return (_a.position.y + _a.scale.y) - (_b.position.y + _b.scale.y);
        })
		.forEach(v => v.player.Update());
});

EventHandler("draw", v => {
	ground.Draw();
	context.font = '18pt serif';
	players.forEach(v => {
		v.player.Draw();
		var _tr = v.player.GetComponent('transform');
		var pos = MainCamera.ScreenPosition(_tr.position);

		context.fillStyle = Color.white;
		var width = context.measureText(v.user.name).width;
		context.fillText(v.user.name, pos.x + (_tr.scale.x / 2) - (width / 2), pos.y);
	});
});