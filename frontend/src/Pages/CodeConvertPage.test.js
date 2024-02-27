// CodeTranslationForm.test.js
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import CodeTranslationForm from "./CodeTranslationForm";

test("Form renders correctly", () => {
  const { getByLabelText, getByText } = render(<CodeTranslationForm />);
  
  expect(getByLabelText("Code Input")).toBeInTheDocument();
  expect(getByLabelText("Source Language")).toBeInTheDocument();
  expect(getByLabelText("Target Language")).toBeInTheDocument();
  expect(getByText("Submit")).toBeInTheDocument();
});

test("Form submission with valid inputs", () => {
  const handleSubmit = jest.fn();
  const { getByLabelText, getByText } = render(<CodeTranslationForm onSubmit={handleSubmit} />);
  
  fireEvent.change(getByLabelText("Code Input"), { target: { value: "console.log('Hello, world!');" } });
  fireEvent.change(getByLabelText("Source Language"), { target: { value: "javascript" } });
  fireEvent.change(getByLabelText("Target Language"), { target: { value: "python" } });
  fireEvent.click(getByText("Submit"));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    codeInput: "console.log('Hello, world!');",
    sourceLanguage: "javascript",
    targetLanguage: "python",
  });
});

// Write more tests for form validation as needed
