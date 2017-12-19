import * as React from "react";

import * as _AstNode from "./ast-node";
const {AstNode} = require("./ast-node.tsx") as (typeof _AstNode);

export class TreeSitterPanel extends React.Component<{tsDocument: any}> {
  public render(): JSX.Element {
    return <div>
      <ul>
        {this.props.tsDocument && this.props.tsDocument.rootNode.children.map(() => <AstNode />)}
      </ul>
    </div>
  }
}
