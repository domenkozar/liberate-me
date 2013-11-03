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
  output_directory = path.resolve(process.cwd(), args[1]);

  
  // create output directory if it doesn't exist
  mkdirp.sync(output_directory, console.error);
  
  //console.debug("Output directory: %s", output_directory);
  module.exports.launch_services(config, output_directory);
  
};

module.exports.launch_services = function launch_services(config, output_directory) {
  if (config.enabled instanceof Array === false || config.enabled.length === 0) {
    console.error("No services are enabled, specify 'enabled' property with a list of services in the config file.");
    process.exit(1);
  }

  async.each(config.enabled, function(service_name) {
    var service_path = '../services/' + service_name + '.js',
        service_directory = path.resolve(output_directory, service_name),
        service,
        service_config;

    if (fs.existsSync(service_path) === false) {
      console.error("Error: No such service %s.", path.basename(service_path));
      process.exit(1);
    } else {
      service = require(service_path);
    }

    if (config.enabled instanceof Array === false || config.enabled.length === 0) {
    } else {
      service_config = config.services[service_name]; 
    }

    //console.debug("Configuration for %s: %s", service_name, config);

    console.info("Fetching data from %s", service_name);
    mkdirp.sync(service_directory, console.error);
    service(service_config, service_directory);
  });
};

module.exports.validate_config = function validate_config(config) {
  var schema = {
    "type": "object",
    "properties": {
        "enabled": { 
          "type": "array",
          "uniqueItems": true,
          "items": { "enum": [ "trello", "trello2" ] },
          // TODO: keys should exist as real services and have config in "services"
        },
        "services": {
          "type": "object"
        }
    },
    "additionalProperties": false,
    "required": [ "enabled", "services" ]
  };
  
  var result = tv4.validateResult(config, schema);
  
  if (result.valid === false) {
    console.log(result);
  }
};

// run if standalone
if (require.main === module) {
  module.exports(process.argv);
}
