import * as React from "react";
import * as TreeSitter from "tree-sitter";
import * as _SyntaxTreeView from "./syntax-tree-view";
import * as _PropertyView from "./property-view";

import {CompositeDisposable, TextEditor} from "atom";

const {PropertyView} = require("./property-view.tsx") as (typeof _PropertyView);
const {SyntaxTreeView} = require("./syntax-tree-view.tsx") as (typeof _SyntaxTreeView);
const debounce = require('debounce');

export type Props = {
  textEditor: TextEditor | undefined;
};

type State = {
  tsDocument: TreeSitter.Document | null;
  selectedNode: TreeSitter.ASTNode | null;
};

export class TreeSitterPanel extends React.Component<Props, State> {
  private subscriptions = new CompositeDisposable();
  private onNodeSelected = (userInteraction: boolean, tsNode: TreeSitter.ASTNode): void => {
    if (userInteraction && this.props.textEditor) {
      this.props.textEditor.setSelectedBufferRange([
        [tsNode.startPosition.row, tsNode.startPosition.column],
        [tsNode.endPosition.row, tsNode.endPosition.column]
      ]);
    }

    this.setState({
      selectedNode: tsNode
    });
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      tsDocument: null,
      selectedNode: null
    };
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.textEditor !== this.props.textEditor) {
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();

      const editor = nextProps.textEditor;

      if (editor && editor.languageMode.document) {
        this.subscriptions.add(editor.onDidChangeSelectionRange(event => {
          const currentNode = this.state.tsDocument!.rootNode!.descendantForPosition(event.newBufferRange.start, event.newBufferRange.end);
          if (currentNode) {
            this.setState({
              selectedNode: currentNode
            });
          }
        }));
        this.subscriptions.add(editor.onDidChange(debounce(() => {
          this.setState(prevState => prevState); // Cause rerender
        }, 500)));

        this.setState({
          tsDocument: editor.languageMode.document,
          selectedNode: null
        });
      } else {
        this.setState({
          tsDocument: null,
          selectedNode: null
        });
      }
    }
  }

  public render(): JSX.Element {
    return <div className="tree-sitter-panel">
      {this.state.tsDocument ?
        this.renderDocument() :
        <div style={{padding: "10px"}}>
          {this.props.textEditor ? `${this.props.textEditor.getGrammar().name} grammar not supported` : "No document open"}
        </div>}
    </div>
  }

  private renderDocument(): JSX.Element[] {
    return [
      <SyntaxTreeView tsDocument={this.state.tsDocument!} onNodeSelected={this.onNodeSelected} selectedNode={this.state.selectedNode} />,
      <PropertyView tsNode={this.state.selectedNode} />
    ];
  }
}
