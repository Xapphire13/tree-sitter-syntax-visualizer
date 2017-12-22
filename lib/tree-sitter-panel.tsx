import * as React from "react";
import * as _AstNode from "./ast-node";

const {AstNode} = require("./ast-node.tsx") as (typeof _AstNode);

export class TreeSitterPanel extends React.Component<{tsDocument: any}> {
  public render(): JSX.Element {
    return <div className="tree-sitter-panel">
      <ul className="ast-node-list">
        {this.props.tsDocument && <AstNode tsNode={this.props.tsDocument.rootNode} />}
      </ul>
    </div>
  }
}
