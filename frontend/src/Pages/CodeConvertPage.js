import React from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Select } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import MonacoEditor from 'react-monaco-editor';

const validationSchema = Yup.object().shape({
  codeInput: Yup.string().required("Code input is required"),
  sourceLanguage: Yup.string().required("Source language is required"),
  targetLanguage: Yup.string().required("Target language is required"),
});

const languages = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
  // Add more languages as needed
];

const CodeConvertPage = () => {
  const handleSubmit = (values, actions) => {
    // Handle form submission here
    console.log("Form submitted with values:", values);
    actions.setSubmitting(false);
  };

  return (
    <Formik initialValues={{ codeInput: "", sourceLanguage: "", targetLanguage: "" }} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {({ errors, touched, isSubmitting, setFieldValue }) => (
        <Form>
          <FormControl isInvalid={errors.codeInput && touched.codeInput}>
            <FormLabel htmlFor="codeInput">Code Input</FormLabel>
            <MonacoEditor
              width="100%"
              height="300"
              language="javascript" // or use values.sourceLanguage dynamically
              value={values.codeInput}
              onChange={(value) => setFieldValue("codeInput", value)}
              options={{
                selectOnLineNumbers: true
              }}
            />
            <FormErrorMessage>{errors.codeInput}</FormErrorMessage>
          </FormControl>
          <Field name="sourceLanguage">
            {({ field }) => (
              <FormControl isInvalid={errors.sourceLanguage && touched.sourceLanguage}>
                <FormLabel htmlFor="sourceLanguage">Source Language</FormLabel>
                <Select {...field} id="sourceLanguage" placeholder="Select source language">
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.sourceLanguage}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="targetLanguage">
            {({ field }) => (
              <FormControl isInvalid={errors.targetLanguage && touched.targetLanguage}>
                <FormLabel htmlFor="targetLanguage">Target Language</FormLabel>
                <Select {...field} id="targetLanguage" placeholder="Select target language">
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.targetLanguage}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CodeConvertPage;
