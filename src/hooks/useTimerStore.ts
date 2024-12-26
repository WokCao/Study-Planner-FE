import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CalendarEvent from '../interface/CalendarEvent';

interface TimerState {
	time: number | null;
	break: number | null;
  timeDisplay: string | null;
  task: CalendarEvent | null;
	isRunning: boolean;
	setDuration: (data: { time: number, break: number }) => void;
	setTimeDisplay: (timeDisplay: string) => void;
  setTask: (task: CalendarEvent) => void;
	setIsRunning: (isRunning: boolean) => void;
  clearData: () => void;
}

const useUserStore = create<TimerState>()(
  persist(
    (set) => ({
			time: null,
			break: null,
			timeDisplay: null,
			task: null,
			isRunning: false,
			setDuration: (data) =>
        set({
					time: data.time,
					break: data.break,
					timeDisplay: data.time.toString().padStart(2, '0') + ':00'
        }),
			setTimeDisplay: (timeDisplay) => set({ timeDisplay }),
			setTask: (task: CalendarEvent) => set({ task }),
			setIsRunning: (isRunning: boolean) => set({ isRunning }),
      clearData: () =>
        set({
					time: null,
					break: null,
					timeDisplay: null,
					task: null,
					isRunning: false,
        }),
    }),
    {
      name: 'timer-storage',
    }
  )
);

export default useUserStore;
