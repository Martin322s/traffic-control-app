import React, { useRef } from "react";
import { useTrafficCounter } from "../hooks/useTrafficCounter";

export default function VideoCanvas() {
	const canvasRef = useRef(null);
	const imgRef = useRef(null);

	const count = useTrafficCounter(canvasRef, imgRef, {
		topIgnoreY: 150,
		maxDist: 60,
		maxLost: 3,
		frameMs: 1000
	});

	return (
		<div style={{ textAlign: "center" }}>
			<h3>Общо засечени МПС: {count}</h3>

			<img
				ref={imgRef}
				src="/cam/mjpg/video.mjpg?camera=1"
				alt="stream"
				style={{ display: "none" }}
			/>

			<canvas
				ref={canvasRef}
				width={640}
				height={480}
				style={{ border: "1px solid #888", borderRadius: "6px" }}
			/>
		</div>
	);
}