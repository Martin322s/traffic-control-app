import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import database from "../../firebaseConfig.js";

export function useDailyVehicleCounts() {
	const [data, setData] = useState([]);

	useEffect(() => {
		const dbRef = ref(database, "counts");

		const unsubscribe = onValue(dbRef, snapshot => {
			const val = snapshot.val();
			if (!val) return setData([]);

			const entries = Object.entries(val).map(([date, obj]) => ({
				date,
				count: obj.current ?? 0
			}));

			entries.sort((a, b) => new Date(b.date) - new Date(a.date));
			setData(entries);
		});

		return () => unsubscribe();
	}, []);

	return data;
}