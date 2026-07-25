/* Plawe AI */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PlaweAIPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var PlaweAISettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("plawe-ai-settings");
    containerEl.createEl("h2", { text: "Plawe AI" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Dein cleaner KI-Chat f\xFCr Obsidian."
    });
    new import_obsidian.Setting(containerEl).setName("OpenRouter API-Key").setDesc("Bleibt lokal in den Obsidian-Plugin-Daten gespeichert.").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("sk-or-v1-\u2026").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value.trim();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Modell").setDesc("OpenRouter-Modell-ID.").addText((text) => text.setPlaceholder("openai/gpt-4.1-mini").setValue(this.plugin.settings.model).onChange(async (value) => {
      this.plugin.settings.model = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Eigene Anweisung").setDesc("Optional: Wie Plawe AI mit dir sprechen und arbeiten soll.").addTextArea((text) => text.setPlaceholder("Antworte auf Deutsch, klar und locker \u2026").setValue(this.plugin.settings.systemPrompt).onChange(async (value) => {
      this.plugin.settings.systemPrompt = value;
      await this.plugin.saveSettings();
    }));
  }
};

// src/slash-suggest.ts
var import_obsidian2 = require("obsidian");
var PlaweSlashSuggest = class extends import_obsidian2.EditorSuggest {
  constructor(app, openPlaweAI) {
    super(app);
    this.context = null;
    this.openPlaweAI = openPlaweAI;
  }
  onTrigger(cursor, editor) {
    const line = editor.getLine(cursor.line).slice(0, cursor.ch);
    const match = line.match(/(?:^|\s)(\/(?:open(?:\s+plawe(?:\s+ai?)?)?)?)$/i);
    if (!match || !match[1]) return null;
    const query = match[1].slice(1).trim();
    return {
      start: { line: cursor.line, ch: cursor.ch - match[1].length },
      end: cursor,
      query
    };
  }
  getSuggestions(context) {
    const wanted = "open plawe ai";
    return wanted.startsWith(context.query.toLocaleLowerCase()) ? [{ label: wanted }] : [];
  }
  renderSuggestion(item, el) {
    el.addClass("plawe-ai-slash-item");
    el.createDiv({ cls: "plawe-ai-slash-icon", text: "P" });
    const text = el.createDiv();
    text.createDiv({ cls: "plawe-ai-slash-title", text: `/ ${item.label}` });
    text.createDiv({ cls: "plawe-ai-slash-subtitle", text: "Plawe AI \xF6ffnen" });
  }
  selectSuggestion(_item) {
    if (!this.context) return;
    this.context.editor.replaceRange("", this.context.start, this.context.end);
    void this.openPlaweAI();
  }
};

// src/view.ts
var import_obsidian6 = require("obsidian");

