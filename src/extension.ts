import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(autoInsertCheckbox),
    vscode.workspace.onDidSaveTextDocument(validateTaskFile)
  );
}

const allowedHeaders = ['## TODO', '## WID', '## DONE'];
const checkboxMap: Record<string, string> = {
  '## TODO': '- [ ] ',
  '## WID': '- [~] ',
  '## DONE': '- [x] '
};

function autoInsertCheckbox(event: vscode.TextDocumentChangeEvent) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || event.document !== editor.document) return;

  const change = event.contentChanges[0];
  if (!change || change.text !== '\n') return;

  const position = change.range.start;
  const currentSection = getCurrentSection(editor.document, position.line);

  if (checkboxMap[currentSection]) {
    const insertLine = position.line + 1;
    const insertPos = new vscode.Position(insertLine, 0);
    editor.edit(editBuilder => {
      editBuilder.insert(insertPos, checkboxMap[currentSection]);
    });
  }
}

function getCurrentSection(doc: vscode.TextDocument, line: number): string {
  for (let i = line; i >= 0; i--) {
    const text = doc.lineAt(i).text.trim();
    if (text.startsWith('##')) {
      return text;
    }
  }
  return '';
}

function validateTaskFile(doc: vscode.TextDocument) {
  if (!doc.fileName.endsWith('task.md')) return;

  const lines = doc.getText().split('\n');
  const seen = new Set<string>();
  const fixedLines: string[] = [];
  let currentHeader = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('##')) {
      if (!allowedHeaders.includes(trimmed)) {
        vscode.window.showWarningMessage(`Encabezado inválido: "${trimmed}". Solo se permiten: ${allowedHeaders.join(', ')}`);
        return;
      }
      currentHeader = trimmed;
      fixedLines.push(trimmed);
      continue;
    }

    if (checkboxMap[currentHeader]) {
      const prefix = checkboxMap[currentHeader];
      if (trimmed.startsWith(prefix)) {
        const content = trimmed.slice(prefix.length).trim();
        if (!content || seen.has(content)) continue;
        seen.add(content);
        fixedLines.push(`${prefix}${content}`);
      } else if (trimmed === '') {
        fixedLines.push('');
      }
    } else {
      fixedLines.push(trimmed);
    }
  }

  const newText = fixedLines.join('\n');
  if (newText !== doc.getText()) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
    edit.replace(doc.uri, fullRange, newText);
    vscode.workspace.applyEdit(edit);
  }
}

export function deactivate() {}
