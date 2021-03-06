import * as React from "react";
import * as TreeSitter from "tree-sitter";
import { scrollIntoViewIfNeeded } from "atom-ide-base/commons-ui/scrollIntoView"

type Props = {
  tsNode: TreeSitter.ASTNode;
  onSelected(userInteraction: boolean, tsNode: TreeSitter.ASTNode): void;
  selectedNode: TreeSitter.ASTNode | null;
  nodeMap: Map<number, AstNode>;
  showUnnamedTokens: boolean;
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
  private onClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    this.props.onSelected(true, this.props.tsNode);
    event.stopPropagation();
  };

  constructor(props: Props) {
    super(props);

    this.state = { expanded: true };
    this.props.nodeMap.set(this.props.tsNode.id, this);
  }

  public componentDidMount(): void {
    if (this.isSelected()) {
      this.scrollIntoView();
    }
  }

  public componentWillUnmount(): void {
    this.props.nodeMap.delete(this.props.tsNode.id);
  }

  public componentWillReceiveProps(nextProps: Props): void {
    // TODO doesn't work
    // if (this.isSelected(nextProps)) {
    //   this.scrollIntoView();
    // }
  }

  public render(): JSX.Element {
    return <li className={this.getClassName()} ref={element => element && (this.element = element)} onClick={this.onClick}>
      {!!this.props.tsNode.children.length && <div className="ast-node-toggle" onClick={this.toggle}></div>}
      <div className="ast-node-header">{this.props.tsNode.type}</div>
      {this.state.expanded && <ul className="ast-node-list">
        {(this.props.showUnnamedTokens ? this.props.tsNode.children : this.props.tsNode.namedChildren).map(childNode => <AstNode
            key={childNode.id}
            tsNode={childNode}
            onSelected={this.props.onSelected}
            selectedNode={this.props.selectedNode}
            nodeMap={this.props.nodeMap}
            showUnnamedTokens={this.props.showUnnamedTokens} />)}
      </ul>}
    </li>;
  }

  private scrollIntoView(): void {
    if (this.element && !this.isInView()) {
      scrollIntoViewIfNeeded(this.element, true)
    }
  }

  private getClassName(): string {
    const classes = ["ast-node"];
    if (this.props.tsNode.children.length) classes.push("has-children");
    if (this.isSelected()) classes.push("tree-sitter-selected");
    classes.push(this.state.expanded ? "expanded" : "collapsed");

    return classes.join(" ")
  }

  private isSelected(props: Props = this.props): boolean {
    return props.selectedNode ? props.selectedNode.id === props.tsNode.id : false;
  }

  private isInView(): boolean {
    const thisBounds = this.element.getBoundingClientRect();
    const syntaxViewBounds = document.getElementsByClassName("tree-sitter-syntax-tree-content")[0].getBoundingClientRect();

    return thisBounds.top >= syntaxViewBounds.top && thisBounds.bottom <= syntaxViewBounds.bottom;
  }
}
