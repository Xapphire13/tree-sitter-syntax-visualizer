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
      !this.nodeMap.has(nextProps.selectedNode.id)) { // Node is hidden (either toggled off, or in a fold)
      let tsNode = this.findChildNode(this.props.tsDocument.rootNode!, nextProps.selectedNode.id);

      if (tsNode) {
        const findNextNamedAncestor = (tsNode: TreeSitter.ASTNode): TreeSitter.ASTNode | null => {
          let namedAncestor = tsNode.parent;

          while (namedAncestor && !namedAncestor.isNamed) {
            namedAncestor = namedAncestor.parent;
          }

          return namedAncestor;
        };

        if (!this.state.showUnnamedTokens && !tsNode.isNamed) { // Hidden unnamed token
          tsNode = findNextNamedAncestor(tsNode);

          if (tsNode) {
            this.props.onNodeSelected(tsNode);
          }
        } else {
          const nextAncestor = this.state.showUnnamedTokens ?
            (node: TreeSitter.ASTNode) => node.parent:
            findNextNamedAncestor;

          while (tsNode && !this.nodeMap.has(tsNode.id)) { // Find next rendered ancestor
            tsNode = nextAncestor(tsNode);
          }

          if (tsNode) {
            this.nodeMap.get(tsNode.id)!.toggle();
          }
        }
      }
    }
  }

  public render(): JSX.Element {
    return <div className="tree-sitter-syntax-tree">
      <header className="tree-sitter-header">
        <span className="tree-sitter-title">Syntax Tree</span>
      </header>
      <div className="tree-sitter-syntax-tree-content">
        <ul className="ast-node-list">
          {this.props.tsDocument && <AstNode
            tsNode={this.props.tsDocument.rootNode!}
            onSelected={this.props.onNodeSelected}
            selectedNode={this.props.selectedNode}
            nodeMap={this.nodeMap}
            showUnnamedTokens={this.state.showUnnamedTokens} />}
        </ul>
      </div>
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
