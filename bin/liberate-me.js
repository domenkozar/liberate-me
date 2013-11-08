#!/usr/bin/env node

var metadata = require('./../package.json'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    async = require('async'),
    program = require('commander'),
    tv4 = require('tv4'),
    config,
    args,
    output_directory;

module.exports = function(argv) {
  program
    .usage('[options] <config.json> <output directory>')
    .version(metadata.version)
    .option('-v, --verbose', 'More output');
  program._name = "liberate-me";
    
  program.command('dump-config')
    .action(function() {
      var conffile = path.resolve(__dirname, '..', 'libme.json.sample');
      console.log(fs.readFileSync(conffile, {encoding: "utf-8"}));
      process.exit(0);
    });
  
  program.parse(argv);
  args = program.args;
  
  // check for number of arguments
  if (args.length !== 2) {
    console.error("Error: Please pass correct number of arguments.");
    program.help();
  } 
  
  config_filename = path.resolve(process.cwd(), args[0]);
  if (fs.existsSync(config_filename) === false) {
    console.error("Error: Config file %s does not exist.", config_filename);
    process.exit(1);
  }
  config = require(config_filename);
  module.exports.validate_config(config);
  output_directory = path.resolve(process.cwd(), args[1]);

  // create output directory if it doesn't exist
  mkdirp.sync(output_directory, console.error);
  
  //console.debug("Output directory: %s", output_directory);
  module.exports.launch_services(config, output_directory);
  
};

module.exports.launch_services = function launch_services(config, output_directory) {
  async.each(config.enabled, function(service_name) {
    var service = new Service(service_name, config, output_directory);

    //console.debug("Configuration for %s: %s", service_name, config);

    console.info("Fetching data from %s", service_name);
    mkdirp.sync(service.directory, console.error);
    service.execute();
  });
};

var Service = function(name, global_config, output_directory) { this.init(name, global_config, output_directory); };
Service.prototype = {
  init: function(name, global_config, output_directory) {
    this.name = name;
    this.config = global_config.services[name];
    this.output_directory = output_directory;
    this.directory = path.resolve(output_directory, name);
  },

  execute: function(config, directory) {
    var service_path = path.resolve(__dirname, '../services/' + this.name + '.js'),
        service = require(service_path);
    return service(this);
  }
};
module.exports.Service = Service;

module.exports.validate_config = function validate_config(config) {
  var schema = {
        "type": "object",
        "properties": {
            "enabled": { 
              "type": "array",
              "uniqueItems": true,
              "minItems": 1,
              // TODO: "items": { "enum": [ "trello", "trello2" ] },
            },
            "services": {
              "type": "object"
            }
        },
        "additionalProperties": false,
        "required": [ "enabled", "services" ]
      },
      result = tv4.validateResult(config, schema);
  
  if (result.valid === false) {
    console.error("Error parsing configuration:");
    if (result.error.schemaPath === '/properties/enabled/minItems') {
      console.error("No services are enabled");
      process.exit(1);
    }
    console.error(result.error.message);
    process.exit(1);
    // TODO: convert errors into user-readable messages
    // - handle wrong type of enable
    // - handle length 0 of enable
  }

  async.each(config.enabled, function(service_name) {
    var service_path = path.resolve(__dirname, '../services/' + service_name + '.js');

    if (config.services[service_name] === undefined || config.services[service_name] === {}) {
      console.error("Error parsing configuration:");
      console.error("Service %s enabled but no configuration was supplied.", service_name);
      process.exit(1);
    }

    if (fs.existsSync(service_path) === false) {
      console.error("Error parsing configuration:");
      console.error("Service %s is not supported, check for typos.", service_name);
      process.exit(1);
    }

  });

};

// run if standalone
if (require.main === module) {
  module.exports(process.argv);
}
