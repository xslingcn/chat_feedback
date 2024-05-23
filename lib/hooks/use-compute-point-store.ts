import { create } from 'zustand';
import { getUserPoint, saveUserPoint } from '@/app/login/actions';

interface UserPointState {
    user_id: string;
    compute_point: number;
    init: (user_id: string) => Promise<void>;
    saveUserPoint: (user_id: string, point: number) => Promise<void>;
}

const useStore = create<UserPointState>((set) => ({
    user_id: '',
    compute_point: 5,
    init: async (userId) => {
        const point = await getUserPoint(userId)
        if (typeof point === 'number') {
            set({ user_id: userId, compute_point: point });
        }
        else if (!point) {
            console.error('Failed to fetch user point');
        }
        else if (point.error) {
            console.error(point.error);
        }
    },
    saveUserPoint: async (userId, point) => {
        await saveUserPoint(userId, point)
        set({ compute_point: point });
    },
}));

export default useStore;
