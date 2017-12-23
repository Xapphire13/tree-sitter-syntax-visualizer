import * as React from "react";
import * as _SyntaxTreeView from "./syntax-tree-view";
import * as _PropertyView from "./property-view";

const {PropertyView} = require("./property-view.tsx") as (typeof _PropertyView);
const {SyntaxTreeView} = require("./syntax-tree-view.tsx") as (typeof _SyntaxTreeView);

type Props = {
  tsDocument: any;
};

type State = {
  selectedNode: any;
};

export class TreeSitterPanel extends React.Component<Props, State> {
  private onNodeSelected = (tsNode: any): void => {
    this.setState({
      selectedNode: tsNode
    });
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedNode: null
    };
  }

  public render(): JSX.Element {
    return <div className="tree-sitter-panel">
      <SyntaxTreeView tsDocument={this.props.tsDocument} onNodeSelected={this.onNodeSelected} selectedNode={this.state.selectedNode} />
      <PropertyView tsNode={this.state.selectedNode} />
    </div>
  }
}
