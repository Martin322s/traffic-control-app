import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import database from "../../firebaseConfig.js";

export function useVehicleCountFromFirebase() {
	const [count, setCount] = useState(0);
	const [dateKey, setDateKey] = useState(() => {
		return new Date().toISOString().split("T")[0];
	});

	useEffect(() => {
		const interval = setInterval(() => {
			const nowDate = new Date().toISOString().split("T")[0];
			setDateKey(d => (d !== nowDate ? nowDate : d));
		}, 60 * 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const countRef = ref(database, `counts/${dateKey}/current`);
		const unsubscribe = onValue(countRef, snapshot => {
			const value = snapshot.val();
			setCount(value ?? 0);
		});
		return () => unsubscribe();
	}, [dateKey]);

	return count;
}