const CommandRegistry = {
  commands: [],

  register(cmd) {
    this.commands.push(cmd);
  },

  findByName(name) {
    return this.commands.find(cmd =>
      cmd.name === name || (cmd.alias && cmd.alias.includes(name))
    );
  },

  async execute(input) {
    const trimmed = input.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const cmd = this.findByName(cmdName);
    if (!cmd) {
      Terminal.println(`command not found: ${cmdName}`, 'error');
      return;
    }

    try {
      await cmd.handler(args, input);
    } catch (e) {
      Terminal.println(`Error: ${e.message}`, 'error');
    }
  },

  complete(prefix) {
    const lowerPrefix = prefix.toLowerCase();
    const matches = [];

    this.commands.forEach(cmd => {
      if (cmd.name.toLowerCase().startsWith(lowerPrefix)) {
        matches.push(cmd.name);
      }
      if (cmd.alias) {
        cmd.alias.forEach(a => {
          if (a.toLowerCase().startsWith(lowerPrefix) && !matches.includes(a)) {
            matches.push(a);
          }
        });
      }
    });

    return matches.sort();
  },

  list() {
    return [...this.commands];
  }
};
