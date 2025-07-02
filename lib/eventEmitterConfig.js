// Increase the default max listeners to prevent MaxListenersExceededWarning
const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 20; // Increased from default 10

// console.log("Increased EventEmitter.defaultMaxListeners to 15");
