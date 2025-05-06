import {ref, readonly} from 'vue';

const toasts = ref([]);
let toastIdCounter = 0;

// --- Timer Management Functions ---
function startTimer(toast) {
    toast.startTime = Date.now();
    toast.remainingDuration = toast.duration;
    if (toast.timerId) {
        clearTimeout(toast.timerId);
    }
    toast.timerId = setTimeout(() => {
        removeToast(toast.id);
    }, toast.remainingDuration);
}

function pauseTimer(toast) {
    const targetToast = toasts.value.find(t => t.id === toast.id);
    if (!targetToast || !targetToast.timerId) return;

    clearTimeout(targetToast.timerId);
    targetToast.timerId = null;

    const elapsed = Date.now() - targetToast.startTime;
    targetToast.remainingDuration -= elapsed;

    if (targetToast.remainingDuration < 0) {
        targetToast.remainingDuration = 0;
    }
    targetToast.isPaused = true;
}

function resumeTimer(toast) {
    const targetToast = toasts.value.find(t => t.id === toast.id);
    if (!targetToast || targetToast.timerId !== null || targetToast.remainingDuration <= 0) return;

    targetToast.startTime = Date.now();
    targetToast.timerId = setTimeout(() => {
        removeToast(targetToast.id);
    }, targetToast.remainingDuration);
    targetToast.isPaused = false;
}

// --- Toast Removal Function ---
function removeToast(id) {
    const toastIndex = toasts.value.findIndex(toast => toast.id === id);
    if (toastIndex !== -1) {
        const toast = toasts.value[toastIndex];
        if (toast.timerId) {
            clearTimeout(toast.timerId);
            toast.timerId = null;
        }
        toasts.value.splice(toastIndex, 1);
    }
}

// --- The Composable Function ---
export function useToast() {
    // --- Function to Add New Toasts ---
    function addToast({msg, type = 'info', duration = 4000}) {
        const id = toastIdCounter++;
        const newToast = {
            id,
            msg,
            type,
            duration,
            timerId: null,
            startTime: 0,
            remainingDuration: duration,
            isPaused: false
        };
        toasts.value.push(newToast);
        startTimer(newToast);
    }
    return {
        toasts: readonly(toasts),
        addToast,
        removeToast,
        pauseTimer,
        resumeTimer
    };
}