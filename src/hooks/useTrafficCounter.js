import { useEffect, useRef, useState } from "react";
import { loadModel } from "../services/tfModel";
import { euclidean } from "../utils/tracker";
import { updateVehicleCount } from "../utils/updateCount";
import { useMidnightReset } from "./useMidnightReset";

export function useTrafficCounter(canvasRef, imgRef, options = {}) {
	const topIgnoreY = options.topIgnoreY || 150;
	const maxDist = options.maxDist || 60;
	const maxLost = options.maxLost || 3;
	const frameMs = options.frameMs || 1000;

	const [count, setCount] = useState(0);
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [error, setError] = useState(null);
	
	useMidnightReset(setCount);
	const objectsRef = useRef(new Map());
	const nextIdRef = useRef(0);

	useEffect(() => {
		let model;
		let isMounted = true;
		let interval;

		const initializeModel = async () => {
			try {
				console.log("Зареждане на AI модела...");
				model = await loadModel();
				if (isMounted) {
					setIsModelLoaded(true);
					setError(null);
					console.log("AI моделът е зареден успешно!");
				}
			} catch (err) {
				console.error("Грешка при зареждане на модела:", err);
				if (isMounted) {
					setError("Грешка при зареждане на AI модела");
				}
			}
		};

		const processFrame = async () => {
			if (!model || !isMounted) return;
			
			const img = imgRef.current;
			const cvs = canvasRef.current;
			
			if (!img || !cvs) {
				console.warn("Липсва изображение или canvas елемент");
				return;
			}

			// Проверка дали изображението е заредено
			if (!img.complete || img.naturalWidth === 0) {
				console.warn("Изображението все още не е заредено");
				return;
			}

			try {
				const ctx = cvs.getContext("2d");
				
				// Изчистване на canvas
				ctx.clearRect(0, 0, cvs.width, cvs.height);
				
				// Рисуване на изображението
				ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

				// Рисуване на линията за игнориране
				ctx.strokeStyle = "#00ff00";
				ctx.lineWidth = 3;
				ctx.setLineDash([10, 5]);
				ctx.beginPath();
				ctx.moveTo(0, topIgnoreY);
				ctx.lineTo(cvs.width, topIgnoreY);
				ctx.stroke();
				ctx.setLineDash([]);

				// Добавяне на текст за линията
				ctx.fillStyle = "#00ff00";
				ctx.font = "16px Arial";
				ctx.fillText("Зона за засичане", 10, topIgnoreY - 10);

				console.log("Започва разпознаване на обекти...");
				
				// Разпознаване на обекти
				const detections = await model.detect(cvs);
				console.log(`Открити ${detections.length} обекта:`, detections);

				// Филтриране само на превозни средства
				const vehicles = detections.filter(p => {
					const vehicleClasses = ["car", "truck", "bus", "motorcycle"];
					return vehicleClasses.includes(p.class) && p.score > 0.5;
				}).map(p => {
					const [x, y, w, h] = p.bbox;
					return {
						cx: x + w / 2,
						cy: y + h / 2,
						bbox: p.bbox,
						class: p.class,
						score: p.score
					};
				});

				console.log(`Филтрирани превозни средства: ${vehicles.length}`);

				// Актуализиране на съществуващи обекти
				const updated = new Set();
				const toDelete = [];

				objectsRef.current.forEach((obj, id) => {
					let bestIdx = -1, bestDist = Infinity;
					
					vehicles.forEach((v, i) => {
						if (updated.has(i)) return;
						const dist = euclidean(obj, v);
						if (dist < bestDist) { 
							bestDist = dist; 
							bestIdx = i; 
						}
					});

					if (bestIdx !== -1 && bestDist < maxDist) {
						const v = vehicles[bestIdx];
						objectsRef.current.set(id, { 
							...v, 
							lost: 0,
							id: id
						});
						updated.add(bestIdx);
					} else {
						const lost = obj.lost + 1;
						if (lost >= maxLost) {
							toDelete.push(id);
						} else {
							objectsRef.current.set(id, { ...obj, lost });
						}
					}
				});

				// Изтриване на загубени обекти
				toDelete.forEach(id => objectsRef.current.delete(id));

				// Добавяне на нови обекти
				let newVehicles = 0;
				vehicles.forEach((v, i) => {
					if (updated.has(i)) return;
					if (v.cy < topIgnoreY) {
						console.log(`Превозно средство игнорирано - над линията: cy=${v.cy}, topIgnoreY=${topIgnoreY}`);
						return;
					}

					const newId = nextIdRef.current++;
					objectsRef.current.set(newId, { 
						...v, 
						lost: 0,
						id: newId
					});
					newVehicles++;
					console.log(`Ново превозно средство засечено! ID: ${newId}, Тип: ${v.class}, Точност: ${v.score.toFixed(2)}`);
				});

				if (newVehicles > 0) {
					setCount(c => {
						const newCount = c + newVehicles;
						console.log(`Общо превозни средства: ${newCount} (+${newVehicles})`);
						return newCount;
					});
				}

				// Рисуване на засечените превозни средства
				objectsRef.current.forEach(obj => {
					const [x, y, w, h] = obj.bbox;
					
					// Рамка около превозното средство
					ctx.strokeStyle = "#ff0000";
					ctx.lineWidth = 3;
					ctx.strokeRect(x, y, w, h);
					
					// Етикет с информация
					ctx.fillStyle = "#ff0000";
					ctx.font = "14px Arial";
					const label = `${obj.class} (${(obj.score * 100).toFixed(0)}%)`;
					
					// Фон за текста
					const textWidth = ctx.measureText(label).width;
					ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
					ctx.fillRect(x, y - 25, textWidth + 10, 20);
					
					// Текст
					ctx.fillStyle = "#ffffff";
					ctx.fillText(label, x + 5, y - 10);
					
					// ID на обекта
					ctx.fillStyle = "#ffff00";
					ctx.font = "12px Arial";
					ctx.fillText(`ID: ${obj.id}`, x, y + h + 15);
				});

				// Информация за статуса
				ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
				ctx.fillRect(10, 10, 300, 80);
				ctx.fillStyle = "#ffffff";
				ctx.font = "14px Arial";
				ctx.fillText(`Активни обекти: ${objectsRef.current.size}`, 20, 30);
				ctx.fillText(`Общо засечени: ${count}`, 20, 50);
				ctx.fillText(`Модел зареден: ✓`, 20, 70);

			} catch (err) {
				console.error("Грешка при обработка на кадъра:", err);
				setError("Грешка при обработка на видеото");
			}
		};

		// Инициализация
		initializeModel();

		// Стартиране на интервала за обработка
		interval = setInterval(processFrame, frameMs);

		return () => {
			isMounted = false;
			if (interval) clearInterval(interval);
		};
	}, [topIgnoreY, maxDist, maxLost, frameMs]);

	useEffect(() => {
		if (count > 0) {
			updateVehicleCount(count);
		}
	}, [count]);

	return { count, isModelLoaded, error };
}