import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TreeSitter from "tree-sitter";
import * as _TreeSitterPanel from "./tree-sitter-panel";
import {CompositeDisposable} from "atom";

const {TreeSitterPanel} = require("./tree-sitter-panel.tsx") as (typeof _TreeSitterPanel);

module.exports = new class TreeSitterSyntaxVisualizer {
  public element: HTMLElement;
  public readonly getTitle = () => "tree-sitter";
  public readonly getAllowedLocations = () => ["right", "left"];
  public readonly getURI = () => "atom://tree-sitter";

  private subscriptions = new CompositeDisposable();

  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("tree-sitter-syntax-visualizer");
    this.render({});
  }

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
    atom.workspace.toggle(this);

    atom.workspace.observeActiveTextEditor(editor => {
      if (editor && editor.getGrammar().name === "C#") {
        const tsDocument = new TreeSitter.Document();
        tsDocument.setLanguage(require("tree-sitter-c-sharp"));
        tsDocument.setInputString(editor.getText());
        tsDocument.parse();

        this.render({tsDocument});
      }
    });
  }

  public render(props: any) {
    ReactDOM.render(React.createElement(TreeSitterPanel, props), this.element);
  }
}
