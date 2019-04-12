function collide(s1, s2) { //dois sprites como parametro
	var hit = false; //colisao

	//calcula a distancia entre os centros dos sprites em x e y
	var vetX = s1.centerX() - s2.centerX();
	var vetY = s1.centerY() - s2.centerY();

	//armazenar as somas das metades dos sprites, altura e largura
	var sumHalfWidth = s1.halfWidth() + s2.halfWidth(); 
	var sumHalfHeight = s1.halfHeight() + s2.halfHeight();

	//verifica se houve colisao
	if(Math.abs(vetX) < sumHalfWidth && Math.abs(vetY) < sumHalfHeight){
		hit = true;
	}
	return hit;
}	