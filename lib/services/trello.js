// See http://github.com/adunkman/node-trello/
//
// https://trello.com/1/authorize?key=substitutewithyourapplicationkey&name=My+Application&expiration=never&response_type=token
// https://trello.com/1/appKey/generate
//
// TODO: support organizations backup?

var Trello = require("node-trello"),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');


module.exports = function(service) {
   var t = new module.exports.Trello(service.config.key,
                                     service.config.token),
       boards_dir = path.resolve(service.directory, 'boards');

   mkdirp.sync(boards_dir);

   t.get("/1/members/me/boards", function(err, boards) {
     // TODO: we should probably boil here  
     //if (err) throw err;

     async.each(boards, function(board, cb) {
       var board_dir = path.resolve(boards_dir, board.id), 
           cards_dir = path.resolve(board_dir, "cards"); 
       mkdirp.sync(board_dir);
       fs.writeFile(path.resolve(board_dir, "info.json"),
                    JSON.stringify(board, null, "  ")
                    );

       t.get("/1/boards/" + board.id + "/cards", function(err, cards) {
         async.each(cards, function(card, cb) {
           var card_dir = path.resolve(cards_dir, card.id); 
           mkdirp.sync(card_dir);
           fs.writeFile(path.resolve(card_dir, "info.json"),
                        JSON.stringify(card, null, "  ")
                        );
         });
       });
     });
   });

};


module.exports.Trello = Trello;  // testing helper
