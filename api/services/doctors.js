import { supabase } from "../supabase.js";
import { doctorsDatabase } from "../models/doctors.js";

export class DoctorsService {
  static async getAllDoctors() {
    const { data: doctors, error } = await supabase
      .from("doctors_test")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    console.log(doctors);

    return doctors;
  }

  static getDoctorById(id) {
    return doctorsDatabase.find((doctor) => doctor.id === id);
  }

  static createDoctor(data) {
    const nextId =
      doctorsDatabase.length > 0 ? Math.max(...doctorsDatabase.map((d) => d.id)) + 1 : 1;
    const newDoctor = { id: nextId, ...data };
    doctorsDatabase.push(newDoctor);
    return newDoctor;
  }

  static updateDoctor(id, data) {
    const index = doctorsDatabase.findIndex((doctor) => doctor.id === id);
    if (index === -1) return null;

    doctorsDatabase[index] = { ...doctorsDatabase[index], ...data };
    return doctorsDatabase[index];
  }

  static deleteDoctor(id) {
    const index = doctorsDatabase.findIndex((doctor) => doctor.id === id);
    if (index === -1) return null;

    const deletedDoctor = doctorsDatabase.splice(index, 1)[0];
    return deletedDoctor;
  }
}
