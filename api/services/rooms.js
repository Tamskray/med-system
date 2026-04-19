import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { ROOMS_TABLE } from "../models/rooms.js";

export class RoomsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static async getAllRooms() {
    const { data: rooms, error } = await supabase
      .from(ROOMS_TABLE)
      .select("id, room_number, description, is_active, doctors(id, last_name, first_name)")
      .eq("is_active", true)
      .order("room_number", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return rooms;
  }
}
