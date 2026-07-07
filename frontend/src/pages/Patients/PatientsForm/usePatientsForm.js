import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import { defaultFormValues, patientSchema } from "./schema";
import { PATIENT_FORM_MODES } from "../constants";

export const usePatientsForm = ({ mode, initialValues, onSubmit }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (mode === PATIENT_FORM_MODES.EDIT && initialValues) {
      reset({
        ...defaultFormValues,
        ...initialValues,
        date_of_birth: initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : null,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [mode, initialValues, reset]);

  const submit = (data) => {
    const formattedData = {
      ...data,
      id: initialValues?.id || null,
      date_of_birth: data.date_of_birth ? data.date_of_birth.format("YYYY-MM-DD") : null,
    };

    onSubmit(formattedData);
  };

  return {
    control,
    errors,
    submitForm: handleSubmit(submit),
  };
};
