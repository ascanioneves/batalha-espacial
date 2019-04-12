var Sprite = function(sourceX, sourceY, width, height, x, y) {
	this.sourceX = sourceX; //vem como parametro
	this.sourceY = sourceY;	//origem
	this.width = width;
	this.height = height;
	this.x = x; //posição em x
	this.y = y;	//posição em y
	this.vx = 0;//velocidade de desloc em x
	this.vy = 0;//velocidade de desloc em y
}
Sprite.prototype.centerX = function() { //pegando o ponto central da imagem em x
	return this.x + (this.width/2);
}
Sprite.prototype.centerY = function() { //ponto central da imagem em y.
	return this.y + (this.height/2);
}
Sprite.prototype.halfWidth = function() {
	return this.width/2;
}
Sprite.prototype.halfHeight = function() {
	return this.height/2;
}
var Alien = function(sourceX, sourceY, width, height, x, y) {
	Sprite.call(this, sourceX, sourceY, width, height, x, y);
	this.NORMAL = 1;
	this.EXPLODED = 2;
	this.CRAZY = 3;
	this.state = this.NORMAL;
	this.mvStyle = this.NORMAL;
}
Alien.prototype = Object.create(Sprite.prototype); //herdando os metodos do sprite.

Alien.prototype.explode = function() { //muda o sprite para a explosão
	this.sourceX = 80;
	this.width = this.height = 56;
}

var ObjectMessage = function(y, text, color) {
	this.x = 0;
	this.y = y;
	this.text = text;
	this.visible = true;
	this.font = "normal bold 20px emulogic";
	this.color = color;
	this.baseline = "top";
}