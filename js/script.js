(function(){

	var cnv = document.querySelector("canvas");
	var ctx = cnv.getContext("2d");
	
	//RECURSOS DO GAME ===================>
	
	//arrays
	var sprites = []; //gráfico
	var assetsToLoad = []; //recursos a serem carregados.
	var missiles = [];//misseis
	var aliens = [];//aliens
	var messages = [];//mensagens

	//variaveis uteis
	var alienFrequency = 100; //frequencia em que os aliens vao ser criados
	var alienTimer = 0;
	var shots = 0; //disparos
	var hits = 0;//acertos
	var acuracy = 0;//aproveitamento percentual
	var scoreToWin = 70;//pontuação a atingir para ganhar 
	var FIRE = 0, EXPLOSION = 1;

	//SPRITES: vai para o render e é renderizado na tela via ctx.drawImage();
	
	//cenário
	var backgrounds = new Sprite(0, 56, 400, 500, 0 , 0); //o que eu vou recortar da img com os 3 desenhos.
	sprites.push(backgrounds);//adicionando no indice 0, pra dps ser desenhando no render.
	
	//nave
	var defender = new Sprite(0, 0, 30, 50, 185, 450);
	sprites.push(defender);
		
	//mensagem da tela inicial
	var startMessage = new ObjectMessage(cnv.height/2, "PRESS ENTER", "#f00");
	messages.push(startMessage);

	//mensagem de pausa
	var pausedMessage = new ObjectMessage(cnv.height/2, "PAUSED", "#f00");
	pausedMessage.visible = false;
	messages.push(pausedMessage);

	//mensagem de game over
	var gameOverMessage = new ObjectMessage(cnv.height/2, "", "#f00");
	gameOverMessage.visible = false;
	messages.push(gameOverMessage);
	
	//placar
	var scoreMessage = new ObjectMessage(10, "", "#00f");
	scoreMessage.font = "normal bold 15px emulogic";
	updateScore();
	messages.push(scoreMessage);

	//imagens
	var img = new Image(); 
	img.addEventListener("load", loadHandler, false)
	img.src = "img/img.png"; //essa é o sprite sheet,imagem com todos os elementos que precisam, ser
	assetsToLoad.push(img);	//recortados e adicionados no display via função render(drawImage).

	//recursos carregados
	var loadedAssets = 0;

	//entradas
	var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32;

	//ações
	var mvLeft = mvRight = shoot = spaceIsDown = false;

	//estados do jogo
	var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3;
	var gameState = LOADING;

	//listeners
	window.addEventListener("keydown", function(e) {
		var key = e.keyCode;
		switch(key) {

			case LEFT:
				mvLeft = true;
				break;
			
			case RIGHT:
				mvRight = true;
				break;
			case SPACE:
				if(!spaceIsDown){ //para n ficar atirando enquanto segura, tem que ser de clique 					
					shoot = true;	//em clique.
					spaceIsDown = true;
				}
				break;
		}
	});
	window.addEventListener("keyup", function(e) {
		var key = e.keyCode;
		switch(key){

			case LEFT:
				mvLeft = false;
				break;
			case RIGHT:
				mvRight = false;
				break;
			case ENTER:
				if(gameState !== OVER){
					if(gameState !== PLAYING){
						gameState = PLAYING;
						startMessage.visible = false; //quando press enter a msg some
						pausedMessage.visible = false;//quando tiver jogando some a msg paused
					}
					else{
						gameState = PAUSED;
						pausedMessage.visible = true;//aparece a msg paused quanto estiver pausado
					}
					break;
				}
			case SPACE:
				spaceIsDown = false;
				break;
		}

	});

	//FUNÇÕES ==============>

	function loadHandler() {
		loadedAssets++;
		if(loadedAssets === assetsToLoad){ //ja adicionou todos os recursos necessarios.
			img.removeEventListener("load", loadHandler, false);
			//depois disso inicia o jogo(vai pra tela de paused).
			gameState = PAUSED;
		}
	}

	function loop() {
		requestAnimationFrame(loop, cnv);
		//analisando os casos do gameState para definir as ações
		switch(gameState){
			case LOADING:
		
				break;
			case PLAYING:
				update();
				break;
			case OVER:
				endGame();
				break;
		}
		render(); //pega o resultado dessa analise do estado do jogo e renderiza a ação baseada
	}				//nesse resultado.

	function update() { //atualiza os elementos do game
		//move pra esquerda
		if(mvLeft && !mvRight){
			defender.vx = -5;
		}
		//move pra direita
		if(mvRight && !mvLeft){
			defender.vx = 5;
		}
		//para a nave
		if(!mvLeft && !mvRight){
			defender.vx = 0;
		}
		
		//dispara o missel
		if(shoot){
			fireMissile();
			shoot = false;
		}

		//atualiza a posição da nave, ele vai pegar como limite o 0 a esquerda e a largura do canvas a direita
		defender.x = Math.max(0, Math.min(cnv.width - defender.width, defender.x + defender.vx));
		
		//atualização da posição dos misseis
		for(var i in missiles){
			var missile = missiles[i];
			missile.y += missile.vy; //é o que faz o missel sem mover. 
			if(missile.y < -missile.height) {
				removeObjects(missile, missiles);//retirando o missel dos dois arrays
				removeObjects(missile, sprites);
				i--;
				updateScore();
			}
		}
		//incremento do alienTimer
		alienTimer++;
		//crianção do alien caso o timer se igual a frequencia	
		if(alienTimer == alienFrequency){
			makeAlien();
			alienTimer = 0;
			//ajuste da frequencia
			if(alienFrequency > 2){
				alienFrequency--;
			}
		}
		//movimentação dos alien
		for(var i in aliens) {
			var alien = aliens[i];
			if(alien.state !== alien.EXPLODED){
				alien.y += alien.vy;
				if(alien.state === alien.CRAZY){
					if(alien.x > cnv.width - alien.width || alien.x < 0) {
						alien.vx *= -1; //inverte a direção dele no eixo x, uma vez que ele encostou
						//na parede
					}	
				}
				alien.x += alien.vx;
			}
			//confere se algum alien chegou à terra(game over)
			if(alien.y > (canvas.height + alien.height)){
				gameState = OVER;
			}
			//confere se alguem alien colidiu com a nave
			if(collide(alien, defender)){
				destroyAlien(alien);
				removeObjects(defender, sprites);
				gameState = OVER;
			}

			//confere se algum alien foi destruído
			for(var j in missiles){
				var missile = missiles[j];
				if(collide(missile, alien) && alien.state !== alien.EXPLODED){ //verifica se houve colisao, ja que a funçao collide
					destroyAlien(alien);											//retorna true ou false de acordo com o hit.
					hits++
					updateScore();
					if(parseInt(hits) === scoreToWin){ //convertendo de string pra numero
						gameState = OVER;
						//destroi todos os aliens
						for(var k in aliens){
							var alienk = aliens[k];
							destroyAlien(alienk);
						}
					}
					removeObjects(missile, missiles);
					removeObjects(missile, sprites);												
					j--;
					i--;
				}
			}
		}
		
	}

	//criação do missel
	function fireMissile() {
		var missile = new Sprite(136, 12, 8, 13, defender.centerX() - 4, defender.y - 13);
		missile.vy = -8;
		sprites.push(missile); //ativando a renderização dos misseis
		missiles.push(missile);
		playSound(FIRE);
		shots++;
	}
	//criação de aliens
	function makeAlien() {
		//valor aleatorio entre 0 e 7 => largura do canvas / largura do alien
		//dividindo o canvas em 8 colunas para o posicionamento do alien, ou seja,
		//ele tem 8 possibilidades de "spawn";
		var alienPosition = (Math.floor(Math.random() * 8)) * 50;
		var alien = new Alien(30, 0, 50, 50, alienPosition, -50);
		alien.vy = 1;
		
		//otimização do alien : tipos de alien
		if(Math.floor(Math.random() * 11) > 7) { //probabilidade de 30%
			alien.state = alien.CRAZY;
			alien.vx = 2;
		}
		if(Math.floor(Math.random() * 11) > 5) { //probabilidade de 50%
			alien.vy = 2;
		}

		sprites.push(alien);
		aliens.push(alien);
	}
	//destroi aliens
	function destroyAlien(alien) {
		alien.state = alien.EXPLODED;
		alien.explode();
		playSound(EXPLOSION);
		setTimeout(function(){
			removeObjects(alien, aliens);
			removeObjects(alien, sprites); //apos 1 segundo vai remover o sprite
		}, 1000);
	}


	//função pra remover os sprites inutilizados dps da animaçaõ(missel, inimigos)
	function removeObjects(objectToRemove, array) {
		var i = array.indexOf(objectToRemove);//procurando o objeto que quer remover la no array
		if(i !== -1){
			array.splice(i, 1);
		}
	}
	//atualização do placar
	function updateScore() {
		if(shots === 0){
			acuracy = 100;
		}
		else{
			acuracy = Math.floor((hits / shots) * 100);
		}
		//ajuste no texto do acuracy
		if(acuracy < 100){
			acuracy = acuracy.toString();
			if(acuracy.length < 2){
				acuracy = "  " + acuracy;
			}
			else{
				acuracy = " " + acuracy;
			}
		}
		//ajuste no texto do hits
		hits = hits.toString();
		if(hits.length < 2){
			hits = "0" + hits;
		}

		scoreMessage.text = "HITS: " + hits + " - ACURACY: "+ acuracy + "%";
	}
	//função game over
	function endGame() {
		if(hits < scoreToWin){
			gameOverMessage.text = "EARTH DESTROYED!"
		
		}
		else{
			gameOverMessage.text = "EARTH SAVED!";
			gameOverMessage.color = "00f";
			
		}
		gameOverMessage.visible = true;
		setTimeout(function(){
			location.reload();
		}, 7000);
	}
	//efeitos sonoros do game
	function playSound(soundType) {
		var sound = document.createElement("audio");
		switch(soundType){
			case EXPLOSION:
				sound.src = "sounds/explosion.mp3";
				break;
			case FIRE:
				sound.src = "sounds/fire.mp3";
				break;
		}
		sound.addEventListener("canplaythrough", function(){
			sound.play();
		}, false);
	}

	function render() { //desenha os elementos do jogo na tela
		ctx.clearRect(0, 0, cnv.width, cnv.height);	
		//exibição dos sprites
		if(sprites.length !== 0){ //se tem algum sprite pra mostrar na tela
			for(var i in sprites){
				var spr = sprites[i];
				ctx.drawImage(img, spr.sourceX, spr.sourceY, spr.width, spr.height, Math.floor(spr.x), Math.floor(spr.y), spr.width,spr.height);
			}
		}
		//exibição dos textos
		if(messages.length !== 0){
			for(var i in messages){
				var message = messages[i];
				if(message.visible){
					ctx.font = message.font; //ajuste das config da fonte
					ctx.fillStyle = message.color; //ajuste da cor da msg
					ctx.textBaseline = message.baseline;//ancoragem da msg
					message.x = (cnv.width - ctx.measureText(message.text).width)/2; //centralizando o texto
					ctx.fillText(message.text, message.x, message.y);//desenhando na tela o texto
				}
			}
		}
	}

loop();
}());