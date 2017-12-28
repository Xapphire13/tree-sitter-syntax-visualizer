import * as React from "react";
import * as TreeSitter from "tree-sitter";

type Props = {
  tsNode: TreeSitter.ASTNode;
  onSelected(tsNode: TreeSitter.ASTNode): void;
  selectedNode: TreeSitter.ASTNode | null;
  nodeMap: Map<number, AstNode>;
};

type State = {
  expanded: boolean;
};

export class AstNode extends React.Component<Props, State> {
  public toggle = (): void => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  private element: HTMLElement;
  private onClick = (): void => {
    this.props.onSelected(this.props.tsNode);
  };

  constructor(props: Props) {
    super(props);

    this.state = { expanded: true };
    this.props.nodeMap.set(this.props.tsNode.id, this);
  }

  public componentWillUnmount(): void {
    this.props.nodeMap.delete(this.props.tsNode.id);
  }

  public render(): JSX.Element {
    return <li className={this.getClassName()} ref={element => element && (this.element = element)}>
      {this.props.tsNode.children.length > 0 && <div className="ast-node-toggle" onClick={this.toggle}></div>}
      <div className="ast-node-header" onClick={this.onClick}>{this.props.tsNode.type}</div>
      {this.state.expanded && <ul className="ast-node-list">
        {this.props.tsNode.children.map(childNode => <AstNode
            key={childNode.id}
            tsNode={childNode}
            onSelected={this.props.onSelected}
            selectedNode={this.props.selectedNode}
            nodeMap={this.props.nodeMap} />)}
      </ul>}
    </li>;
  }

  public scrollIntoView(): void {
    if (this.element && !this.isInView()) {
      this.element.scrollIntoView();
    }
  }

  private getClassName(): string {
    const classes = ["ast-node"];
    if (this.props.tsNode.children.length !== 0) classes.push("has-children");
    if (this.isSelected()) classes.push("selected");
    classes.push(this.state.expanded ? "expanded" : "collapsed");

    return classes.join(" ")
  }

  private isSelected(): boolean {
    return this.props.selectedNode ? this.props.selectedNode.id === this.props.tsNode.id : false;
  }

  private isInView(): boolean {
    const thisBounds = this.element.getBoundingClientRect();
    const syntaxViewBounds = document.getElementsByClassName("tree-sitter-syntax-tree")[0].getBoundingClientRect();

    return thisBounds.top >= syntaxViewBounds.top && thisBounds.bottom <= syntaxViewBounds.bottom;
  }
}
