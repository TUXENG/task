"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(autoInsertCheckbox), vscode.workspace.onDidSaveTextDocument(validateTaskFile));
}
const allowedHeaders = ['## TODO', '## WID', '## DONE'];
const checkboxMap = {
    '## TODO': '- [ ] ',
    '## WID': '- [~] ',
    '## DONE': '- [x] '
};
function autoInsertCheckbox(event) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document)
        return;
    const change = event.contentChanges[0];
    if (!change || change.text !== '\n')
        return;
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
function getCurrentSection(doc, line) {
    for (let i = line; i >= 0; i--) {
        const text = doc.lineAt(i).text.trim();
        if (text.startsWith('##')) {
            return text;
        }
    }
    return '';
}
function validateTaskFile(doc) {
    if (!doc.fileName.endsWith('task.md'))
        return;
    const lines = doc.getText().split('\n');
    const seen = new Set();
    const fixedLines = [];
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
                if (!content || seen.has(content))
                    continue;
                seen.add(content);
                fixedLines.push(`${prefix}${content}`);
            }
            else if (trimmed === '') {
                fixedLines.push('');
            }
        }
        else {
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
function deactivate() { }
