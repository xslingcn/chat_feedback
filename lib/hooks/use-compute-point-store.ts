// @ts-nocheck
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
        set({ user_id: userId, compute_point: point });
    },
    saveUserPoint: async (userId, point) => {
        await saveUserPoint(userId, point)
        set({ compute_point: point });
    },
}));

export default useStore;
