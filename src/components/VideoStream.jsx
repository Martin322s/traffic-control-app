import React, { useRef, useEffect } from "react";

const VideoStream = () => {
	const imgRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const interval = setInterval(() => {
			const img = imgRef.current;
			const canvas = canvasRef.current;
			if (img && canvas) {
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div style={{ textAlign: "center" }}>
			<h2>Видеонаблюдение – Кръстовище</h2>
			<h3>Видеопоток от камера - на живо</h3>
			<img
				ref={imgRef}
				src="http://212.112.136.4:83/mjpg/video.mjpg?camera=1"
				alt="Video Stream"
				style={{ width: "640px", height: "auto", border: "2px solid #333", borderRadius: "8px" }}
			/>

			<h3>Кадър от камера за обработка - всяка секунда</h3>
			<canvas
				ref={canvasRef}
				width={640}
				height={480}
				style={{ display: "block", margin: "20px auto", border: "1px solid #888" }}
			/>
		</div>
	);
};

export default VideoStream;
