import { ref, set } from 'firebase/database';
import database from '../../firebaseConfig.js';

export function updateVehicleCount(count) {
	console.log(`Актуализиране на брояча в базата данни: ${count}`);

	console.log(`Актуализиране на брояча в базата данни: ${count}`);
	
	const now = new Date();
	const dateKey = now.toISOString().split('T')[0];

	const countRef = ref(database, `counts/${dateKey}/current`);
	set(countRef, count).then(() => {
		console.log(`Брояч актуализиран успешно: ${count}`);
	}).catch(err => {
		console.error("Грешка при актуализиране на брояча:", err);

		if (err.code === 'PERMISSION_DENIED') {
			console.error(`
🔥 FIREBASE PERMISSION_DENIED ГРЕШКА 🔥

Проблем: Firebase Realtime Database не позволява запис от клиента.

Решение:
1. Отидете в Firebase Console: https://console.firebase.google.com/
2. Изберете вашия проект: traffic-control-app-62a75
3. Отидете в "Realtime Database" -> "Rules"
4. Заменете правилата с:

{
  "rules": {
    ".read": "true",
    "counts": {
      ".write": "true"
    }
  }
}

5. Натиснете "Publish"

ВНИМАНИЕ: Това е за разработка. За продукция използвайте authentication!
			`);

			// Показваме грешката и в UI
			if (typeof window !== 'undefined') {
				const errorDiv = document.createElement('div');
				errorDiv.style.cssText = `
					position: fixed;
					top: 20px;
					right: 20px;
					background: #ff4444;
					color: white;
					padding: 15px;
					border-radius: 8px;
					z-index: 9999;
					max-width: 400px;
					font-family: monospace;
					font-size: 12px;
				`;
				errorDiv.innerHTML = `
					<strong>Firebase Permission Error!</strong><br>
					Трябва да актуализирате Firebase правилата.<br>
					Вижте Console (F12) за инструкции.
					<button onclick="this.parentElement.remove()" style="float: right; margin-left: 10px;">✕</button>
				`;
				document.body.appendChild(errorDiv);

				// Премахваме съобщението след 10 секунди
				setTimeout(() => {
					if (errorDiv.parentElement) {
						errorDiv.remove();
					}
				}, 10000);
			}
		}
	});
	set(countRef, count).then(() => {
		console.log(`Брояч актуализиран успешно: ${count}`);
	}).catch(err => {
		console.error("Грешка при актуализиране на брояча:", err);
		
		if (err.code === 'PERMISSION_DENIED') {
			console.error(`
🔥 FIREBASE PERMISSION_DENIED ГРЕШКА 🔥

Проблем: Firebase Realtime Database не позволява запис от клиента.

Решение:
1. Отидете в Firebase Console: https://console.firebase.google.com/
2. Изберете вашия проект: traffic-control-app-62a75
3. Отидете в "Realtime Database" -> "Rules"
4. Заменете правилата с:

{
  "rules": {
    ".read": "true",
    "counts": {
      ".write": "true"
    }
  }
}

5. Натиснете "Publish"

ВНИМАНИЕ: Това е за разработка. За продукция използвайте authentication!
			`);
			
			// Показваме грешката и в UI
			if (typeof window !== 'undefined') {
				const errorDiv = document.createElement('div');
				errorDiv.style.cssText = `
					position: fixed;
					top: 20px;
					right: 20px;
					background: #ff4444;
					color: white;
					padding: 15px;
					border-radius: 8px;
					z-index: 9999;
					max-width: 400px;
					font-family: monospace;
					font-size: 12px;
				`;
				errorDiv.innerHTML = `
					<strong>Firebase Permission Error!</strong><br>
					Трябва да актуализирате Firebase правилата.<br>
					Вижте Console (F12) за инструкции.
					<button onclick="this.parentElement.remove()" style="float: right; margin-left: 10px;">✕</button>
				`;
				document.body.appendChild(errorDiv);
				
				// Премахваме съобщението след 10 секунди
				setTimeout(() => {
					if (errorDiv.parentElement) {
						errorDiv.remove();
					}
				}, 10000);
			}
		}
	});
}