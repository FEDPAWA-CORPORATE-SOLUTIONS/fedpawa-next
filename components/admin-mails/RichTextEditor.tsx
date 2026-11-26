"use client";

import React from "react";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Éditeur de texte riche minimaliste basé sur contentEditable.
 * Gère le gras, l'italique, les liens, les listes à puces et numérotées.
 * Le contenu HTML est stocké dans la valeur, le texte brut est extrait pour le fallback texte.
 */
export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById("rich-text-editor");
    if (editor) {
      onChange(editor.innerHTML);
    }
  };

  const handleLink = () => {
    const url = window.prompt("Entrez l'URL du lien :");
    if (url) {
      document.execCommand("createLink", false, url);
      const editor = document.getElementById("rich-text-editor");
      if (editor) {
        onChange(editor.innerHTML);
      }
    }
  };

  const handleUnlink = () => {
    document.execCommand("unlink", false, undefined);
    const editor = document.getElementById("rich-text-editor");
    if (editor) {
      onChange(editor.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
    const editor = document.getElementById("rich-text-editor");
    if (editor) {
      onChange(editor.innerHTML);
    }
  };

  return (
    <div className={`rich-text-editor ${className || ""}`} style={{ minHeight: 200, border: "1px solid var(--color-border)", borderRadius: 6, padding: 12, outline: "none" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => handleFormat("bold")} title="Gras">
          <b>B</b>
        </button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => handleFormat("italic")} title="Italique">
          <i>I</i>
        </button>
        <button type="button" className="btn btn-sm btn-outline" onClick={handleLink} title="Lien">
          🔗
        </button>
        <button type="button" className="btn btn-sm btn-outline" onClick={handleUnlink} title="Supprimer le lien">
          ⊗
        </button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => handleFormat("insertUnorderedList")} title="Liste à puces">
          • Listes
        </button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => handleFormat("insertOrderedList")} title="Liste numérotée">
          1. Listes
        </button>
      </div>
      <div
        id="rich-text-editor"
        contentEditable={true}
        onInput={(e) => {
          onChange((e.target as HTMLElement).innerHTML);
        }}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: 180,
          fontFamily: "inherit",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          overflowY: "auto",
        }}
      />
    </div>
  );
}

export default RichTextEditor;
