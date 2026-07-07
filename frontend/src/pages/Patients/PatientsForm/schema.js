import { z } from "zod";
import dayjs from "dayjs";

export const patientSchema = z.object({
  last_name: z.string().trim().min(2, "Прізвище обов'язкове"),
  first_name: z.string().trim().min(2, "Ім'я обов'язкове"),
  middle_name: z.string().trim().optional(),
  gender: z.string(),
  date_of_birth: z
    .any()
    .refine((val) => {
      return val && dayjs.isDayjs(val) && val.isValid();
    }, "Введіть повну дату у форматі ДД.ММ.РРРР")

    .refine((val) => {
      if (!val || !val.isValid()) return true;
      return val.year() >= 1900;
    }, "Рік народження має бути реалістичним (не раніше 1900)")

    .refine((val) => {
      if (!val || !val.isValid()) return true;
      return !val.isAfter(dayjs(), "day");
    }, "Дата народження не може бути в майбутньому"),

  email: z.string().trim().email("Вкажіть коректний email").optional().or(z.literal("")),
});

export const defaultFormValues = {
  last_name: "",
  first_name: "",
  middle_name: "",
  gender: "",
  date_of_birth: null,
  phone: "",
  email: "",
};
