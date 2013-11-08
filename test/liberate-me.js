// http://chaijs.com/api/bdd/
// http://sinonjs.org/
// TODO: figure out how to supress stdout from liberate-me while testing

var sinon = require('sinon'),
    liberate_me = require('./../bin/liberate-me.js'),
    temp = require('temp'),
    path = require('path'),
    fs = require('fs'),
    expect = require('chai').expect;

// Automatically track and cleanup files at exit
temp.track();

describe('bin/liberate-me', function() {
  beforeEach(function() {
    sinon.spy(process.stdout, "write");
    sinon.spy(process.stderr, "write");
    sinon.stub(process, "exit", function() {
      throw new Error("exit");
    });
  });

  afterEach(function() {
    process.stdout.write.restore();
    process.stderr.write.restore();
    process.exit.restore();
  });

  describe('main', function() {
    beforeEach(function() {
      sinon.stub(liberate_me, "validate_config");
    });

    afterEach(function() {
      liberate_me.validate_config.restore();
    });

    it('No arguments shows help', function() {
      try {
        liberate_me(["node", "foobar"]);
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stdout.write.args[0][0]).to.include("Usage: liberate-me [options]");
      }
    });

    it('One argument shows help', function() {
      try {
        liberate_me(["node", "liberate-me", "fubar"]);
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stderr.write.args[0][0]).to.include("Please pass correct number of arguments");
      }
    });

    it('dumpconfig reads sample config to stdout', function() {
      try {
        liberate_me(["node", "liberate-me", "dump-config"]);
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stdout.write.args[0][0]).to.include('"services": ');
      }
    });

    it('Target directory is created if it doesn\'t exist', function() {
      temp.mkdir('liberateme', function(err, tmp_dir) {
        var dir = path.join(tmp_dir, 'foobar'),
            conffile = path.join(tmp_dir, "libme.json");
        sinon.stub(liberate_me, "launch_services");
        expect(fs.existsSync(dir)).to.equal(false);
        fs.writeFileSync(conffile, "{}");
        liberate_me(["node", "liberate-me", conffile, dir]);
        liberate_me.launch_services.restore();
        expect(fs.existsSync(dir)).to.equal(true);
      });  
    });

    it('Configuration file does not exist', function() {
      try {
        liberate_me(["node", "liberate-me", "foobar", "foobar2"]);
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[0][0]).to.include('foobar does not exist');
      }
    });
  });

  describe('launch_services', function() {
    beforeEach(function() {
      sinon.stub(liberate_me.Service.prototype, "execute");
    });

    afterEach(function() {
      liberate_me.Service.prototype.execute.restore();
    });

    it('All configured services are invoked and directory is created if needed', function() {
      temp.mkdir('liberateme', function(err, tmp_dir) {
        liberate_me.launch_services({enabled: ["trello"], services: {"trello": {}}}, tmp_dir);
      });  
    });
  });

  describe('validate_config', function() {
    it('No services are enabled', function() {
      try {
        liberate_me.validate_config({enabled: [], services: {}});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('No services are enabled');
      }
    });
    it('No "enabled" section in config', function() {
      try {
        liberate_me.validate_config({});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('Missing required property: enabled');
      }
    });
    it('No "service" section in config', function() {
      try {
        liberate_me.validate_config({enabled: ["trello"]});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('Missing required property: services');
      }
    });
    it('Enabled Service does not exist', function() {
      try {
        liberate_me.validate_config({enabled: ["foobar"], services: {"foobar" : {"a": "b"}}});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('Service foobar is not supported, check for typo');
      }
    });
    it('Service section empty in config', function() {
      try {
        liberate_me.validate_config({enabled: ["trello"], services: {}});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('Service trello enabled but no configuration was supplied');
      }
    });
    it('Service enabled but has no configuration supplied', function() {
      try {
        liberate_me.validate_config({enabled: ["trello"], services: {"foobar": {}}});
      } catch (e) {
        expect(e.message).to.equal('exit');
        expect(process.stderr.write.args[1][0]).to.include('Service trello enabled but no configuration was supplied');
      }
    });
    it('all good', function() {
      liberate_me.validate_config({enabled: ["trello"], services: {"trello": {"foo": "bar"}}});
    });
  });

});
