import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import database from "../../firebaseConfig.js";

export function useVehicleCountFromFirebase() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const today = new Date().toISOString().split("T")[0];
		const countRef = ref(database, `counts/${today}/current`);

		const unsubscribe = onValue(countRef, (snapshot) => {
			const value = snapshot.val();
			setCount(value ?? 0);
		});

		return () => unsubscribe();
	}, []);

	return count;
}