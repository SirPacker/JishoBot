const path = require('path');
const klaw = require('klaw');
const { Client, Collection } = require('discord.js');

const commandsPath = path.join(__dirname, "commands");
const eventsPath = path.join(__dirname, "events");

new class extends Client {
  constructor() {
    super();

    // Load Config
    this.config = require("../config.json");

    // Init Global Vars
    this.commands = new Collection();
    this.events = new Collection();

    // Run Init Functions
    this.init();

    this.login(this.config['discord']['token']);
  }

  init() {
    this._loadCommands();
    this._loadEvents();
  }

  _loadCommands() {
    klaw(commandsPath).on("data", item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      const command = new (require(`${file.dir}/${file.base}`))(this);
      this.commands.set(command.name, command);
    });
  }

  _loadEvents() {
    klaw(eventsPath).on("data", item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      const event = new (require(`${file.dir}/${file.base}`))(this);
      this.events.set(event.name, event);
      console.log(`Loading event: ${event.name}`);
      this.on(event.name, (...args) => event.execute(...args));
    });
  }
};
