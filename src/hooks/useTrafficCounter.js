import { useEffect, useRef, useState } from "react";
import { loadModel } from "../services/tfModel";
import { euclidean } from "../utils/tracker";
import { updateVehicleCount } from "../utils/updateCount";

export function useTrafficCounter(canvasRef, imgRef, options = {}) {
	const topIgnoreY = options.topIgnoreY || 150;
	const maxDist = options.maxDist || 60;
	const maxLost = options.maxLost || 3;
	const frameMs = options.frameMs || 1000;

	const [count, setCount] = useState(0);
	const objectsRef = useRef(new Map());
	const nextIdRef = useRef(0);

	useEffect(() => {
		let model;
		let isMounted = true;

		loadModel().then(m => { if (isMounted) model = m; });

		const interval = setInterval(async () => {
			if (!model) return;
			const img = imgRef.current;
			const cvs = canvasRef.current;
			if (!img || !cvs) return;

			const ctx = cvs.getContext("2d");
			ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

			ctx.strokeStyle = "blue";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(0, topIgnoreY);
			ctx.lineTo(cvs.width, topIgnoreY);
			ctx.stroke();

			const detections = (await model.detect(cvs))
				.filter(p => p.class === "car" || p.class === "truck")
				.map(p => {
					const [x, y, w, h] = p.bbox;
					return {
						cx: x + w / 2,
						cy: y + h / 2,
						bbox: p.bbox
					};
				});

			const updated = new Set();

			objectsRef.current.forEach((obj, id) => {
				let bestIdx = -1, bestDist = Infinity;
				detections.forEach((d, i) => {
					const dist = euclidean(obj, d);
					if (dist < bestDist) { bestDist = dist; bestIdx = i; }
				});

				if (bestIdx !== -1 && bestDist < maxDist) {
					const d = detections[bestIdx];
					objectsRef.current.set(id, { ...d, lost: 0 });
					updated.add(bestIdx);
				} else {
					const lost = obj.lost + 1;
					if (lost >= maxLost) {
						objectsRef.current.delete(id);
					} else {
						objectsRef.current.set(id, { ...obj, lost });
					}
				}
			});

			detections.forEach((d, i) => {
				if (updated.has(i)) return;
				if (d.cy < topIgnoreY) return;

				const newId = nextIdRef.current++;
				objectsRef.current.set(newId, { ...d, lost: 0 });
				setCount(c => c + 1);
			});

			objectsRef.current.forEach(obj => {
				const [x, y, w, h] = obj.bbox;
				ctx.strokeStyle = "red";
				ctx.lineWidth = 2;
				ctx.strokeRect(x, y, w, h);
				ctx.fillStyle = "red";
				ctx.font = "14px Arial";
				ctx.fillText("car", x, y - 5);
			});

		}, frameMs);

		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [topIgnoreY, maxDist, maxLost, frameMs]);

	useEffect(() => {
		if (count > 0) {
			updateVehicleCount(count);
		}
	}, [count]);

	return count;
}