// src/file-picker.ts
var import_obsidian3 = require("obsidian");
var SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set(["md", "txt", "csv", "json", "yaml", "yml"]);
var PlaweFilePicker = class extends import_obsidian3.Modal {
  constructor(app, selectedPaths, onDone) {
    super(app);
    this.query = "";
    this.selected = new Set(selectedPaths);
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("plawe-ai-file-modal");
    contentEl.empty();
    const header = contentEl.createDiv({ cls: "plawe-ai-file-modal-header" });
    header.createEl("h2", { text: "Dateien hinzuf\xFCgen" });
    header.createEl("p", { text: "Notizen und Textdateien als Kontext ausw\xE4hlen." });
    const searchWrap = contentEl.createDiv({ cls: "plawe-ai-file-search" });
    const icon = searchWrap.createSpan();
    (0, import_obsidian3.setIcon)(icon, "search");
    const input = searchWrap.createEl("input", {
      type: "search",
      placeholder: "Datei suchen \u2026",
      attr: { "aria-label": "Datei suchen" }
    });
    input.addEventListener("input", () => {
      this.query = input.value.toLocaleLowerCase();
      this.renderList();
    });
    this.listEl = contentEl.createDiv({ cls: "plawe-ai-file-list" });
    this.renderList();
    const footer = contentEl.createDiv({ cls: "plawe-ai-file-modal-footer" });
    const count = footer.createSpan({ cls: "plawe-ai-file-count" });
    const updateCount = () => count.setText(`${this.selected.size} ausgew\xE4hlt`);
    updateCount();
    const done = footer.createEl("button", { cls: "mod-cta", text: "\xDCbernehmen" });
    done.addEventListener("click", () => {
      this.onDone([...this.selected]);
      this.close();
    });
    this.modalEl.addEventListener("plawe-selection-change", updateCount);
    window.setTimeout(() => input.focus(), 50);
  }
  renderList() {
    this.listEl.empty();
    const files = this.app.vault.getFiles().filter((file) => SUPPORTED_EXTENSIONS.has(file.extension.toLocaleLowerCase())).filter((file) => !this.query || file.path.toLocaleLowerCase().includes(this.query)).slice(0, 150);
    if (!files.length) {
      this.listEl.createDiv({ cls: "plawe-ai-file-empty", text: "Keine passende Datei gefunden." });
      return;
    }
    for (const file of files) this.renderFile(file);
  }
  renderFile(file) {
    var _a;
    const row = this.listEl.createEl("button", { cls: "plawe-ai-file-row" });
    const icon = row.createSpan({ cls: "plawe-ai-file-row-icon" });
    (0, import_obsidian3.setIcon)(icon, "file-text");
    const text = row.createSpan({ cls: "plawe-ai-file-row-text" });
    text.createSpan({ cls: "plawe-ai-file-name", text: file.basename });
    text.createSpan({ cls: "plawe-ai-file-path", text: ((_a = file.parent) == null ? void 0 : _a.path) || "/" });
    const check = row.createSpan({ cls: "plawe-ai-file-check" });
    const refresh = () => {
      row.toggleClass("is-selected", this.selected.has(file.path));
      check.empty();
      if (this.selected.has(file.path)) (0, import_obsidian3.setIcon)(check, "check");
    };
    refresh();
    row.addEventListener("click", () => {
      if (this.selected.has(file.path)) this.selected.delete(file.path);
      else this.selected.add(file.path);
      refresh();
      this.modalEl.dispatchEvent(new Event("plawe-selection-change"));
    });
  }
};

// src/provider.ts
var import_obsidian5 = require("obsidian");

