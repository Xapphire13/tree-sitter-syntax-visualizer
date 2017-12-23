import * as React from "react";

type Props = {
  tsNode: any;
  onSelected(tsNode: any): void;
  selectedNode: any;
};

type State = {
  expanded: boolean;
};

export class AstNode extends React.Component<Props, State> {
  private toggle = (): void => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  private onClick = (): void => {
    this.props.onSelected(this.props.tsNode);
  };

  constructor(props: Props) {
    super(props);

    this.state = { expanded: true };
  }

  public render(): JSX.Element {
    return <li className={this.getClassName()}>
      {this.props.tsNode.children.length > 0 && <div className="ast-node-toggle" onClick={this.toggle}></div>}
      <div className="ast-node-header" onClick={this.onClick}>{this.props.tsNode.type}</div>
      {this.state.expanded && <ul className="ast-node-list">
        {this.props.tsNode.children.map((childNode: any) => <AstNode
            key={childNode.id}
            tsNode={childNode}
            onSelected={this.props.onSelected}
            selectedNode={this.props.selectedNode} />)}
      </ul>}
    </li>;
  }

  private getClassName(): string {
    const classes = ["ast-node"];
    if (this.props.tsNode.children.length !== 0) classes.push("has-children");
    if (this.props.selectedNode && this.props.selectedNode.id === this.props.tsNode.id) classes.push("selected");
    classes.push(this.state.expanded ? "expanded" : "collapsed");

    return classes.join(" ")
  }
}
