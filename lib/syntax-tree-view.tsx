import * as React from "react";
import * as TreeSitter from "tree-sitter";
import * as _AstNode from "./ast-node";

const {AstNode} = require("./ast-node.tsx") as (typeof _AstNode);

type Props = {
  tsDocument: TreeSitter.Document;
  onNodeSelected(tsNode: TreeSitter.ASTNode): void;
  selectedNode: TreeSitter.ASTNode | null;
};

export class SyntaxTreeView extends React.Component<Props> {
  private nodeMap = new Map<number, _AstNode.AstNode>();

  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.tsDocument !== this.props.tsDocument) {
      this.nodeMap.clear();
    }

    if (nextProps.selectedNode &&
      nextProps.selectedNode !== this.props.selectedNode &&
      !this.nodeMap.has(nextProps.selectedNode.id)) { // Node is hidden in a fold
      let tsNode = this.findChildNode(this.props.tsDocument.rootNode!, nextProps.selectedNode.id)!;
      let visibleAncestor: TreeSitter.ASTNode | null = null;

      while (!visibleAncestor && tsNode.parent) {
        tsNode = tsNode.parent;

        if (this.nodeMap.has(tsNode.id)) {
          visibleAncestor = tsNode;
        }
      }

      if (visibleAncestor && this.nodeMap.has(visibleAncestor.id)) {
        this.nodeMap.get(visibleAncestor.id)!.toggle();
      }
    }
  }

  public render(): JSX.Element {
    return <div className="tree-sitter-syntax-tree">
      <h4>Syntax Tree</h4>
      <ul className="ast-node-list">
        {this.props.tsDocument && <AstNode
          tsNode={this.props.tsDocument.rootNode!}
          onSelected={this.props.onNodeSelected}
          selectedNode={this.props.selectedNode}
          nodeMap={this.nodeMap} />}
      </ul>
    </div>;
  }

  private findChildNode(rootNode: TreeSitter.ASTNode, id: number): TreeSitter.ASTNode | null {
    if (rootNode.id === id) {
      return rootNode;
    }

    for (let child of rootNode.children) {
      const result = this.findChildNode(child, id);

      if (result) {
        return result;
      }
    }

    return null;
  }
}
