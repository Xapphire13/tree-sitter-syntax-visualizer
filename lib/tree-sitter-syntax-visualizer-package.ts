import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _TreeSitterPanel from "./tree-sitter-panel";
import {CompositeDisposable, Disposable} from "atom";

const {TreeSitterPanel} = require("./tree-sitter-panel.tsx") as (typeof _TreeSitterPanel);

module.exports = new class TreeSitterSyntaxVisualizer {
  public element: HTMLElement;
  public readonly getTitle = () => "tree-sitter";
  public readonly getAllowedLocations = () => ["right", "left"];
  public readonly getURI = () => "atom://tree-sitter";

  private subscriptions = new CompositeDisposable();
  private editorSub: Disposable;

  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("tree-sitter-syntax-visualizer");
    this.render({
      textEditor: undefined
    });
  }

  public activate(): void {
    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "tree-sitter-syntax-visualizer:toggle": () => this.toggle()
    }));
  }

  public deactivate(): void {
    this.subscriptions.dispose();
    this.editorSub && this.editorSub.dispose();
  }

  public serialize(): void {}

  public toggle(): void {
    // TODO file bug/PR fixing documentation for `atom.workspace.open()`
    atom.workspace.toggle(this);

    this.editorSub && this.editorSub.dispose();
    this.editorSub = atom.workspace.observeActiveTextEditor(editor => {
      this.render({textEditor: editor});
    });
  }

  public render(props: _TreeSitterPanel.Props) {
    ReactDOM.render(React.createElement(TreeSitterPanel, props), this.element);
  }
}
