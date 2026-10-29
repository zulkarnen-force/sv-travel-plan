import { uid } from './utils/id';

export interface ToastAction {
	label: string;
	run: () => void;
}

export interface ToastMessage {
	id: string;
	message: string;
	action?: ToastAction;
	duration: number;
}

class ToastState {
	toasts = $state<ToastMessage[]>([]);
	#timers = new Map<string, ReturnType<typeof setTimeout>>();

	show(message: string, action?: ToastAction, duration = 5000): string {
		const id = uid();
		this.toasts.push({ id, message, action, duration });

		if (duration > 0) {
			const timer = setTimeout(() => this.dismiss(id), duration);
			this.#timers.set(id, timer);
		}

		return id;
	}

	dismiss(id: string) {
		const timer = this.#timers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.#timers.delete(id);
		}
		this.toasts = this.toasts.filter((toast) => toast.id !== id);
	}

	runAction(id: string) {
		const toast = this.toasts.find((candidate) => candidate.id === id);
		if (!toast) return;
		this.dismiss(id);
		toast.action?.run();
	}
}

export const toast = new ToastState();
