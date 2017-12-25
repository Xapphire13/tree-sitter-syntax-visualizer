import * as React from "react";
import * as TreeSitter from "tree-sitter";
import * as _AstNode from "./ast-node";

const {AstNode} = require("./ast-node.tsx") as (typeof _AstNode);

type Props = {
  tsDocument: TreeSitter.Document;
  onNodeSelected(tsNode: TreeSitter.AstNode): void;
  selectedNode: TreeSitter.AstNode | null;
};

export class SyntaxTreeView extends React.Component<Props> {
  public render(): JSX.Element {
    return <div className="tree-sitter-syntax-tree">
      <h4>Syntax Tree</h4>
      <ul className="ast-node-list">
        {this.props.tsDocument && <AstNode
          tsNode={this.props.tsDocument.rootNode!}
          onSelected={this.props.onNodeSelected}
          selectedNode={this.props.selectedNode} />}
      </ul>
    </div>;
  }
}
