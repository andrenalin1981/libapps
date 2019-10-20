// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

window.chrome = window.chrome || {};

/**
 * Mock Event.
 *
 * @extends {Event}
 * @constructor
 */
function MockEvent() {
  /**
   * @private {!Array<?EventListener|function(!Event)>}
   */
  this.listeners_ = [];
}

/** @param {?EventListener|function(!Event)} listener */
MockEvent.prototype.addListener = function(listener) {
  this.listeners_.push(listener);
};

/** @param {?EventListener|function(!Event)} listener */
MockEvent.prototype.removeListener = function(listener) {
  this.listeners_ = this.listeners_.filter((l) => l != listener);
};

/**
 * Dispatch to all listeners async.
 *
 * @param {...*} args
 * @return {!Promise<void>}
 */
MockEvent.prototype.dispatch = function(...args) {
  return new Promise((resolve) => {
    setTimeout(() => {
      for (const l of this.listeners_) {
        l.apply(null, args);
      }
      resolve();
    }, 0);
  });
};

/**
 * Mock for chrome.terminalPrivate.
 * https://cs.chromium.org/chromium/src/chrome/common/extensions/api/terminal_private.json.
 *
 * @private
 * @constructor
 */
function MockTerminalPrivate() {
  /**
   * @private {!Object<string, !Array<function(...*)>>}
   * @const
   */
  this.observers_ = {};
  this.onProcessOutput = new MockEvent();
}

/**
 * Controls the currently installed MockTerminalPrivate.
 *
 * @private
 * @constructor
 */
MockTerminalPrivate.Controller = function() {
  /**
   * @private
   * @const
   */
  this.origTerminalPrivate_ = chrome.terminalPrivate;
  /** @suppress {checkTypes} The mock is not an exact match. */
  chrome.terminalPrivate = this.instance_ = new MockTerminalPrivate();
};

/**
 * Callback will be invoked when chrome.terminalPrivate.<fnName> is called.
 *
 * @param {string} fnName Name of the function to observe.
 * @param {function(...*)} callback Invoked with arguments from function.
 */
MockTerminalPrivate.Controller.prototype.addObserver = function(
    fnName, callback) {
  this.instance_.observers_[fnName] = this.instance_.observers_[fnName] || [];
  this.instance_.observers_[fnName].push(callback);
};

/**
 * Stop the mock.
 */
MockTerminalPrivate.Controller.prototype.stop = function() {
  /** @suppress {duplicate} Reassigning to const chrome.terminalPrivate. */
  chrome.terminalPrivate = this.origTerminalPrivate_;
};

/**
 * Start the mock and install it at chrome.terminalPrivate.
 *
 * @return {!MockTerminalPrivate.Controller}
 */
MockTerminalPrivate.start = function() {
  return new MockTerminalPrivate.Controller();
};

/**
 * Notify all observers that a chrome.terminalPrivate function has been called.
 *
 * @param {string} fnName Name of the function called.
 * @param {!Object=} args arguments function was called with.
 * @private
 */
MockTerminalPrivate.prototype.notifyObservers_ = function(fnName, args) {
  for (const fn of this.observers_[fnName] || []) {
    fn.apply(null, args);
  }
};

/**
 * Starts new process.
 *
 * @param {string} processName Name of the process to open. May be 'crosh' or
 *     'vmshell'.
 * @param {!Array<string>} args Command line arguments to pass to the process.
 * @param {function(string)} callback Returns id of the launched process. If no
 *     process was launched returns -1.
 */
MockTerminalPrivate.prototype.openTerminalProcess = function(
    processName, args, callback) {
  this.notifyObservers_('openTerminalProcess', arguments);
  setTimeout(callback.bind(null, 'test-id'), 0);
};

/**
 * Closes previously opened process.
 *
 * @param {string} id Unique id of the process we want to close.
 * @param {function(boolean)} callback Function that gets called when close
 *     operation is started for the process. Returns success of the function.
 */
MockTerminalPrivate.prototype.closeTerminalProcess = function(id, callback) {
  this.notifyObservers_('closeTerminalProcess', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Sends input that will be routed to stdin of the process with the specified
 * id.
 *
 * @param {string} id The id of the process to which we want to send input.
 * @param {string} input Input we are sending to the process.
 * @param {function(boolean)} callback Callback that will be called when
 *     sendInput method ends. Returns success.
 */
MockTerminalPrivate.prototype.sendInput = function(id, input, callback) {
  this.notifyObservers_('sendInput', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Notify the process with the id id that terminal window size has changed.
 *
 * @param {string} id The id of the process.
 * @param {number} width New window width (as column count).
 * @param {number} height New window height (as row count).
 * @param {function(boolean)} callback Callback that will be called when
 *     onTerminalResize method ends. Returns success.
 */
MockTerminalPrivate.prototype.onTerminalResize = function(
    id, width, height, callback) {
  this.notifyObservers_('onTerminalResize', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Called from |onProcessOutput| when the event is dispatched to terminal
 * extension. Observing the terminal process output will be paused after
 * |onProcessOutput| is dispatched until this method is called.
 *
 * @param {number} tabId Tab ID from |onProcessOutput| event.
 * @param {string} id The id of the process to which |onProcessOutput| was
 *     dispatched.
 */
MockTerminalPrivate.prototype.ackOutput = function(tabId, id) {
  this.notifyObservers_('ackOutput', arguments);
};

/**
 * Mock Window.
 *
 * @extends {Window}
 * @constructor
 */
function MockWindow() {
  /** @type {{hash: string}} */
  this.location = {hash: '#'};

  /** @type {!Object<string, !MockEvent>} */
  this.events = new Proxy({}, {
    get: function(obj, prop) {
      if (!obj.hasOwnProperty(prop)) {
        obj[prop] = new MockEvent();
      }
      return obj[prop];
    }
  });
}

/**
 * Add event listener.  Listeners can be registered and then invoked with:
 *   mockWindow.addEventListener('mytype', listenerFunc);
 *   mockWindow.events['mytype'].dispatch(args);
 *
 * @param {string} type Event type.
 * @param {?EventListener|function(!Event)} listener Listener function.
 * @override
 */
MockWindow.prototype.addEventListener = function(type, listener) {
  this.events[type].addListener(listener);
};

/**
 * Remove event listener.
 *
 * @param {string} type Event type.
 * @param {?EventListener|function(!Event)} listener Listener function.
 * @override
 */
MockWindow.prototype.removeEventListener = function(type, listener) {
  this.events[type].removeListener(listener);
};
