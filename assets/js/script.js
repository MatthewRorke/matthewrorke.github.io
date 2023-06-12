function start() { // Bound to hardcoded HTML
    addElementClassIfNotExist(document.getElementById('start-btn'), 'hidden');
    removeElementClassIfExist(document.getElementById('reset-btn'), 'hidden');
    startGame(function() {
        // Loaded
        removeElementClassIfExist(
            document.getElementById('game'),
            'hidden'
        );
    });
}

function reset(startNewGame = true) {
    addElementClassIfNotExist(document.getElementById("game"), 'hidden');
    var arenaNode = document.getElementById("arena");
    while(arenaNode.hasChildNodes()) {
        arenaNode.firstChild.remove()
    }
    removeElementClassIfExist(document.getElementById('start-btn'), 'hidden');
    if(startNewGame) {
        setTimeout(function() {
            start();
        }, 500);
    } else {
        addElementClassIfNotExist(document.getElementById('reset-btn'), 'hidden');
    }
}

function startGame(cb = null) {
    // generate grid programmatically so that we can future proof
    // against bigger grids to keep the game interesting
    var playerNames = [
        {'name': 'Crosses', classValue: 'cross'},
        {'name': 'Naughts', classValue: 'naught'}
    ];
    var currTurnIndex = 0;
    var nextPlayerTurn = 1;

    var rowTotalCount = 3;
    var colTotalCount = 3;

    var arena = document.getElementById('arena');
    for(var rowId = 0; rowId < rowTotalCount; rowId++) {
        var row = createRow(rowId);
        for(var colId = 0; colId < colTotalCount; colId++) {
            var col = createCol(rowId, colId);
            row.appendChild(col);
        }
        arena.appendChild(row);
    }

    setNextPlayerTurn(0); // Force player 1 (index 0) to be their turn.

    function createRow(rowId) {
        var row = document.createElement('div');
        addElementClassIfNotExist(row, 'row');
        row.setAttribute('data-row-id', rowId);
        return row;
    }

    function createCol(rowId, colId) {
        var col = document.createElement('div');
        addElementClassIfNotExist(col, 'col');
        col.setAttribute('data-row-id', rowId);
        col.setAttribute('data-col-id', colId);
        col.setAttribute('data-value', 0);
        return col;
    }

    function setNextPlayerTurn(specificPlayerIndex = null) {
        if(specificPlayerIndex != null) { // Optionally force the turn to a specific player
            currTurnIndex = specificPlayerIndex // Client-side security risk.
        } else {
            // Set data for the player's turn
            currTurnIndex = nextPlayerTurn;
        }
        document.getElementById('turn-selector').textContent = playerNames[currTurnIndex].name;
        nextPlayerTurn = currTurnIndex+1;

        // Make sure the next player's turn is an actual player.
        var totalPlayers = playerNames.length;
        if(nextPlayerTurn > (totalPlayers-1)) {
            nextPlayerTurn = 0; // Set to player 1 if no "next" player exists.
        }
    }

    function onColClick() {
        this.setAttribute('data-value', playerNames[currTurnIndex].classValue);
        addElementClassIfNotExist(this, 'disabled');
        this.removeEventListener('click', onColClick);
        checkForWin();
        setNextPlayerTurn();
    }

    function setHasWon(playerIndex, winReason) {
        if(!playerIndex) {
            alert("GAME OVER!\nStale Mate\nNOBODY WINS."); 
        } else {
            alert("GAME OVER!\n" + winReason + " win\nWinner: " + playerNames[playerIndex].name);  
        }      
        reset(false);
    }

    function checkForWin() {
        var allColumns = document.querySelectorAll('#arena > .row > .col');

        var checkColumns = [
            {
                'ruleName': 'Diagonal',
                'rules': [
                    ['00', '11', '22'],
                    ['02', '11', '20']
                ],
            },
            {
                'ruleName': 'Horizontal',
                'rules': [
                    ['00', '01', '02'],
                    ['10', '11', '12'],
                    ['20', '21', '22']
                ],
            },
            {
                'ruleName': 'Vertical',
                'rules': [
                    ['00', '10', '20'],
                    ['01', '11', '21'],
                    ['02', '12', '22'] 
                ]
            }
        ]

        var playersAndResults = {};
        var potentialStaleMate = true;
        allColumns.forEach(function(v) {
            var playerValue = v.getAttribute('data-value');
            if(playerValue == "0") {
                potentialStaleMate = false;  // Impossible to stalemate when there are empty fields
                return; // continue
            }
            if(!playersAndResults[playerValue]) {
                playersAndResults[playerValue] = [];
            }
            var colId = v.getAttribute('data-row-id') + '' + v.getAttribute('data-col-id');
            playersAndResults[playerValue].push(
               colId
            );
        });
        
        var hasSomeoneWon = false;
        checkColumns.forEach(function(ruleSet) { // For each possible way to win
            ruleSet.rules.forEach(function(rule) { // For each rule within each possibility
                Object.keys(playersAndResults).forEach(function(playerKey) { // For each player by Key
                    var playerWinnableResults = rule.filter(function(res) { // Iterate with every return
                        return playersAndResults[playerKey].indexOf(res) != -1;
                    });
                    if(playerWinnableResults.length == rule.length) {
                        hasSomeoneWon = true;
                        setTimeout(function() {
                            setHasWon(currTurnIndex, ruleSet.ruleName);
                        }, 100);
                    }
                });
            });
        });
        if(!hasSomeoneWon && potentialStaleMate) {
            setHasWon(false, false);
        }
    }

    var allColumns = document.querySelectorAll('#arena > .row > .col'); // querySelector returns iterable results instead of htmlCollections returned by getElementByClassName
    allColumns.forEach(function(v) {
        v.addEventListener('click', onColClick);
    });


    if(cb) {
        cb();
    }
}