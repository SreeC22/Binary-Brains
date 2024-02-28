import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import CodeTranslationForm from "./CodeTranslationForm";

describe("CodeTranslationForm", () => {
  test("renders input and output code editors", () => {
    const { getByLabelText } = render(<CodeTranslationForm />);
    const inputCodeEditor = getByLabelText("Input Code");
    const outputCodeEditor = getByLabelText("Converted Code");
    expect(inputCodeEditor).toBeInTheDocument();
    expect(outputCodeEditor).toBeInTheDocument();
  });

  test("displays error message if target language is not selected", async () => {
    const { getByText } = render(<CodeTranslationForm />);
    fireEvent.click(getByText("Convert"));
    await waitFor(() => {
      expect(getByText("Target language is required")).toBeInTheDocument();
    });
  });

  test("displays error message if input code is empty", async () => {
    const { getByText, getByLabelText } = render(<CodeTranslationForm />);
    fireEvent.change(getByLabelText("Target Language"), { target: { value: "python" } });
    fireEvent.click(getByText("Convert"));
    await waitFor(() => {
      expect(getByText("Input code is required")).toBeInTheDocument();
    });
  });

  test("displays converted code when convert button is clicked with valid input", async () => {
    const { getByText, getByLabelText } = render(<CodeTranslationForm />);
    fireEvent.change(getByLabelText("Input Code"), { target: { value: "print('Hello, world!')" } });
    fireEvent.change(getByLabelText("Target Language"), { target: { value: "python" } });
    fireEvent.click(getByText("Convert"));
    await waitFor(() => {
      expect(getByText("Generated code in python goes here")).toBeInTheDocument();
    });
  });
});
