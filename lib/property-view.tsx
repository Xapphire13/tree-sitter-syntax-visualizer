import * as React from "react";
import * as TreeSitter from "tree-sitter";

export class PropertyView extends React.Component<{tsNode: TreeSitter.AstNode | null}> {
  public render(): JSX.Element {
    return <div className="tree-sitter-property-view">
      <h4>Properties</h4>
      <table>
        <tr>
          <td style={{fontWeight: "bold"}}>Type</td>
          <td>{this.props.tsNode && (this.props.tsNode.isNamed ? this.props.tsNode.type : "token")}</td>
        </tr>
        <tr>
          <td style={{fontWeight: "bold"}}>Span</td>
          <td>{this.props.tsNode && this.formatSpan(this.props.tsNode.startPosition, this.props.tsNode.endPosition)}</td>
        </tr>
      </table>
    </div>;
  }

  private formatSpan(startPosition: TreeSitter.Position, endPosition: TreeSitter.Position): string {
    return `[${startPosition.row + 1}:${startPosition.column + 1}..${endPosition.row + 1}:${endPosition.column + 1}]`;
  }
}