// src/tools.ts
var import_obsidian4 = require("obsidian");
var MUTATING_TOOLS = /* @__PURE__ */ new Set([
  "create_note",
  "replace_note",
  "append_note",
  "move_note",
  "create_folder",
  "trash_note"
]);
var TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "list_notes",
      description: "List Markdown notes in the vault. Optionally limit to a folder.",
      parameters: {
        type: "object",
        properties: {
          folder: { type: "string", description: "Folder path, empty for whole vault." },
          limit: { type: "number", description: "Maximum number of results, up to 100." }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_note",
      description: "Read a Markdown note by its vault path.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_vault",
      description: "Search note paths and contents for a text phrase.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", description: "Maximum number of results, up to 30." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Create a new Markdown note. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "replace_note",
      description: "Replace the complete contents of a note. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "append_note",
      description: "Append Markdown to a note. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "move_note",
      description: "Move or rename a note. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" }
        },
        required: ["from", "to"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_folder",
      description: "Create a folder. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trash_note",
      description: "Move a note to the Obsidian trash. Requires user confirmation.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  }
];
function asString(value, key) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`\u201E${key}\u201C fehlt.`);
  return value;
}
function notePath(value, key = "path") {
  let path = (0, import_obsidian4.normalizePath)(asString(value, key));
  if (!path.toLowerCase().endsWith(".md")) path += ".md";
  if (path.startsWith("../") || path === ".md") throw new Error("Ung\xFCltiger Pfad.");
  return path;
}
async function ensureParent(app, path) {
  const parent = path.split("/").slice(0, -1).join("/");
  if (!parent) return;
  const parts = parent.split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
  }
}
function parseArgs(call) {
  try {
    const parsed = JSON.parse(call.function.arguments || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch (e) {
    throw new Error("Die KI hat ung\xFCltige Werkzeugdaten geliefert.");
  }
}
function describeMutation(call) {
  var _a, _b, _c, _d;
  const args = parseArgs(call);
  const labels = {
    create_note: "Notiz erstellen",
    replace_note: "Notiz vollst\xE4ndig bearbeiten",
    append_note: "Notiz erg\xE4nzen",
    move_note: "Notiz verschieben",
    create_folder: "Ordner erstellen",
    trash_note: "Notiz in Papierkorb legen"
  };
  const summary = call.function.name === "move_note" ? `${String((_a = args.from) != null ? _a : "")} \u2192 ${String((_b = args.to) != null ? _b : "")}` : String((_c = args.path) != null ? _c : "");
  return { title: (_d = labels[call.function.name]) != null ? _d : "\xC4nderung", summary, args };
}
async function runReadTool(app, call) {
  const args = parseArgs(call);
  if (call.function.name === "list_notes") {
    const folder = typeof args.folder === "string" ? (0, import_obsidian4.normalizePath)(args.folder) : "";
    const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 100);
    const paths = app.vault.getMarkdownFiles().map((file) => file.path).filter((path) => !folder || path.startsWith(`${folder}/`) || path === folder).slice(0, limit);
    return JSON.stringify({ notes: paths });
  }
  if (call.function.name === "read_note") {
    const path = notePath(args.path);
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian4.TFile)) throw new Error(`Notiz nicht gefunden: ${path}`);
    return await app.vault.cachedRead(file);
  }
  if (call.function.name === "search_vault") {
    const query = asString(args.query, "query").toLocaleLowerCase();
    const limit = Math.min(Math.max(Number(args.limit) || 15, 1), 30);
    const matches = [];
    for (const file of app.vault.getMarkdownFiles()) {
      if (matches.length >= limit) break;
      const content = await app.vault.cachedRead(file);
      const haystack = `${file.path}
${content}`.toLocaleLowerCase();
      const index = haystack.indexOf(query);
      if (index >= 0) {
        const start = Math.max(0, index - 100);
        matches.push({ path: file.path, excerpt: haystack.slice(start, start + 280) });
      }
    }
    return JSON.stringify({ matches });
  }
  throw new Error(`Unbekanntes Lesewerkzeug: ${call.function.name}`);
}
async function runMutation(app, call) {
  const args = parseArgs(call);
  const name = call.function.name;
  if (name === "create_note") {
    const path = notePath(args.path);
    if (app.vault.getAbstractFileByPath(path)) throw new Error(`Existiert bereits: ${path}`);
    await ensureParent(app, path);
    await app.vault.create(path, asString(args.content, "content"));
    return `Erstellt: ${path}`;
  }
  if (name === "replace_note") {
    const path = notePath(args.path);
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian4.TFile)) throw new Error(`Notiz nicht gefunden: ${path}`);
    await app.vault.process(file, () => asString(args.content, "content"));
    return `Bearbeitet: ${path}`;
  }
  if (name === "append_note") {
    const path = notePath(args.path);
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian4.TFile)) throw new Error(`Notiz nicht gefunden: ${path}`);
    const addition = asString(args.content, "content");
    await app.vault.process(file, (current) => `${current}${current.endsWith("\n") ? "" : "\n"}${addition}`);
    return `Erg\xE4nzt: ${path}`;
  }
  if (name === "move_note") {
    const from = notePath(args.from, "from");
    const to = notePath(args.to, "to");
    const file = app.vault.getAbstractFileByPath(from);
    if (!(file instanceof import_obsidian4.TFile)) throw new Error(`Notiz nicht gefunden: ${from}`);
    if (app.vault.getAbstractFileByPath(to)) throw new Error(`Ziel existiert bereits: ${to}`);
    await ensureParent(app, to);
    await app.fileManager.renameFile(file, to);
    return `Verschoben: ${from} \u2192 ${to}`;
  }
  if (name === "create_folder") {
    const path = (0, import_obsidian4.normalizePath)(asString(args.path, "path"));
    if (app.vault.getAbstractFileByPath(path)) throw new Error(`Existiert bereits: ${path}`);
    await app.vault.createFolder(path);
    return `Ordner erstellt: ${path}`;
  }
  if (name === "trash_note") {
    const path = notePath(args.path);
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian4.TFile)) throw new Error(`Notiz nicht gefunden: ${path}`);
    await app.fileManager.trashFile(file);
    return `In Papierkorb gelegt: ${path}`;
  }
  throw new Error(`Unbekannte \xC4nderung: ${name}`);
}

