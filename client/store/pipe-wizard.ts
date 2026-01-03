import { PipeConfig } from "@/lib/schema/pipe";
import { create } from "zustand";

interface PipeWizardState {
    // data
    currentStep: number;
    data: Partial<PipeConfig>;

    //Actions
    setStep: (step: number) => void;
    updateData: (updates: Partial<PipeConfig>) => void;
    reset: () => void;
}

export const usePipeWizard = create<PipeWizardState>((set) => ({
    currentStep: 1,
    data: {},

    setStep: (step) => set({ currentStep: step }),

    updateData: (updates) =>
        set((state) => ({
            data: { ...state.data, ...updates },
        })),

    reset: () => set({ currentStep: 1, data: {} }),
}));
