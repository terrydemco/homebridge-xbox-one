var Xbox = require('xbox-on');
var ping = require('ping');

var Smartglass = require('xbox-smartglass-core-node');

var Service, Characteristic;

var deviceStatus = {
    current_app: false,
    connection_status: false,
    client: false
}

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
  
  /*
  deviceStatus.client = Smartglass();
  this.log('before device status')
  deviceStatus.client.connect(config['ipAddress']).then(function(){
    this.log('Xbox succesfully connected!');
    deviceStatus.connection_status = true
}, function(error){
    this.log('Failed to connect to xbox:', error);
});

deviceStatus.client.on('_on_console_status', function(message, xbox, remote, smartglass){
    if(message.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != message.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = message.packet_decoded.protected_payload.apps[0].aum_id
            console.log('xbox: Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));

deviceStatus.client.on('_on_timeout', function(message, xbox, remote, smartglass){
    deviceStatus.connection_status = false
    console.log('Connection timed out.')
    clearInterval(interval)

    deviceStatus.client = Smartglass()
    deviceStatus.client.connect(config['ipAddress']).then(function(){
        console.log('Xbox succesfully connected!');
    }, function(error){
        console.log('Failed to connect to xbox:', result);
    });
}.bind(deviceStatus, interval));

var interval = setInterval(function(){
    console.log('connection_status:', deviceStatus.client._connection_status)
}.bind(deviceStatus), 5000)

Smartglass().discovery().then(function(consoles){
    for(var xbox in consoles){
        console.log('- Device found: ' + consoles[xbox].message.name);
        console.log('  Address: '+ consoles[xbox].remote.address + ':' + consoles[xbox].remote.port);
    }
    if(consoles.length == 0){
        console.log('No consoles found on the network')
    }
}, function(error){
    console.log(error)
});
*/

  
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
            this.log('Shutdown error:', error)
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
