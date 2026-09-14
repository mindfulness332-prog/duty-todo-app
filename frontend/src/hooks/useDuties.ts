import { useCallback, useEffect, useState } from "react";
import * as dutiesApi from "../services/dutiesApi";
import { ApiError } from "../services/ApiError";
import type { Duty } from "../types/duty";

function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export function useDuties() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDuties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dutiesApi.getDuties();
      setDuties(result);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createDuty = useCallback(async (name: string) => {
    const created = await dutiesApi.createDuty(name);
    setDuties((prev) => [...prev, created]);
    return created;
  }, []);

  const updateDuty = useCallback(async (id: string, name: string) => {
    const updated = await dutiesApi.updateDuty(id, name);
    setDuties((prev) => prev.map((duty) => (duty.id === id ? updated : duty)));
    return updated;
  }, []);

  const removeDuty = useCallback(async (id: string) => {
    await dutiesApi.deleteDuty(id);
    setDuties((prev) => prev.filter((duty) => duty.id !== id));
  }, []);

  useEffect(() => {
    void fetchDuties();
  }, [fetchDuties]);

  return { duties, loading, error, fetchDuties, createDuty, updateDuty, removeDuty };
}
