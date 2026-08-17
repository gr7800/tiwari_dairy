"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type { MasterDataActionState, MasterDataResult } from "./milkTypes";
import type { MasterDataActionState, MasterDataResult } from "./milkTypes";

const timePattern = /^\d{2}:\d{2}$/;

export interface ShiftInput {
  name: string;
  startTime: string;
  endTime: string;
  sortOrder?: number;
}

/** Shared by the form Server Action and app/api/shifts/route.ts. */
export async function createShiftCore(input: ShiftInput): Promise<MasterDataResult> {
  if (!input.name) return { error: "Name is required", status: 400 };
  if (!timePattern.test(input.startTime) || !timePattern.test(input.endTime)) {
    return { error: "Start and end time must be in HH:MM format", status: 400 };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("shift_configs")
    .insert({
      name: input.name,
      start_time: input.startTime,
      end_time: input.endTime,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) {
    return {
      status: error.code === "23505" ? 409 : 500,
      error: error.code === "23505" ? "A shift with this name already exists" : error.message,
    };
  }

  revalidatePath("/settings/shifts");
  return { data };
}

export async function updateShiftWindowCore(
  id: string,
  startTime: string,
  endTime: string
): Promise<MasterDataResult> {
  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    return { error: "Start and end time must be in HH:MM format", status: 400 };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shift_configs")
    .update({ start_time: startTime, end_time: endTime })
    .eq("id", id)
    .select()
    .single();
  if (error) return { status: 500, error: error.message };

  revalidatePath("/settings/shifts");
  return { data };
}

export async function createShift(
  _prev: MasterDataActionState,
  formData: FormData
): Promise<MasterDataActionState> {
  const result = await createShiftCore({
    name: String(formData.get("name") ?? "").trim(),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  return result.error ? { error: result.error } : {};
}

export async function updateShiftWindow(
  id: string,
  startTime: string,
  endTime: string
): Promise<{ error?: string }> {
  const result = await updateShiftWindowCore(id, startTime, endTime);
  return result.error ? { error: result.error } : {};
}
