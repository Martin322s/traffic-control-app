import * as XLSX from "xlsx";

export function exportToExcel(data) {
	const worksheet = XLSX.utils.json_to_sheet(
		data.map(e => ({
			Дата: e.date,
			"Брой МПС": e.count
		}))
	);

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "История");

	XLSX.writeFile(workbook, "vehicle_counts.xlsx");
}