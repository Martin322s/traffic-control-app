import { ref, set } from 'firebase/database';
import database from '../../firebaseConfig.js';

export function updateVehicleCount(count) {
	const now = new Date();
	const dateKey = now.toISOString().split('T')[0];
	
	const countRef = ref(database, `counts/${dateKey}/current`);
	set(countRef, count);
}