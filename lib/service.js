var Service,
    path = require('path');

Service = function(name, global_config, output_directory) { this.init(name, global_config, output_directory); };

Service.prototype = {
  init: function(name, global_config, output_directory) {
    this.name = name;
    this.config = global_config.services[name];
    this.output_directory = output_directory;
    this.directory = path.resolve(output_directory, name);
    //console.debug("Configuration for %s: %s", service_name, global_config);
  },

  execute: function() {
    var service = this._load_service();
    return service(this);
  },

  _load_service: function() {
    var service_path = path.resolve(__dirname, 'services/' + this.name + '.js');
    return require(service_path);
  }
};

module.exports = Service;
