import * as React from "react";
import * as TreeSitter from "tree-sitter";
import * as _SyntaxTreeView from "./syntax-tree-view";
import * as _PropertyView from "./property-view";

import {CompositeDisposable, TextEditor} from "atom";

const {PropertyView} = require("./property-view.tsx") as (typeof _PropertyView);
const {SyntaxTreeView} = require("./syntax-tree-view.tsx") as (typeof _SyntaxTreeView);

export type Props = {
  textEditor: TextEditor | undefined;
};

type State = {
  tsDocument: TreeSitter.Document | null;
  selectedNode: TreeSitter.AstNode | null;
};

export class TreeSitterPanel extends React.Component<Props, State> {
  private subscriptions = new CompositeDisposable();
  private onNodeSelected = (tsNode: TreeSitter.AstNode): void => {
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

      if (editor && editor.getGrammar().name === "C#") {
        const createDocument = () => {
          const tsDocument = new TreeSitter.Document();
          tsDocument.setLanguage(require("tree-sitter-c-sharp"));
          tsDocument.setInputString(editor.getText());
          tsDocument.parse();

          return tsDocument;
        };

        this.subscriptions.add(editor.onDidSave(() => {
          this.setState({
            tsDocument: createDocument()
          });
        }));
        this.subscriptions.add(editor.onDidChangeCursorPosition(event => {
          const currentNode = this.state.tsDocument!.rootNode!.descendantForPosition(event.newBufferPosition);
          if (currentNode) {
            this.setState({
              selectedNode: currentNode
            });
          }
        }));

        this.setState({
          tsDocument: createDocument(),
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
