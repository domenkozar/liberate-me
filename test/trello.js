var sinon = require('sinon'),
    temp = require('temp'),
    fs = require('fs'),
    trello = require('../lib/services/trello.js'),
    board_sample = require('./fixtures/trello-board.json'),
    cards_sample = require('./fixtures/trello-cards.json'),
    Service = require('../lib/service.js'),
    expect = require('chai').expect;
  // TODO: stub node-trello 

// Automatically track and cleanup files at exit
temp.track();

describe('Services', function() {
  describe('Trello', function() {
    it('Backup 1 board with 2 cards', function(){
      temp.mkdir('trelloservice', function(err, tmp_dir) {
        var service = new Service(
          "trello",
          {"services": {"trello": {key: 'foobar', token: 'foobar2'}}},
          tmp_dir
          );

        var stub = sinon.stub(trello.Trello.prototype, "get");
        stub.withArgs("/1/members/me/boards", sinon.match.func).yields(null, board_sample);
        stub.withArgs("/1/boards/50b41673d236ddc70d00e481/cards", sinon.match.func).yields(null, cards_sample);

        trello(service);

        // TODO: assert folder structure and file contents are correct
      });  
    });
  });
});

