import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(autoInsertCheckbox),
    vscode.workspace.onDidSaveTextDocument((doc)=> {
      validateTaskFile(doc, 'task.md');
      validateTaskFile(doc, 'progress.md');
  }));
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

function validateTaskFile(doc: vscode.TextDocument, fileName: string) {
  if (!doc.fileName.endsWith(fileName)) return;

  const lines = doc.getText().split('\n');
  const seen = new Set<string>();
  const fixedLines: string[] = [];

  let currentHeader = '';

  for (const line of lines) {
      const trimmed = line.trim();

      // Si es encabezado
      if (trimmed.startsWith('##')) {
          if (!allowedHeaders.includes(trimmed)) {
              // OMITIR encabezados inválidos
              continue;
          }
          currentHeader = trimmed;
          fixedLines.push(trimmed);
          continue;
      }

      // Si estamos dentro de una sección válida
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
          // Si no estamos en una sección válida, ignorar contenido
          continue;
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
