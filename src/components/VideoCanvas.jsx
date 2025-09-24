import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { useTrafficCounter } from "../hooks/useTrafficCounter";
import { useVehicleCountFromFirebase } from "../hooks/useVehicleCountFromFirebase";
import { useDailyVehicleCounts } from "../hooks/useDailyVehicleCounts";
import { exportToExcel } from "../utils/exportToCSV";
import styles from "./VideoCanvas.module.css";

export default function VideoCanvas() {
	const canvasRef = useRef(null);
	const imgRef = useRef(null);
	const [imageStatus, setImageStatus] = useState("loading");
	const [imageError, setImageError] = useState(null);
	
	const carsCount = useVehicleCountFromFirebase();
	const history = useDailyVehicleCounts();

	const { count: detectedCount, isModelLoaded, error: modelError } = useTrafficCounter(canvasRef, imgRef, {
		topIgnoreY: 150,
		maxDist: 60,
		maxLost: 3,
		frameMs: 2000
	});

	useEffect(() => {
		const img = imgRef.current;
		if (!img) return;

		const handleLoad = () => {
			console.log("Изображението е заредено успешно");
			setImageStatus("loaded");
			setImageError(null);
		};

		const handleError = (e) => {
			console.error("Грешка при зареждане на изображението:", e);
			setImageStatus("error");
			setImageError("Не може да се свърже с камерата");
		};

		img.addEventListener('load', handleLoad);
		img.addEventListener('error', handleError);

		return () => {
			img.removeEventListener('load', handleLoad);
			img.removeEventListener('error', handleError);
		};
	}, []);

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>🚗 Система за мониторинг на трафика</h1>
				<p className={styles.subtitle}>Интелигентно разпознаване и отчитане на МПС в реално време</p>
			</header>

			<div className={styles.mainContent}>
				<div className={styles.statsCard}>
					<div className={styles.statItem}>
						<div className={styles.statNumber}>{carsCount}</div>
						<div className={styles.statLabel}>Общо засечени МПС днес</div>
					</div>
					<div className={styles.statItem}>
						<div className={styles.statNumber}>{detectedCount || 0}</div>
						<div className={styles.statLabel}>Засечени в момента</div>
					</div>
					<div className={styles.statusIndicator}>
						<div className={`${styles.statusDot} ${
							isModelLoaded && imageStatus === "loaded" ? styles.active : styles.inactive
						}`}></div>
						<span className={styles.statusText}>
							{isModelLoaded && imageStatus === "loaded" 
								? "Системата е активна" 
								: "Зареждане..."}
						</span>
					</div>
				</div>

				{(modelError || imageError) && (
					<div className={styles.errorCard}>
						<h3>⚠️ Грешка в системата</h3>
						{modelError && <p>AI модел: {modelError}</p>}
						{imageError && <p>Камера: {imageError}</p>}
					</div>
				)}

				<div className={styles.videoSection}>
					<h2 className={styles.sectionTitle}>📹 Видео поток от камерата</h2>
					<div className={styles.videoContainer}>
						<img
							ref={imgRef}
							src="https://camera-proxy-server-211m.onrender.com/cam"
							crossOrigin="anonymous"
							alt="stream"
							style={{ display: "none" }}
							onLoad={() => console.log("Image loaded")}
							onError={(e) => console.error("Image error:", e)}
						/>
						<canvas
							ref={canvasRef}
							width={640}
							height={480}
							className={styles.videoCanvas}
						/>
						<div className={styles.videoOverlay}>
							<div className={styles.recordingIndicator}>
								<div className={`${styles.recordingDot} ${
									imageStatus === "loaded" ? styles.recording : styles.paused
								}`}></div>
								{imageStatus === "loaded" ? "REC" : "PAUSE"}
							</div>
						</div>
						<div className={styles.debugInfo}>
							<div>Модел: {isModelLoaded ? "✓" : "⏳"}</div>
							<div>Камера: {imageStatus === "loaded" ? "✓" : imageStatus === "error" ? "✗" : "⏳"}</div>
							<div>Засечени: {detectedCount || 0}</div>
						</div>
					</div>
				</div>

				<div className={styles.actionsSection}>
					<button
						onClick={() => exportToExcel(history)}
						className={styles.exportButton}
					>
						<span className={styles.buttonIcon}>📊</span>
						Експортирай статистика
						<span className={styles.buttonSubtext}>(.xlsx формат)</span>
					</button>
				</div>

				<div className={styles.historySection}>
					<h2 className={styles.sectionTitle}>📈 Исторически данни</h2>
					<div className={styles.tableContainer}>
						<table className={styles.historyTable}>
							<thead>
								<tr>
									<th>Дата</th>
									<th>Брой МПС</th>
									<th>Статус</th>
								</tr>
							</thead>
							<tbody>
								{history.map(entry => (
									<tr key={entry.date}>
										<td>
											<div className={styles.dateCell}>
												<span className={styles.dateText}>{entry.date}</span>
											</div>
										</td>
										<td>
											<div className={styles.countCell}>
												<span className={styles.countNumber}>{entry.count}</span>
											</div>
										</td>
										<td>
											<div className={styles.statusCell}>
												<span className={styles.statusBadge}>
													{entry.count > 0 ? "Активен" : "Неактивен"}
												</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}