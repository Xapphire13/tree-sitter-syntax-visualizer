import * as React from "react";
import * as TreeSitter from "tree-sitter";
import * as _AstNode from "./ast-node";

const {AstNode} = require("./ast-node.tsx") as (typeof _AstNode);

type Props = {
  tsDocument: TreeSitter.Document;
  onNodeSelected(tsNode: TreeSitter.ASTNode): void;
  selectedNode: TreeSitter.ASTNode | null;
};

type State = {
  showUnnamedTokens: boolean;
}

const CONFIG_PATHS = {
  showUnnamedTokens: "tree-sitter-syntax-visualizer.showUnnamedTokens"
};

export class SyntaxTreeView extends React.Component<Props, State> {
  private nodeMap = new Map<number, _AstNode.AstNode>();

  constructor(props: Props) {
    super(props);

    this.state = {
      showUnnamedTokens: atom.config.get(CONFIG_PATHS.showUnnamedTokens)
    };
  }

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
      <header className="tree-sitter-header">
        <span className="tree-sitter-title">Syntax Tree</span>
      </header>
      <ul className="ast-node-list root-ast-node">
        {this.props.tsDocument && <AstNode
          tsNode={this.props.tsDocument.rootNode!}
          onSelected={this.props.onNodeSelected}
          selectedNode={this.props.selectedNode}
          nodeMap={this.nodeMap}
          showUnnamedTokens={this.state.showUnnamedTokens} />}
      </ul>
      <footer className="tree-sitter-footer tree-sitter-syntax-tree-options">
        <label className="input-label">
          <input
            className="input-checkbox"
            type="checkbox"
            onChange={event => this.setShowUnnamedTokens(event.target.checked)}
            checked={this.state.showUnnamedTokens} />
          Show unnamed tokens
        </label>
      </footer>
    </div>;
  }

  private setShowUnnamedTokens(value: boolean): void {
    atom.config.set(CONFIG_PATHS.showUnnamedTokens, value);
    this.setState({
      showUnnamedTokens: value
    });
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
