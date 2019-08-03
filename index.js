var Xbox = require('xbox-on');
var ping = require('ping');

var Smartglass = require('xbox-smartglass-core-node');

var Service, Characteristic;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-xbox-one", "Xbox", XboxAccessory);
}

function XboxAccessory(log, config) {
  this.log = log;
  this.name = config['name'] || 'Xbox';
  this.config = config;
  this.xbox = new Xbox(config['ipAddress'], config['liveId']);
  this.tries = config['tries'] || 5;
  this.tryInterval = config['tryInterval'] || 1000;
}

XboxAccessory.prototype = {

  setPowerState: function(powerOn, callback) {
    var self = this;
    this.log("Sending " + powerOn + " command to '" + this.name + "'...");

    if (powerOn === true) {
      // Queue tries times at tryInterval
      for (var i = 0; i < this.tries; i++) {
        setTimeout(function () {
          self.xbox.powerOn();
        }, i * this.tryInterval);
      }
    } else {
      var sgClient = Smartglass()

      sgClient.connect(this.config['ipAddress']).then(function(){
        console.log('Xbox succesfully connected!');

        setTimeout(function(){
          sgClient.powerOff().then(function(status){
            console.log('Shutdown success!')
          }, function(error){
            console.log('Shutdown error:', error)
          })
        }.bind(sgClient), 1000)
      }, function(error){
        console.log(error)
      });
    }




    // Don't really care about powerOn errors, and don't want more than one callback
    callback();
  },

  getPowerState: function(callback) {
    ping.sys.probe(this.xbox.ip, function(isAlive){
      callback(null, isAlive);
    });
  },

  identify: function(callback) {
    this.log("Identify...");
    callback();
  },

  getServices: function() {
    var switchService = new Service.Switch(this.name);

    switchService
      .getCharacteristic(Characteristic.On)
      .on('set', this.setPowerState.bind(this));

    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerState.bind(this));

    return [switchService];
  }
};
