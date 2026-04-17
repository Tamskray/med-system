import { doctorsDatabase } from "../models/doctors.js";

export class DoctorsService {
  static getAllDoctors() {
    return doctorsDatabase;
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
