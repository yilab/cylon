/*
 * Linux IO DigitalPin
 * cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/


(function() {
  'use strict';
  var EventEmitter, FS, namespace,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FS = require('fs');

  EventEmitter = require('events').EventEmitter;

  namespace = require('node-namespace');

  namespace('Cylon.IO', function() {
    return this.DigitalPin = (function(_super) {
      var GPIO_DIRECTION_READ, GPIO_DIRECTION_WRITE, GPIO_PATH, HIGH, LOW;

      __extends(DigitalPin, _super);

      GPIO_PATH = "/sys/class/gpio";

      GPIO_DIRECTION_READ = "in";

      GPIO_DIRECTION_WRITE = "out";

      HIGH = 1;

      LOW = 0;

      function DigitalPin(opts) {
        this.self = this;
        this.pinNum = opts.pin;
        this.status = 'low';
        this.ready = false;
        this.mode = opts.mode;
      }

      DigitalPin.prototype.connect = function(mode) {
        var _this = this;
        if (mode == null) {
          mode = null;
        }
        if (this.mode == null) {
          this.mode = mode;
        }
        return FS.writeFile("" + GPIO_PATH + "/export", "" + this.pinNum, function(err) {
          if (err) {
            return _this.self.emit('error', 'Error while creating pin files');
          } else {
            _this.self._setMode(_this.mode, true);
            return _this.self.emit('open');
          }
        });
      };

      DigitalPin.prototype.close = function() {
        var _this = this;
        return FS.writeFile("" + GPIO_PATH + "/unexport", "" + this.pinNum, function(err) {
          if (err) {
            return _this.self.emit('error', 'Error while closing pin files');
          } else {
            return _this.self.emit('close');
          }
        });
      };

      DigitalPin.prototype.digitalWrite = function(value) {
        var _this = this;
        if (this.mode !== 'w') {
          this.self._setMode('w');
        }
        this.status = value === 1 ? 'high' : 'low';
        return FS.writeFile(this.pinFile, value, function(err) {
          if (err) {
            return _this.self.emit('error', "Error occurred while writing value " + value + " to pin " + _this.pinNum);
          } else {
            return _this.self.emit('digitalWrite', value);
          }
        });
      };

      DigitalPin.prototype.digitalRead = function(interval) {
        var readData,
          _this = this;
        if (this.mode !== 'r') {
          this.self._setMode('r');
        }
        readData = null;
        return setInterval(function() {
          return FS.readFile(_this.pinFile, function(err, data) {
            if (err) {
              return _this.self.emit('error', "Error occurred while reading from pin " + _this.pinNum);
            } else {
              readData = data;
              return _this.self.emit('digitalRead', data);
            }
          });
        }, interval);
      };

      DigitalPin.prototype._setMode = function(mode, emitConnect) {
        var _this = this;
        if (emitConnect == null) {
          emitConnect = false;
        }
        if (mode === 'w') {
          return FS.writeFile("" + GPIO_PATH + "/gpio" + this.pinNum + "/direction", GPIO_DIRECTION_WRITE, function(err) {
            if (err) {
              return _this.self.emit('error', "Setting up pin direction failed");
            } else {
              _this.pinFile = "" + GPIO_PATH + "/gpio" + _this.pinNum + "/value";
              _this.ready = true;
              if (emitConnect) {
                return _this.self.emit('connect', mode);
              }
            }
          });
        } else if (mode === 'r') {
          return FS.writeFile("" + GPIO_PATH + "/gpio" + this.pinNum + "/direction", GPIO_DIRECTION_READ, function(err) {
            if (err) {
              return _this.self.emit('error', "Setting up pin direction failed");
            } else {
              _this.pinFile = "" + GPIO_PATH + "/gpio" + _this.pinNum + "/value";
              _this.ready = true;
              if (emitConnect) {
                return _this.self.emit('connect', mode);
              }
            }
          });
        }
      };

      DigitalPin.prototype.setHigh = function() {
        return this.self.digitalWrite(1);
      };

      DigitalPin.prototype.setLow = function() {
        return this.self.digitalWrite(0);
      };

      DigitalPin.prototype.toggle = function() {
        if (this.status === 'low') {
          return this.self.setHigh();
        } else {
          return this.self.setLow();
        }
      };

      return DigitalPin;

    })(EventEmitter);
  });

}).call(this);
