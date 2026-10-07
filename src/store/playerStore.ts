import { create } from 'zustand';
import { Track, RepeatMode } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  showQueue: boolean;
  showExpanded: boolean;
  shuffleHistory: string[];
  
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleQueue: () => void;
  toggleExpanded: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  showQueue: false,
  showExpanded: false,
  shuffleHistory: [],

  playTrack: (track, queue) => {
    const state = get();
    const newQueue = queue || state.queue;
    const idx = newQueue.findIndex(t => t.id === track.id);
    set({
      currentTrack: track,
      queue: newQueue.length > 0 ? newQueue : [track],
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
      progress: 0,
    });
  },

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat, shuffleHistory } = get();
    if (queue.length === 0) return;

    if (shuffle) {
      const available = queue.filter((_, i) => i !== queueIndex);
      if (available.length === 0) return;
      const nextIdx = Math.floor(Math.random() * available.length);
      const actualIdx = queue.indexOf(available[nextIdx]);
      set({
        currentTrack: queue[actualIdx],
        queueIndex: actualIdx,
        progress: 0,
        shuffleHistory: [...shuffleHistory, queue[queueIndex]?.id || ''],
      });
    } else {
      const nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeat === 'all') {
          set({ currentTrack: queue[0], queueIndex: 0, progress: 0 });
        } else {
          set({ isPlaying: false });
        }
      } else {
        set({ currentTrack: queue[nextIdx], queueIndex: nextIdx, progress: 0 });
      }
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, progress, shuffle, shuffleHistory } = get();
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }
    if (shuffle && shuffleHistory.length > 0) {
      const prevId = shuffleHistory[shuffleHistory.length - 1];
      const prevIdx = queue.findIndex(t => t.id === prevId);
      if (prevIdx >= 0) {
        set({
          currentTrack: queue[prevIdx],
          queueIndex: prevIdx,
          progress: 0,
          shuffleHistory: shuffleHistory.slice(0, -1),
        });
        return;
      }
    }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      set({ currentTrack: queue[prevIdx], queueIndex: prevIdx, progress: 0 });
    }
  },

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  toggleShuffle: () => set(state => ({ shuffle: !state.shuffle })),
  cycleRepeat: () => set(state => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const idx = modes.indexOf(state.repeat);
    return { repeat: modes[(idx + 1) % 3] };
  }),
  toggleQueue: () => set(state => ({ showQueue: !state.showQueue })),
  toggleExpanded: () => set(state => ({ showExpanded: !state.showExpanded })),
  addToQueue: (track) => set(state => ({ queue: [...state.queue, track] })),
  removeFromQueue: (index) => set(state => {
    const newQueue = state.queue.filter((_, i) => i !== index);
    let newIndex = state.queueIndex;
    if (index < state.queueIndex) newIndex--;
    return { queue: newQueue, queueIndex: newIndex };
  }),
  reorderQueue: (from, to) => set(state => {
    const newQueue = [...state.queue];
    const [moved] = newQueue.splice(from, 1);
    newQueue.splice(to, 0, moved);
    let newIndex = state.queueIndex;
    if (from === state.queueIndex) newIndex = to;
    else if (from < state.queueIndex && to >= state.queueIndex) newIndex--;
    else if (from > state.queueIndex && to <= state.queueIndex) newIndex++;
    return { queue: newQueue, queueIndex: newIndex };
  }),
}));
