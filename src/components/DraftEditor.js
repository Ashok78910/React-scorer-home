import React, { useState, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import Button from "./Button";
import Title from "./Title";
import "draft-js/dist/Draft.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedData = localStorage.getItem("draftEditorContent");
    return savedData
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)))
      : EditorState.createEmpty();
  });

  const customStyleMap = {
    "RED-LINE": { color: "red" },
    UNDERLINE: { textDecoration: "underline" },
    BOLD: { fontWeight: "bold" },
  };

  const handleBeforeInput = useCallback(
    (chars) => {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const startKey = selectionState.getStartKey();
      const currentBlock = contentState.getBlockForKey(startKey);
      const blockText = currentBlock.getText();

      // Handle space after # for Heading
      if (
        chars === " " &&
        blockText.includes("#") &&
        !blockText.includes("##")
      ) {
        const index = blockText.indexOf("#");
        const newSelection = selectionState.merge({
          anchorOffset: index,
          focusOffset: index + 1,
        });

        const newContentState = Modifier.replaceText(
          contentState,
          newSelection,
          ""
        );
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        newEditorState = RichUtils.toggleBlockType(
          newEditorState,
          "header-one"
        );
        setEditorState(newEditorState);
        return "handled";
      }

      // Handle space after * for Bold
      if (
        chars === " " &&
        blockText.includes("*") &&
        !blockText.includes("**")
      ) {
        const index = blockText.indexOf("*");
        const newSelection = selectionState.merge({
          anchorOffset: index,
          focusOffset: index + 1,
        });

        const newContentState = Modifier.replaceText(
          contentState,
          newSelection,
          ""
        );
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
        setEditorState(newEditorState);
        return "handled";
      }

      // Handle space after ** for Red Line
      if (
        chars === " " &&
        blockText.includes("**") &&
        !blockText.includes("***")
      ) {
        const index = blockText.indexOf("**");
        const newSelection = selectionState.merge({
          anchorOffset: index,
          focusOffset: index + 2,
        });

        const newContentState = Modifier.replaceText(
          contentState,
          newSelection,
          ""
        );
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "RED-LINE"
        );
        setEditorState(newEditorState);
        return "handled";
      }

      // Handle space after *** for Underline
      if (chars === " " && blockText.includes("***")) {
        const index = blockText.indexOf("***");
        const newSelection = selectionState.merge({
          anchorOffset: index,
          focusOffset: index + 3,
        });

        const newContentState = Modifier.replaceText(
          contentState,
          newSelection,
          ""
        );
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "UNDERLINE"
        );
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    [editorState]
  );

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText();

    if (plainText.trim() === "") {
      toast.error("Please enter some text.");
      return;
    }

    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(contentState))
    );
    toast.success("Content saved successfully");
    setEditorState(EditorState.createEmpty());
  };

  const handleReset = () => {
    setEditorState(EditorState.createEmpty());
    toast.info("Editor reset to default state.");
  };

  return (
    <div>
      <div className="header-container">
        <div className="title-container">
          <Title />
        </div>
        <div className="save-button-container">
          <Button onClick={handleSave} name="Save" />
        </div>
        <div className="save-button-container">
          <Button onClick={handleReset} name="Reset" />
        </div>
      </div>

      <div className="editor-style">
        <Editor
          editorState={editorState}
          onChange={onChange}
          customStyleMap={customStyleMap}
          handleBeforeInput={handleBeforeInput}
          placeholder="Type # for Heading, * for Bold, ** for Red Line, *** for Underline"
        />
        <ToastContainer />
      </div>
    </div>
  );
};

export default DraftEditor;
