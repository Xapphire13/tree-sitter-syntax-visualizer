import * as React from "react";
import * as ReactDOM from "react-dom";

import * as _TreeSitterPanel from "./tree-sitter-panel";
const {TreeSitterPanel} = require("./tree-sitter-panel.tsx") as (typeof _TreeSitterPanel);

export class RootElement {
  public element: HTMLElement;

  public readonly getTitle = () => "tree-sitter";
  public readonly getAllowedLocations = () => ["right", "left"];
  public readonly getURI = () => "atom://tree-sitter";

  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("tree-sitter-syntax-visualizer");
    this.render({});
  }

  public render(props: any) {
    ReactDOM.render(React.createElement(TreeSitterPanel, props), this.element);
  }

  public documentLoaded(tsDocument: any): void {
    this.render({
      tsDocument
    });
  }
}
