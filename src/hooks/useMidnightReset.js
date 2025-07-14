import { useEffect } from "react";
import { ref, set } from "firebase/database";
import database from "../../firebaseConfig.js";

export function useMidnightReset(setCount) {
	useEffect(() => {
		const now = new Date();
		const midnight = new Date();
		midnight.setHours(24, 0, 0, 0);

		const msUntilMidnight = midnight.getTime() - now.getTime();

		const timeout = setTimeout(() => {
			setCount(0);

			const newDate = new Date().toISOString().split("T")[0];
			const countRef = ref(database, `counts/${newDate}/current`);
			set(countRef, 0);

			useMidnightReset(setCount);

		}, msUntilMidnight);

		return () => clearTimeout(timeout);
	}, [setCount]);
}