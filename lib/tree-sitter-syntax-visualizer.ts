import {CompositeDisposable} from "atom";
import {RootElement} from "./root-element";

const {Document} = require("tree-sitter");

module.exports = new class TreeSitterSyntaxVisualizer {
  private subscriptions = new CompositeDisposable();
  private rootElement: RootElement;

  public activate(): void {
    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "tree-sitter-syntax-visualizer:toggle": () => this.toggle()
    }));
  }

  public deactivate(): void {
    this.subscriptions.dispose();
  }

  public serialize(): void {}

  public toggle(): void {
    // TODO file bug/PR fixing documentation for `atom.workspace.open()`
    if (!this.rootElement) this.rootElement = new RootElement();

    atom.workspace.toggle(this.rootElement);

    atom.workspace.observeActiveTextEditor(editor => {
      if (editor && editor.getGrammar().name === "C#") {
        const tsDocument = new Document();
        tsDocument.setLanguage(require("tree-sitter-c-sharp"));
        tsDocument.setInputString(editor.getText());
        tsDocument.parse();

        this.rootElement.documentLoaded(tsDocument);
      }
    });
  }
}
