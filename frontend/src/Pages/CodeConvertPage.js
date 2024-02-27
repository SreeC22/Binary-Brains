
import React from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Select, Textarea } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

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

const CodeTranslationForm = ({ onSubmit }) => {
  const handleSubmit = (values, actions) => {
    onSubmit(values);
    actions.setSubmitting(false);
  };

  return (
    <Formik initialValues={{ codeInput: "", sourceLanguage: "", targetLanguage: "" }} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {({ errors, touched }) => (
        <Form>
          <Field name="codeInput">
            {({ field }) => (
              <FormControl isInvalid={errors.codeInput && touched.codeInput}>
                <FormLabel htmlFor="codeInput">Code Input</FormLabel>
                <Textarea {...field} id="codeInput" />
                <FormErrorMessage>{errors.codeInput}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
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

export default CodeTranslationForm;
