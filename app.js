(function(){

	var path = {
		images:{
			black_pawn : './images/bP.png',
			black_rook : './images/bR.png',
			black_king : './images/bK.png',
			black_queen : './images/bQ.png',
			black_bishop : './images/bB.png',
			black_knight : './images/bN.png',
			white_pawn : './images/wP.png',
			white_rook : './images/wR.png',
			white_king : './images/wK.png',
			white_queen : './images/wQ.png',
			white_bishop : './images/wB.png',
			white_knight : './images/wN.png'
		},
		patterns:{
			pattKing : /king/i,
			pattBlackPiece : /blackPiece/i,
			pattWhitePiece : /whitePiece/i
		},
		messages:{
			check_black : "check for black king",
			check_white : "check for white king",
			stalemate_black : "checkmate - player white won the match",
			stalemate_white : "checkmate - player black won the match"
		}
	}

	var Chess = {

		/*	name 		: initialize
		*	description : Function which is uded for initial rendering and event attachment
		*/

		initialize : function(){
			this.renderChessBoard();
			this.renderIcons();
			this.attachEvents();
		},

		/****************************************************************************
		*
		*					Render Functions for board and pieces
		*
		*****************************************************************************/
		
		/*	name 		: renderChessBoard
		*	description : Function for rendering the 64 black and white squares
		*/

		renderChessBoard : function(){
			
			var chessBoard = document.getElementById("chessBoard"),
				rowDiv,row;
				
			for (var i=1; i<9; i++){
				rowDiv = document.createElement("div");
				row = chessBoard.appendChild(rowDiv);
			    for (var j=1; j<9; j++){
			    	var childDiv = document.createElement("div");
					childDiv.className = ( (i+j)%2 !=0 )?"innerSquare black":"innerSquare silver";
			        childDiv.id = "square"+i+j;
			        childDiv.setAttribute('data-position', i.toString()+j );
			        row.appendChild(childDiv);
			    }
			}

		},	
		
		/*	name 		: renderIcons
		*	description : Function for rendering the individual pieces - rook, knight, bishop, queen, king and pawn 
		*/

		renderIcons : function(){

			var i=1, j=1;
			while (i<9){
				if(i == 1 || i ==8){
					for (j=1; j<9; j++){
						switch (j){
							case 1:
							case 8:
								this.createPieceElement("rook",i,j);
								break;
							case 2:
							case 7:
								this.createPieceElement("knight",i,j);
								break;
							case 3:
							case 6:
								this.createPieceElement("bishop",i,j);
								break;
							case 4:
								this.createPieceElement("queen",i,j);
								break;
							case 5:
								this.createPieceElement("king",i,j);
								break;
						}
				    }
				}else if(i == 2 || i ==7){
					for (j=1; j<9; j++){
						this.createPieceElement("pawn",i,j);
				    }
				}
				i++;
		    }

		},

		/*	name 		: createPieceElement
		*	description : Function for creating the base img element
		*	parameters	: pieceType, i , j
		*/

		createPieceElement : function(pieceType,i,j){
			
			var pieceElem = document.createElement("img");
			pieceElem.className = (i == 1 || i == 2 )?"pieceElem blackPiece":"pieceElem whitePiece";
	        pieceElem.setAttribute("draggable", (i == 1 || i == 2 )?"false":"true");
	        pieceElem.id = pieceType+i+j;
	        pieceElem.src = (i == 1 || i == 2) ? path.images[("black_"+pieceType)] : path.images[("white_"+pieceType)] ;

	        if(pieceType == "pawn") 
	        	pieceElem.setAttribute("ismoved", "false");

	        document.getElementById("square"+i+j).appendChild(pieceElem);
	      	return pieceElem;  

		},

		/***************************************************************************/
		
		/****************************************************************************
		*
		*					Event listeners for moving the pieces
		*
		*****************************************************************************/

		/*	name 		: attachEvents
		*	description : Function for binding the event listeners for events drop, dragover and dragstart
		*/

		attachEvents : function(){
			
		    var board = document.getElementById("chessBoard");
		    board.addEventListener('drop', this.dropPiece.bind(this), false);
		    board.addEventListener('dragover', this.allowPieceDrop, false);
		    board.addEventListener('dragstart', this.startPieceDragging, false);
		    
		},
		
		/*	name 		: allowPieceDrop
		*	description : callback function for dragover event
		*/

		allowPieceDrop : function(ev) {
		    ev.preventDefault();
		},
		
		/*	name 		: startPieceDragging
		*	description : callback function for dragstart event
		*/

		startPieceDragging : function(ev) {
		    ev.dataTransfer.setData("pieceId", ev.target.id);
		    ev.dataTransfer.setData("pieceClassName", ev.target.className);
		},
		
		/*	name 		: dropPiece
		*	description : callback function for drop event 
		*/

		dropPiece : function(ev) {
			
		    ev.preventDefault();
		    var pieceId = ev.dataTransfer.getData("pieceId"),
		    	pieceClassName = ev.dataTransfer.getData("pieceClassName");

		    var isCheckForWhiteKing = !!path.patterns["pattWhitePiece"].test(pieceClassName);
			

		    if(!!this.isPieceMovable(ev)){

		    	if( (this.isCurrentPieceInCheckState(isCheckForWhiteKing,ev, pieceId ) && !this.hasLegalMoveForPieces(isCheckForWhiteKing,ev))
		    		|| this.isCurrentPieceInCheckState(isCheckForWhiteKing,ev, pieceId ) && !this.hasLegalMoveForKing(isCheckForWhiteKing,ev) && path.patterns["pattKing"].test(pieceId)  ){
	    			return true;
		    	}else{

	    			document.getElementById("checkDiv").style.display = "none" ;
	    			if(this.isTargetImage(ev)){
						var currSquare = ev.target.parentElement;
			    		var remDivId = this.isBlackPiece(ev.target) ? "removedBlackPieceDiv" : "removedWhitePieceDiv" ;
			    		document.getElementById(remDivId).appendChild(ev.target);
			    		currSquare.appendChild(document.getElementById(pieceId));
			    	}else{
			    		ev.target.appendChild(document.getElementById(pieceId));
			    	}

			    	isCheckForWhiteKing = !isCheckForWhiteKing;
			    	var advElemCheck = this.isOppositePieceInCheckState(isCheckForWhiteKing,ev);
					if(advElemCheck){

						var isKingMoveAvailable = this.hasLegalMoveForKing(isCheckForWhiteKing,ev);
						var isPiecesMoveAvailable = this.hasLegalMoveForPieces(isCheckForWhiteKing,ev);
						if(isKingMoveAvailable || isPiecesMoveAvailable){
							document.getElementById("checkDiv").innerHTML = (!isCheckForWhiteKing) ? path.messages["check_black"] : path.messages["check_white"];
						}else{
							document.getElementById("checkDiv").innerHTML = (!isCheckForWhiteKing) ? path.messages["stalemate_black"] : path.messages["stalemate_white"];
						}
		    			document.getElementById("checkDiv").style.display = "block" ;

		    		}
		    		this.toggleDraggable(pieceClassName);
	    		}
		    }

		},

		/****************************************************************************/

		

		/****************************************************************************
		*
		*						rule set for pieces
		*
		*****************************************************************************/


		/****************************************************************************
		*
		*	name : isPieceMovable
		*
		*	1) 'rook','bishop' and 'knight' will follow the rules of pawn
		*
		*
		*****************************************************************************/

		/*	name 		: isPieceMovable
		*	description : Function checks whether the piece is movable or not based on several rules
		*/

		isPieceMovable : function(ev){
	 
			var elem = document.getElementById(ev.dataTransfer.getData("pieceId"));
			var elemId = elem.getAttribute("id");
			var elemType = elemId.replace(/[0-9]/g,'');

			var currSquare = elem.parentElement, currPos, tgtPos;
			currPos = this.getCurrentPosition(currSquare);
			tgtPos = this.getTargetPosition(ev);

			switch (elemType) {
				case "pawn" : 
				case "rook" : 
				case "bishop" : 
				case "knight" : 
					return this.isPawnMovable(ev,currPos,tgtPos);
					break ;
				case "king" : 
					return this.isKingMovable(ev,currPos,tgtPos);
					break ;
				case "queen" : 
					return this.isQueenMovable(ev,currPos,tgtPos);
					break ;
				default : 
					return true;
			}

		},

		/*	name 		: isPawnMovable
		*	description : Function checks for the movability of pawn based on its its current and target positions
		*/

		isPawnMovable : function(ev,currPos,tgtPos){

			var currElem = document.getElementById(ev.dataTransfer.getData("pieceId"));
			var curElemType, tgtElemType;

			var step = this.getElementRow(currPos) - this.getElementRow(tgtPos) ;
			step = ( this.isBlackPiece(currElem) ? -step: step);
			
			if (step<0 || Math.abs(step)>2 || this.isHorizontalMovement(currPos,tgtPos) ){
				return false;
			}
				
			if(this.isVerticalMovement(currPos,tgtPos) ){
				
				if (this.isTargetImage(ev)){
					return false;
				}

				if(currElem.getAttribute("ismoved") == "false" && !this.isPresentVerticalMiddleElement(currPos,tgtPos) ){
					currElem.setAttribute("ismoved","true");
					return true;
				}else{
					return (!(step==2));
				}


			}else{
				if(!this.isTargetImage(ev)){
					return false;
				}else{
					return( this.isBlackPiece(currElem) != this.isBlackPiece(ev.target) ) ;
				}
			}
		},

		/*	name 		: isQueenMovable
		*	description : Function checks for the movability of queen based on its its current and target positions
		*/

		isQueenMovable : function(ev,currPos,tgtPos){

			var currElem = document.getElementById(ev.dataTransfer.getData("pieceId"));
			if( !(this.isVerticalMovement(currPos,tgtPos) || this.isHorizontalMovement(currPos,tgtPos) || this.isDiagonalMovement(currPos,tgtPos) ) 
				|| this.isPresentMiddleElement(currPos,tgtPos)
				|| ( this.isTargetImage(ev) && ( this.isBlackPiece(currElem) == this.isBlackPiece(ev.target) ) )
			){
				return false;
			}
			return true;

		},

		/*	name 		: isKingMovable
		*	description : Function checks for the movability of king based on its current and target positions
		*/

		isKingMovable : function(ev,currPos,tgtPos){

			var curRow = this.getElementRow(currPos),
				curCol = this.getElementCol(currPos),
				tgtRow = this.getElementRow(tgtPos),
				tgtCol = this.getElementCol(tgtPos);
			
			var step = ( curRow == tgtRow ) ? (Math.abs(curCol-tgtCol)) : ( curCol == tgtCol ) ? (Math.abs(curRow-tgtRow)) : ( Math.abs(curRow-tgtRow)==1 || Math.abs(curCol-tgtCol)==1) ? 1 : 0 ;
			var currElem = document.getElementById(ev.dataTransfer.getData("pieceId"));
			
			if( step!=1 || ( this.isTargetImage(ev) && ( this.isBlackPiece(currElem) == this.isBlackPiece(ev.target) ) ) ){
				return false;
			}
			return true;

		},

		/****************************************************************************/

		/****************************************************************************
		*
		*						rule set for stalemate
		*
		*****************************************************************************/

		/*	name 		: hasLegalMoveForPieces
		*	description : Function checks whether any further moves are allowed for various pieces after the check
		*/

		hasLegalMoveForPieces : function(isCheckForWhiteKing,ev){

			var piece = document.getElementById("chessBoard").getElementsByClassName( ( isCheckForWhiteKing ? "whitePiece" : "blackPiece" ) );

			for(var i=0, len=piece.length ; i<len ; i++){

		    	pieceElemId = piece[i].getAttribute("id"),
		    	pieceElemType = pieceElemId.slice(0,pieceElemId.length-2),
		    	piecePos = piece[i].parentElement.getAttribute("data-position");
		    	
		    	switch (pieceElemType) {
		    		case "pawn" :
		    		case "rook" :
		    		case "knight" :
		    		case "bishop" :
		    			this.hasLegalMoveForPawn(isCheckForWhiteKing,ev,piece[i]);
		    			return true;
		    			break;
		    		default :
		    			break;
		    	}
		    	
		    }

		},

		/*	name 		: hasLegalMoveForKing
		*	description : Function checks whether any further moves are allowed for king after the check
		*/

		hasLegalMoveForKing : function(isCheckForWhiteKing,ev){

			var kingPos = ( !isCheckForWhiteKing )?"15":"85",
		    	kingSquarePos = document.getElementById("king"+kingPos).parentElement.getAttribute("data-position"),
		    	kingClassPatt = ( !isCheckForWhiteKing ) ? path.patterns["pattBlackPiece"] : path.patterns["pattWhitePiece"] ;

		    var curRow = this.getElementRow(kingSquarePos),
		    	curCol = this.getElementCol(kingSquarePos);

		    var isMoveAvailable=false, piecePos, pieceId, squareElem, squareElemClass,
		    	rowArray = [], colArray = [];

	    	(curRow == 1) ? rowArray.push(1,2) : (curRow == 8) ? rowArray.push(7,8) : rowArray.push(curRow-1,curRow,curRow+1);
	    	(curCol == 1) ? colArray.push(1,2) : (curCol == 8) ? colArray.push(7,8) : colArray.push(curCol-1,curCol,curCol+1);
	    	
	    	for( var i=0, rowArrLen = rowArray.length; i < rowArrLen; i++){
		    	for (var j=0, colArrLen = colArray.length; j < colArrLen; j++){

			    	piecePos = rowArray[i].toString()+colArray[j] ;
			    	pieceId = "king"+piecePos;
			    	squareElem = document.getElementById("square"+piecePos);
			    	squareElemClass = (squareElem.hasChildNodes())?squareElem.children[0].getAttribute("class"):"" ;

			    	if(squareElem.hasChildNodes() && kingClassPatt.test(squareElemClass) ){
			    		isMoveAvailable = false;
			    	}else if(!this.isCurrentPieceInCheckState(isCheckForWhiteKing,ev,pieceId,true)){
			    		return true;
			    	}
			    }
		    }

		    return isMoveAvailable;

		},

		/*	name 		: hasLegalMoveForPawn
		*	description : Function checks whether any further moves are allowed for pawn after the check
		*/

		hasLegalMoveForPawn : function(isCheckForWhiteKing,ev,pieceElem){

			var pieceElemId = pieceElem.getAttribute("id"),
				pieceClassName = pieceElem.getAttribute("class"),
				pieceElemType = pieceElemId.slice(0,pieceElemId.length-2),
		    	piecePos = pieceElem.parentElement.getAttribute("data-position");

		    var curRow = this.getElementRow(piecePos),
		    	curCol = this.getElementCol(piecePos),
		    	colArray = [],tgtRow, isMoveAvailable = false;

		    (curCol == 1) ? colArray.push(1,2) : (curCol == 8) ? colArray.push(7,8) : colArray.push(curCol-1,curCol,curCol+1);

			if(this.isBlackPiece(pieceElem)){
				if(curRow == 8){
					return false;
				}
				tgtRow = curRow+1;
			}else{
				if(curRow == 1){
					return false;
				}
				tgtRow = curRow-1;
			}

			var step = curRow - tgtRow ;
			step = ( this.isBlackPiece(pieceElem) ? -step: step);
			
			for(var i=0,len=colArray.length;i<len;i++){
				
				if (step<0 || Math.abs(step)>2 || this.isHorizontalMovement(piecePos,(tgtRow.toString()+i)) ){
					return false;
				}
					
				if(this.isVerticalMovement(piecePos,(tgtRow.toString()+i)) ){
					
					if (this.isTargetImage(ev)){
						return false;
					}

					if(currElem.getAttribute("ismoved") == "false" && !this.isPresentVerticalMiddleElement(currPos,tgtPos) ){
						currElem.setAttribute("ismoved","true");
						if(!this.isCurrentPieceInCheckState(isCheckForWhiteKing,ev,pieceElemId,fas)){
				    		return true;
				    	}
					}else{
						return (!(step==2));
					}


				}else{
					if(!this.isTargetImage(ev)){
						return false;
					}else{
						return( this.isBlackPiece(pieceElem) != this.isBlackPiece(ev.target) ) ;
					}
				}

				

			}

			return false;
			
		},

		/*	name 		: isInCheckState
		*	description : Function to identify the state "check' by opponent's various pieces
		*/

		isInCheckState : function(isCheckForWhiteKing,ev,pieceId,kingMoveFlag){

			var piece = document.getElementById("chessBoard").getElementsByClassName( ( !isCheckForWhiteKing ? "whitePiece" : "blackPiece" ) );
			
			var kingPos = ( !isCheckForWhiteKing )?"15":"85",
		    	advKingPos = ( !isCheckForWhiteKing )?"85":"15",
		    	kingSquarePos = document.getElementById("king"+kingPos).parentElement.getAttribute("data-position"),
		    	advKingSquarePos = document.getElementById("king"+advKingPos).parentElement.getAttribute("data-position");

			var checkPositions = [], pieceElemId, pieceElemType, piecePos, step, position;

			for(var i=0, len=piece.length ; i<len ; i++){

		    	pieceElemId = piece[i].getAttribute("id"),
		    	pieceElemType = pieceElemId.slice(0,pieceElemId.length-2),
		    	piecePos = piece[i].parentElement.getAttribute("data-position");
		    		
		    	
		    	switch (pieceElemType) {
		    		case "pawn" :
		    		case "rook" :
		    		case "knight" :
		    		case "bishop" :
		    			step = (!isCheckForWhiteKing)?-1:+1;
		    			position = this.isCheckByPawn(piecePos,kingSquarePos,step,ev,pieceId,kingMoveFlag);
		    			if(!! position ) {
		    				checkPositions.push(position) ;
		    			} 
		    			break;
		    		case "king" :
		    			position = this.isCheckByKing(kingSquarePos,advKingSquarePos,ev,pieceId,kingMoveFlag);
		    			if(!! position ) {
		    				checkPositions.push(position) ;
		    			} 
		    			break;
		    		case "queen" :
		    			position = this.isCheckByQueen(kingSquarePos,isCheckForWhiteKing,ev,pieceId,kingMoveFlag);
		    			if(!! position ) {
		    				checkPositions.push(position) ;
		    			} 
		    			break;
		    		default :
		    			break;

		    	}
		    	
		    }
		    return checkPositions;

		},

		/*	name 		: isCurrentPieceInCheckState
		*	description : For identifying 'check' for same color, when they are making a move
		*/

		isCurrentPieceInCheckState : function(isCheckForWhiteKing,ev,pieceId,kingMoveFlag){

			var checkPositions = this.isInCheckState(isCheckForWhiteKing,ev,pieceId,kingMoveFlag);
		    return ( !!checkPositions && ( checkPositions.length > 0 ) );
		},

		/*	name 		: isOppositePieceInCheckState
		*	description : For identifying 'check' for opponents piece, when they are making a move
		*/

		isOppositePieceInCheckState : function(isCheckForWhiteKing,ev){

			var checkPositions = this.isInCheckState(isCheckForWhiteKing,ev);
		    return ( !!checkPositions && ( checkPositions.length > 0 ) );
		    
		},

		/*	name 		: isCheckByPawn
		*	description : Function to identify whether the check is caused by pawn
		*/

		isCheckByPawn : function(piecePos,kingSquarePos,step,ev,pieceId,kingMoveFlag){

			var nextRow = this.getElementRow(piecePos)+step,
    			nextCol1 = this.getElementCol(piecePos)+1,
    			nextCol2 = this.getElementCol(piecePos)-1;


    		var nextPosElem1 = document.getElementById("square"+ nextRow+ nextCol1);
    		var nextPosElem2 = document.getElementById("square"+ nextRow+ nextCol2);

    		var nextPos1 = !!nextPosElem1 && nextPosElem1.getAttribute("data-position");
    		var nextPos2 = !!nextPosElem2 && nextPosElem2.getAttribute("data-position");

    		if(	path.patterns["pattKing"].test(pieceId) ){
				if(!!kingMoveFlag){
					kingSquarePos = pieceId.replace('king','');
				}else{
					kingSquarePos = ev.target.getAttribute("data-position");
				}
			}

			if(piecePos == kingSquarePos){
				return false;
			}
			
    		if(kingSquarePos == nextPos1 || kingSquarePos == nextPos2){
    			return piecePos;
    		}
    		return false;

		},

		/*	name 		: isCheckByKing
		*	description : Function to identify whether the check is caused by king
		*/

		isCheckByKing : function(kingSquarePos,advKingSquarePos,ev,pieceId,kingMoveFlag){

			if(	path.patterns["pattKing"].test(pieceId) ){
				if(!!kingMoveFlag){
					kingSquarePos = pieceId.replace('king','');
				}else{
					kingSquarePos = ev.target.getAttribute("data-position");
				}
			}

			var kingSquareRow = this.getElementRow(kingSquarePos),
    			kingSquareCol = this.getElementCol(kingSquarePos),
    			advKingSquareRow = this.getElementRow(advKingSquarePos),
    			advKingSquareCol = this.getElementCol(advKingSquarePos);

    		var diff = (kingSquareRow == advKingSquareRow) ? Math.abs(kingSquareCol-advKingSquareCol) : Math.abs(kingSquareRow-advKingSquareRow) ;
    		
    		if(diff == 1){
    			return advKingSquarePos;
    		}
    		return false;

		},

		/*	name 		: isCheckByQueen
		*	description : Function to identify whether the check is caused by queen
		*/

		isCheckByQueen : function(kingSquarePos,isCheckForWhiteKing,ev,pieceId,kingMoveFlag){

			var advQueenPos = (!isCheckForWhiteKing )?"84":"14";
	    		advQueenSquarePos = document.getElementById("queen"+advQueenPos).parentElement.getAttribute("data-position");

	    	if(	path.patterns["pattKing"].test(pieceId) ){
				if(!!kingMoveFlag){
					kingSquarePos = pieceId.replace('king','');
				}else{
					kingSquarePos = (ev.target.tagName.toLowerCase() == "img") ? ev.target.parentElement.getAttribute("data-position") : ev.target.getAttribute("data-position");
				}
			}

			if(advQueenSquarePos == kingSquarePos){
				return false;
			}

	    	if( ( this.isDiagonalMovement(advQueenSquarePos,kingSquarePos) && !this.isPresentDiagonalMiddleElement(advQueenSquarePos,kingSquarePos,pieceId) ) 
	    		|| ( this.isVerticalMovement(advQueenSquarePos,kingSquarePos) && !this.isPresentVerticalMiddleElement(advQueenSquarePos,kingSquarePos,pieceId) ) 
	    		|| ( this.isHorizontalMovement(advQueenSquarePos,kingSquarePos) && !this.isPresentHorizontalMiddleElement(advQueenSquarePos,kingSquarePos,pieceId) ) 
	    		){
	    		return advQueenSquarePos;
	    	}
	    	return false;

		},

		/****************************************************************************/

		/****************************************************************************
		*
		*							Helper Functions
		*
		*****************************************************************************/

		/*	name 		: getElementRow
		*	description : Function returns the row, if we send input in row-column format
		*/

		getElementRow : function(pos){
			return pos && parseInt(pos.slice(0,1)) ;
		},

		/*	name 		: getElementCol
		*	description : Function returns the column, if we send input in row-column format
		*/

		getElementCol : function(pos){
			return pos && parseInt(pos.slice(1,2)) ;
		},

		/*	name 		: isTargetImage
		*	description : Function checks whether the targeted element is an image or not.
		*/

		isTargetImage : function(ev){
			return !!ev.target.hasAttribute('src') ;
		},

		/*	name 		: isBlackPiece
		*	description : Function checks whether the piece is black or white.
		*/
		
		isBlackPiece : function(elem){
			return !!path.patterns["pattBlackPiece"].test(elem.getAttribute('class')) ;
		},

		/*	name 		: getCurrentPosition
		*	description : Function returns the current position of an element
		*/

		getCurrentPosition : function(currSquare){
			return currSquare.getAttribute('data-position') ;
		},
		
		/*	name 		: getTargetPosition
		*	description : Function returns the targeted position of an element
		*/

		getTargetPosition : function(ev){
			var elem = ev.target;
			elem = (elem.tagName.toLowerCase() == "img") ? elem.parentElement : elem ;
			
			return elem.getAttribute('data-position') ;
		},

		/*	name 		: isVerticalMovement
		*	description : Function identifies whether the movement is vertical or not based on current and target position
		*/

		isVerticalMovement : function(currPos,tgtPos){
			return ( parseInt(currPos.slice(1,2)) === parseInt(tgtPos.slice(1,2)) );
		},

		/*	name 		: isHorizontalMovement
		*	description : Function identifies whether the movement is horizontal or not based on current and target position
		*/

		isHorizontalMovement : function(currPos,tgtPos){
			return ( parseInt(currPos.slice(0,1)) === parseInt(tgtPos.slice(0,1)) );
		},

		/*	name 		: isDiagonalMovement
		*	description : Function identifies whether the movement is diagonal or not based on current and target position
		*/

		isDiagonalMovement : function(currPos,tgtPos){
			
			var curRow = this.getElementRow(currPos),
				curCol = this.getElementCol(currPos),
				tgtRow = this.getElementRow(tgtPos),
				tgtCol = this.getElementCol(tgtPos);

			var diff = Math.abs(tgtRow-curRow);

			return ( tgtCol == (curCol+diff) || tgtCol == (curCol-diff) );
		},

		/*	name 		: isPresentMiddleElement
		*	description : Function to identify whether any element present between given current and target positions
		*/

		isPresentMiddleElement : function(currPos,tgtPos){
			
			if(this.isVerticalMovement(currPos,tgtPos)){
				return this.isPresentVerticalMiddleElement(currPos,tgtPos);
			}else if(this.isHorizontalMovement(currPos,tgtPos)){
				return this.isPresentHorizontalMiddleElement(currPos,tgtPos);
			}else if(this.isDiagonalMovement(currPos,tgtPos)){
				return this.isPresentDiagonalMiddleElement(currPos,tgtPos);
			}
			return false;
		},

		/*	name 		: isPresentVerticalMiddleElement
		*	description : Function to identify whether any element present vertically between given current and target positions
		*/

		isPresentVerticalMiddleElement : function(currPos,tgtPos,pieceId){

			var curRow = this.getElementRow(currPos),
				curCol = this.getElementCol(currPos),
				tgtRow = this.getElementRow(tgtPos),
				pieceRow = (!!pieceId) ? this.getElementRow(pieceId.slice(pieceId.length-2,pieceId.length)) : 0;
			
			var step = curRow - tgtRow;
			
			while(curRow != tgtRow){
				curRow = (step<1) ? curRow+1 : curRow-1 ;
				if( curRow != tgtRow && !(curRow == pieceRow) && document.getElementById("square"+curRow+curCol).hasChildNodes()){
					return true;
				}
			}
			return false;

		},

		/*	name 		: isPresentHorizontalMiddleElement
		*	description : Function to identify whether any element present horizontally between given current and target positions
		*/

		isPresentHorizontalMiddleElement : function(currPos,tgtPos,pieceId){

			var curRow = this.getElementRow(currPos),
				curCol = this.getElementCol(currPos),
				tgtCol = this.getElementCol(tgtPos),
				pieceCol = (!!pieceId) ? this.getElementCol(pieceId.slice(pieceId.length-2,pieceId.length)) : 0;

			var step = curCol - tgtCol;
			
			while(curCol != tgtCol){
				curCol = (step<1) ? curCol+1 : curCol-1 ;
				if( curCol != tgtCol && !(curCol == pieceCol) &&document.getElementById("square"+curRow+curCol).hasChildNodes()){
					return true;
				}
			}
			return false;
		},

		/*	name 		: isPresentDiagonalMiddleElement
		*	description : Function to identify whether any element present diagonally between given current and target positions
		*/

		isPresentDiagonalMiddleElement : function(currPos,tgtPos,pieceId){

			var curRow = this.getElementRow(currPos),
				curCol = this.getElementCol(currPos),
				tgtRow = this.getElementRow(tgtPos),
				tgtCol = this.getElementCol(tgtPos),
				pieceRow = (!!pieceId) ? this.getElementRow(pieceId.slice(pieceId.length-2,pieceId.length)) : 0,
				pieceCol = (!!pieceId) ? this.getElementCol(pieceId.slice(pieceId.length-2,pieceId.length)) : 0;

			var rowStep = curRow - tgtRow, colStep = curCol - tgtCol;
			
			while(curRow != tgtRow){
				curRow = (rowStep<1) ? curRow+1 : curRow-1 ;
				curCol = (colStep<1) ? curCol+1 : curCol-1 ;
				if( curRow != tgtRow && !( curRow == pieceRow && curCol == pieceCol ) && document.getElementById("square"+curRow+curCol).hasChildNodes()){
					return true;
				}
			}
			return false;

		},

		/*	name 		: toggleDraggable
		*	description : This is used to switch beteen players after each successful move.
		*/

		toggleDraggable : function(className){
			
			var patt = path.patterns["pattWhitePiece"] ;
			var whitePiece = document.getElementsByClassName("whitePiece");
		    var blackPiece = document.getElementsByClassName("blackPiece");
		    
		    for(var i=0, len=whitePiece.length ; i<len ; i++){
		        whitePiece[i].setAttribute("draggable",(!patt.test(className)?"true":"false"));
		    }
		    for(var i=0, len=blackPiece.length ; i<len ; i++){
		        blackPiece[i].setAttribute("draggable",(!!patt.test(className)?"true":"false"));
		    }

		    document.getElementById("playerTurnSpan").innerHTML = (!!patt.test(className))?"Black":"White";

		},

		/****************************************************************************/

	}

	Chess.initialize();

})();