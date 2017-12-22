import * as React from "react";

export class AstNode extends React.Component<{tsNode: any}, {expanded: boolean, isSelected: boolean}> {
  public toggle = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  constructor(props: any) {
    super(props);

    this.state = {
      expanded: true,
      isSelected: false
    };
  }

  public render(): JSX.Element {
    return <li className={this.getClassName()}>
      <div className="ast-node-header" onClick={this.toggle}>{this.props.tsNode.type}</div>
      {this.state.expanded && <ul className="ast-node-list">
        {this.props.tsNode.children.map((childNode: any) => <AstNode key={childNode.id} tsNode={childNode} />)}
      </ul>}
    </li>;
  }

  private getClassName(): string {
    const classes = ["ast-node"];
    if (this.props.tsNode.children.length !== 0) classes.push("has-children");
    if (this.state.isSelected) classes.push("selected");
    classes.push(this.state.expanded ? "expanded" : "collapsed");

    return classes.join(" ")
  }
}
