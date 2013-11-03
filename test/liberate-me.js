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
    process.exit.restore();
    process.stdout.write.restore();
    process.stderr.write.restore();
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
      var dir = path.resolve(tmp_dir, 'foobar'),
          conffile = path.resolve(tmp_dir, "libme.json");
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
      liberate_me(["node", "liberate-me", "foobar", "foobar"]);
    } catch (e) {
      expect(e.message).to.equal('exit');
      expect(process.stderr.write.args[0][0]).to.include('foobar does not exist');
    }
  });

  describe('launch_services', function() {
    it('No services are configured', function() {
      try {
        liberate_me.launch_services({enabled: []}, "foobar");
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stderr.write.args[0][0]).to.include('No services are enabled');
      }
    });
    it('No "enabled" property in config', function() {
      try {
        liberate_me.launch_services({}, "foobar");
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stderr.write.args[0][0]).to.include('No services are enabled');
      }
    });
    it('Service does not exist', function() {
      try {
        liberate_me.launch_services({enabled: ["foobar"]}, "foobar");
      } catch (e) {
        expect(e.message).to.equal('exit'); 
        expect(process.stderr.write.args[0][0]).to.include('No such service foobar');
      }
    });
    it('No service section in config');
    it('Service not defined in config');
    it('All configured services are invoked');
  });

});
