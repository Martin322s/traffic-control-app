import React, { useRef } from "react";
import { useTrafficCounter } from "../hooks/useTrafficCounter";
import { useVehicleCountFromFirebase } from "../hooks/useVehicleCountFromFirebase";
import { useDailyVehicleCounts } from "../hooks/useDailyVehicleCounts";
import { exportToExcel } from "../utils/exportToCSV";
import styles from "./VideoCanvas.module.css";

export default function VideoCanvas() {
	const canvasRef = useRef(null);
	const imgRef = useRef(null);
	const carsCount = useVehicleCountFromFirebase();
	const history = useDailyVehicleCounts();

	useTrafficCounter(canvasRef, imgRef, {
		topIgnoreY: 150,
		maxDist: 60,
		maxLost: 3,
		frameMs: 1000
	});

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
					<div className={styles.statusIndicator}>
						<div className={styles.statusDot}></div>
						<span className={styles.statusText}>Системата е активна</span>
					</div>
				</div>

				<div className={styles.videoSection}>
					<h2 className={styles.sectionTitle}>📹 Видео поток от камерата</h2>
					<div className={styles.videoContainer}>
						<img
							ref={imgRef}
							src="https://camera-proxy-server-211m.onrender.com/cam"
							alt="Видео поток от камерата"
							className={styles.hiddenImage}
						/>
						<canvas
							ref={canvasRef}
							width={640}
							height={480}
							className={styles.videoCanvas}
						/>
						<div className={styles.videoOverlay}>
							<div className={styles.recordingIndicator}>
								<div className={styles.recordingDot}></div>
								REC
							</div>
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