// src/provider.ts
async function requestAI(settings, messages) {
  var _a, _b, _c;
  if (!settings.apiKey.trim()) throw new Error("Bitte zuerst deinen OpenRouter API-Key in den Plawe-AI-Einstellungen eintragen.");
  const response = await (0, import_obsidian5.requestUrl)({
    url: settings.endpoint,
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://obsidian.md",
      "X-Title": "Plawe AI"
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
      temperature: 0.35
    }),
    throw: false
  });
  const body = response.json;
  if (response.status < 200 || response.status >= 300) {
    throw new Error(((_a = body.error) == null ? void 0 : _a.message) || `OpenRouter-Fehler ${response.status}`);
  }
  const message = (_c = (_b = body.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message;
  if (!message) throw new Error("Die KI hat keine Antwort geliefert.");
  return message;
}

// src/view.ts
var PLAWE_AI_VIEW = "plawe-ai-chat";
var PlaweAIView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.messages = [];
    this.contextFile = null;
    this.attachedPaths = [];
    this.busy = false;
    this.pending = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  getViewType() {
    return PLAWE_AI_VIEW;
  }
  getDisplayText() {
    return "Plawe AI";
  }
  getIcon() {
    return "sparkles";
  }
  async onOpen() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("plawe-ai-view");
    const header = root.createDiv({ cls: "plawe-ai-header" });
    const brand = header.createDiv({ cls: "plawe-ai-brand" });
    brand.createDiv({ cls: "plawe-ai-logo", text: "P" });
    const brandText = brand.createDiv();
    brandText.createDiv({ cls: "plawe-ai-title", text: "Plawe AI" });
    brandText.createDiv({ cls: "plawe-ai-status", text: "Bereit f\xFCr dein Vault" });
    const reset = header.createEl("button", {
      cls: "plawe-ai-icon-button clickable-icon",
      attr: { "aria-label": "Neuen Chat starten" }
    });
    (0, import_obsidian6.setIcon)(reset, "square-pen");
    reset.addEventListener("click", () => this.resetChat());
    this.chatEl = root.createDiv({ cls: "plawe-ai-chat" });
    await this.restoreHistory();
    const composer = root.createDiv({ cls: "plawe-ai-composer-wrap" });
    const contextRow = composer.createDiv({ cls: "plawe-ai-context-row" });
    const addButton = contextRow.createEl("button", { cls: "plawe-ai-context-button" });
    const addIcon = addButton.createSpan();
    (0, import_obsidian6.setIcon)(addIcon, "plus");
    addButton.createSpan({ text: "Dateien" });
    addButton.addEventListener("click", () => this.openFilePicker());
    const contextButton = contextRow.createEl("button", { cls: "plawe-ai-context-button" });
    const contextIcon = contextButton.createSpan();
    (0, import_obsidian6.setIcon)(contextIcon, "file-text");
    contextButton.createSpan({ text: "Aktuelle Notiz" });
    contextButton.addEventListener("click", () => this.toggleCurrentNote(contextButton));
    this.attachmentsEl = composer.createDiv({ cls: "plawe-ai-attachments" });
    this.renderAttachments();
    const composerBox = composer.createDiv({ cls: "plawe-ai-composer" });
    this.inputEl = composerBox.createEl("textarea", {
      cls: "plawe-ai-input",
      attr: {
        placeholder: "Frag Plawe AI \u2026",
        rows: "1",
        "aria-label": "Nachricht an Plawe AI"
      }
    });
    this.inputEl.addEventListener("input", () => this.resizeInput());
    this.inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        void this.send();
      }
    });
    this.sendButton = composerBox.createEl("button", {
      cls: "plawe-ai-send",
      attr: { "aria-label": "Senden" }
    });
    (0, import_obsidian6.setIcon)(this.sendButton, "arrow-up");
    this.sendButton.addEventListener("click", () => void this.send());
  }
  focusInput() {
    window.setTimeout(() => {
      var _a;
      return (_a = this.inputEl) == null ? void 0 : _a.focus();
    }, 60);
  }
  renderWelcome() {
    const welcome = this.chatEl.createDiv({ cls: "plawe-ai-welcome" });
    welcome.createEl("h2", { text: "Plawe AI" });
  }
  resetChat() {
    if (this.busy) return;
    this.messages = [];
    this.pending.clear();
    this.chatEl.empty();
    this.renderWelcome();
    void this.persistHistory();
    this.focusInput();
  }
  toggleCurrentNote(button) {
    var _a, _b;
    if (this.contextFile) {
      this.contextFile = null;
      button.removeClass("is-active");
      (_a = button.querySelector("span:last-child")) == null ? void 0 : _a.replaceChildren("Aktuelle Notiz");
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian6.Notice("\xD6ffne zuerst eine Notiz.");
      return;
    }
    this.contextFile = file;
    button.addClass("is-active");
    (_b = button.querySelector("span:last-child")) == null ? void 0 : _b.replaceChildren(file.basename);
  }
  resizeInput() {
    this.inputEl.style.height = "auto";
    this.inputEl.style.height = `${Math.min(this.inputEl.scrollHeight, 160)}px`;
  }
  async send() {
    var _a;
    const text = this.inputEl.value.trim();
    if (!text || this.busy) return;
    this.inputEl.value = "";
    this.resizeInput();
    (_a = this.chatEl.querySelector(".plawe-ai-welcome")) == null ? void 0 : _a.remove();
    this.addUserBubble(text);
    let content = text;
    if (this.contextFile) {
      const note = await this.app.vault.cachedRead(this.contextFile);
      content += `

<current_note path="${this.contextFile.path}">
${note}
</current_note>`;
    }
    for (const path of this.attachedPaths) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof import_obsidian6.TFile)) continue;
      if (file.stat.size > 5e5) {
        new import_obsidian6.Notice(`${file.name} ist f\xFCr den Chat zu gro\xDF.`);
        continue;
      }
      const fileContent = await this.app.vault.cachedRead(file);
      content += `

<attached_file path="${file.path}">
${fileContent}
</attached_file>`;
    }
    this.messages.push({ role: "user", content, displayContent: text });
    await this.persistHistory();
    await this.continueConversation();
  }
  async continueConversation() {
    var _a;
    this.setBusy(true);
    const typing = this.addTyping();
    try {
      for (let round = 0; round < this.plugin.settings.maxToolRounds; round++) {
        const answer = await requestAI(this.plugin.settings, this.withSystemMessage());
        this.messages.push(answer);
        const calls = (_a = answer.tool_calls) != null ? _a : [];
        if (!calls.length) {
          typing.remove();
          this.chatEl.querySelectorAll(".plawe-ai-error").forEach((el) => el.remove());
          await this.addAssistantBubble(answer.content || "Erledigt.");
          await this.persistHistory();
          return;
        }
        const mutations = calls.filter((call) => MUTATING_TOOLS.has(call.function.name));
        const reads = calls.filter((call) => !MUTATING_TOOLS.has(call.function.name));
        for (const call of reads) {
          try {
            const result = await runReadTool(this.app, call);
            this.messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: result });
          } catch (error) {
            this.messages.push({
              role: "tool",
              tool_call_id: call.id,
              name: call.function.name,
              content: `Fehler: ${this.errorText(error)}`
            });
          }
        }
        if (mutations.length) {
          typing.remove();
          for (const call of mutations) this.addPendingAction(call);
          return;
        }
      }
      typing.remove();
      await this.addAssistantBubble("Ich habe zu viele Arbeitsschritte gebraucht. Teil die Aufgabe bitte kurz auf.");
    } catch (error) {
      typing.remove();
      this.addError(this.errorText(error));
    } finally {
      this.setBusy(false);
    }
  }
  withSystemMessage() {
    const system = [
      "Du bist Plawe AI, ein klarer, freundlicher und handlungsf\xE4higer Assistent direkt in Obsidian.",
      "Antworte standardm\xE4\xDFig auf Deutsch. Sei pr\xE4zise und nicht \xFCberladen.",
      "Nutze Werkzeuge selbstst\xE4ndig, wenn sie zur Aufgabe passen.",
      "Behaupte niemals, eine Vault-Aktion ausgef\xFChrt zu haben, bevor das Werkzeug erfolgreich war.",
      "Bei \xC4nderungen sind die Werkzeugaufrufe nur Vorschl\xE4ge; die Oberfl\xE4che holt die Best\xE4tigung ein.",
      this.plugin.settings.systemPrompt
    ].filter(Boolean).join("\n");
    return [{ role: "system", content: system }, ...this.messages];
  }
  addUserBubble(text) {
    const row = this.chatEl.createDiv({ cls: "plawe-ai-message-row is-user" });
    row.createDiv({ cls: "plawe-ai-message is-user", text });
    this.scrollDown();
  }
  async addAssistantBubble(text) {
    const row = this.chatEl.createDiv({ cls: "plawe-ai-message-row is-assistant" });
    row.createDiv({ cls: "plawe-ai-avatar", text: "P" });
    const bubble = row.createDiv({ cls: "plawe-ai-message is-assistant markdown-rendered" });
    await import_obsidian6.MarkdownRenderer.render(this.app, text, bubble, "", this);
    this.scrollDown();
  }
  addTyping() {
    const row = this.chatEl.createDiv({ cls: "plawe-ai-message-row is-assistant" });
    row.createDiv({ cls: "plawe-ai-avatar", text: "P" });
    const typing = row.createDiv({ cls: "plawe-ai-typing" });
    typing.createSpan();
    typing.createSpan();
    typing.createSpan();
    this.scrollDown();
    return row;
  }
  addPendingAction(call) {
    const description = describeMutation(call);
    const action = { call, ...description };
    this.pending.set(call.id, action);
    const card = this.chatEl.createDiv({ cls: "plawe-ai-action" });
    const head = card.createDiv({ cls: "plawe-ai-action-head" });
    const icon = head.createDiv({ cls: "plawe-ai-action-icon" });
    (0, import_obsidian6.setIcon)(icon, "file-pen-line");
    const text = head.createDiv();
    text.createDiv({ cls: "plawe-ai-action-title", text: action.title });
    text.createDiv({ cls: "plawe-ai-action-summary", text: action.summary });
    void this.renderActionPreview(card, action);
    const buttons = card.createDiv({ cls: "plawe-ai-action-buttons" });
    const reject = buttons.createEl("button", { text: "Ablehnen" });
    const approve = buttons.createEl("button", { cls: "mod-cta", text: "Ausf\xFChren" });
    reject.addEventListener("click", () => void this.resolveAction(action, card, false));
    approve.addEventListener("click", () => void this.resolveAction(action, card, true));
    this.scrollDown();
  }
  async resolveAction(action, card, approved) {
    var _a;
    if (!this.pending.has(action.call.id)) return;
    this.pending.delete(action.call.id);
    card.addClass("is-resolved");
    (_a = card.querySelector(".plawe-ai-action-buttons")) == null ? void 0 : _a.remove();
    try {
      const result = approved ? await runMutation(this.app, action.call) : "Vom Nutzer abgelehnt.";
      card.createDiv({
        cls: `plawe-ai-action-result ${approved ? "is-success" : ""}`,
        text: approved ? `\u2713 ${result}` : "Nicht ausgef\xFChrt"
      });
      if (approved) {
        const targetPath = typeof action.args.path === "string" ? action.args.path : typeof action.args.to === "string" ? action.args.to : "";
        const target = targetPath ? this.app.vault.getAbstractFileByPath(
          targetPath.toLocaleLowerCase().endsWith(".md") ? targetPath : `${targetPath}.md`
        ) : null;
        if (target instanceof import_obsidian6.TFile) {
          const openButton = card.createEl("button", { cls: "plawe-ai-open-note", text: "Notiz \xF6ffnen" });
          openButton.addEventListener("click", () => void this.app.workspace.getLeaf(false).openFile(target));
        }
      }
      this.messages.push({
        role: "tool",
        tool_call_id: action.call.id,
        name: action.call.function.name,
        content: result
      });
      await this.persistHistory();
    } catch (error) {
      const message = `Fehler: ${this.errorText(error)}`;
      card.createDiv({ cls: "plawe-ai-action-result is-error", text: message });
      this.messages.push({
        role: "tool",
        tool_call_id: action.call.id,
        name: action.call.function.name,
        content: message
      });
    }
    if (this.pending.size === 0) await this.continueConversation();
  }
  addError(text) {
    this.chatEl.querySelectorAll(".plawe-ai-error").forEach((el) => el.remove());
    const error = this.chatEl.createDiv({ cls: "plawe-ai-error" });
    error.createDiv({ text });
    const settings = error.createEl("button", { text: "Einstellungen \xF6ffnen" });
    settings.addEventListener("click", () => {
      const appWithSettings = this.app;
      appWithSettings.setting.open();
      appWithSettings.setting.openTabById(this.plugin.manifest.id);
    });
    this.scrollDown();
  }
  setBusy(value) {
    this.busy = value;
    this.sendButton.disabled = value;
    this.inputEl.disabled = value;
  }
  scrollDown() {
    window.setTimeout(() => this.chatEl.scrollTo({ top: this.chatEl.scrollHeight, behavior: "smooth" }), 20);
  }
  errorText(error) {
    return error instanceof Error ? error.message : String(error);
  }
  openFilePicker() {
    new PlaweFilePicker(this.app, this.attachedPaths, (paths) => {
      this.attachedPaths = paths;
      this.renderAttachments();
    }).open();
  }
  renderAttachments() {
    if (!this.attachmentsEl) return;
    this.attachmentsEl.empty();
    this.attachmentsEl.toggleClass("is-empty", this.attachedPaths.length === 0);
    for (const path of this.attachedPaths) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof import_obsidian6.TFile)) continue;
      const chip = this.attachmentsEl.createDiv({ cls: "plawe-ai-attachment-chip" });
      const icon = chip.createSpan();
      (0, import_obsidian6.setIcon)(icon, "file-text");
      chip.createSpan({ cls: "plawe-ai-attachment-name", text: file.basename });
      const remove = chip.createEl("button", { attr: { "aria-label": `${file.basename} entfernen` } });
      (0, import_obsidian6.setIcon)(remove, "x");
      remove.addEventListener("click", () => {
        this.attachedPaths = this.attachedPaths.filter((item) => item !== path);
        this.renderAttachments();
      });
    }
  }
  async restoreHistory() {
    var _a;
    this.messages = ((_a = this.plugin.settings.chatHistory) != null ? _a : []).slice(-60);
    const visible = this.messages.filter(
      (message) => {
        var _a2;
        return (message.role === "user" || message.role === "assistant") && message.content && !((_a2 = message.tool_calls) == null ? void 0 : _a2.length);
      }
    );
    if (!visible.length) {
      this.renderWelcome();
      return;
    }
    for (const message of visible) {
      if (message.role === "user") this.addUserBubble(message.displayContent || message.content || "");
      else await this.addAssistantBubble(message.content || "");
    }
  }
  async persistHistory() {
    this.plugin.settings.chatHistory = this.messages.slice(-60);
    await this.plugin.saveSettings();
  }
  async renderActionPreview(card, action) {
    const content = typeof action.args.content === "string" ? action.args.content : "";
    if (!content) return;
    const path = typeof action.args.path === "string" ? action.args.path : "";
    const existing = path ? this.app.vault.getAbstractFileByPath(path) : null;
    const before = existing instanceof import_obsidian6.TFile ? await this.app.vault.cachedRead(existing) : "";
    const preview = card.createDiv({ cls: "plawe-ai-change-preview" });
    if (before) {
      const oldBlock = preview.createDiv({ cls: "plawe-ai-change-block is-before" });
      oldBlock.createDiv({ cls: "plawe-ai-change-label", text: "Vorher" });
      oldBlock.createEl("pre", { text: before.slice(0, 1200) });
    }
    const afterBlock = preview.createDiv({ cls: "plawe-ai-change-block is-after" });
    afterBlock.createDiv({ cls: "plawe-ai-change-label", text: before ? "Nachher" : "Inhalt" });
    const after = action.call.function.name === "append_note" && before ? `${before}${before.endsWith("\n") ? "" : "\n"}${content}` : content;
    afterBlock.createEl("pre", { text: after.slice(0, 1200) });
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "openai/gpt-4.1-mini",
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  systemPrompt: "",
  maxToolRounds: 8,
  chatHistory: []
};
var PlaweAIPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerView(PLAWE_AI_VIEW, (leaf) => new PlaweAIView(leaf, this));
    this.addCommand({
      id: "open-plawe-ai",
      name: "Open Plawe AI",
      callback: () => void this.activateView()
    });
    this.addRibbonIcon("sparkles", "Plawe AI \xF6ffnen", () => void this.activateView());
    this.addSettingTab(new PlaweAISettingTab(this.app, this));
    this.registerEditorSuggest(new PlaweSlashSuggest(this.app, () => this.activateView()));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(PLAWE_AI_VIEW);
  }
  async activateView() {
    var _a;
    let leaf = (_a = this.app.workspace.getLeavesOfType(PLAWE_AI_VIEW)[0]) != null ? _a : null;
    if (!leaf) {
      leaf = import_obsidian7.Platform.isMobile ? this.app.workspace.getLeaf("tab") : this.app.workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: PLAWE_AI_VIEW, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
    const view = leaf.view;
    if (view instanceof PlaweAIView) view.focusInput();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
