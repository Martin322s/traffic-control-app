import { useEffect } from "react";
import { ref, set } from "firebase/database";
import database from "../../firebaseConfig.js";

export function useMidnightReset(setCount) {
	useEffect(() => {
		console.log("Настройване на midnight reset...");
		
		const now = new Date();
		const midnight = new Date();
		midnight.setHours(24, 0, 0, 0);

		const msUntilMidnight = midnight.getTime() - now.getTime();
		console.log(`Време до полунощ: ${Math.round(msUntilMidnight / 1000 / 60)} минути`);

		const timeout = setTimeout(() => {
			console.log("Полунощно нулиране на брояча...");
			setCount(0);

			const newDate = new Date().toISOString().split("T")[0];
			const countRef = ref(database, `counts/${newDate}/current`);
			set(countRef, 0).then(() => {
				console.log("Брояч нулиран в базата данни");
			}).catch(err => {
				console.error("Грешка при нулиране:", err);
			});

			// Рекурсивно настройване за следващия ден
			setTimeout(() => useMidnightReset(setCount), 1000);

		}, msUntilMidnight);

		return () => clearTimeout(timeout);
	}, [setCount]);
}