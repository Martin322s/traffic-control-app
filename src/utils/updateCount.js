import { ref, set } from 'firebase/database';
import database from '../../firebaseConfig.js';

export function updateVehicleCount(count) {
	console.log(`Актуализиране на брояча в базата данни: ${count}`);
	
	const now = new Date();
	const dateKey = now.toISOString().split('T')[0];
	
	const countRef = ref(database, `counts/${dateKey}/current`);
	set(countRef, count).then(() => {
		console.log(`Брояч актуализиран успешно: ${count}`);
	}).catch(err => {
		console.error("Грешка при актуализиране на брояча:", err);
	});
}