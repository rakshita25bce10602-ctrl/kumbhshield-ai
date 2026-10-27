import { useState } from "react";
import {
	MapContainer,
	TileLayer,
	CircleMarker,
	Popup,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const facilities = [
	{
		id: "medical-a",
		name: "Medical Help Point A",
		type: "Medical Facility",
		position: [25.4335, 81.849],
		risk: "Facility",
	},
	{
		id: "exit-a",
		name: "Emergency Exit A",
		type: "Emergency Exit",
		position: [25.44, 81.855],
		risk: "Exit",
	},
];

// Illustrative positions only; these are not verified operational locations.
const crowdZonePositions = {
	"Sangam Ghat": [25.4358, 81.8463],
	"Sector 4": [25.438, 81.851],
	"Main Entrance": [25.442, 81.843],
	"Medical Zone": [25.4335, 81.849],
};

const riskColors = {
	High: "#ef4444",
	Medium: "#f59e0b",
	Low: "#22c55e",
	Facility: "#38bdf8",
	Exit: "#a78bfa",
};

function MapResizer() {
	const map = useMap();

	return null;
}

export default function CrowdMap({ zones = [] }) {
	const [selectedType, setSelectedType] = useState("All");

	// Build crowd markers from the dashboard's current zone data.
	const crowdLocations = zones.map((zone, index) => {
		const position =
			crowdZonePositions[zone.name] ??
			[25.438 + index * 0.002, 81.849 + index * 0.002];

		const crowd = Number(
			zone.crowd ?? zone.occupancy ?? zone.percentage ?? 0
		);

		const risk =
			zone.risk ??
			(crowd >= 70 ? "High" : crowd >= 50 ? "Medium" : "Low");

		return {
			id: `zone-${zone.name}`,
			name: zone.name,
			type: "Crowd Zone",
			position,
			crowd,
			risk,
		};
	});

	const locations = [...crowdLocations, ...facilities];

	const filteredLocations =
		selectedType === "All"
			? locations
			: locations.filter((item) => item.type === selectedType);

	return (
		<section className="panel map-panel" id="map">
			<div className="panel-heading">
				<div>
					<h3>GIS Crowd &amp; Safety Map</h3>
					<p>Illustrative locations for the project demonstration</p>
				</div>
				<span className="count-badge">
					{filteredLocations.length} markers
				</span>
			</div>

			<div className="map-filters">
				{["All", "Crowd Zone", "Medical Facility", "Emergency Exit"].map(
					(type) => (
						<button
							key={type}
							className={`map-filter ${
								selectedType === type ? "selected" : ""
							}`}
							onClick={() => setSelectedType(type)}
						>
							{type}
						</button>
					)
				)}
			</div>

			<div className="map-container">
				<MapContainer
					center={[25.438, 81.849]}
					zoom={14}
					minZoom={12}
					maxZoom={19}
					scrollWheelZoom
					style={{ height: "410px", width: "100%" }}
				>
					<MapResizer />

					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{filteredLocations.map((item) => (
						<CircleMarker
							key={item.id}
							center={item.position}
							radius={
								item.type === "Crowd Zone"
									? 8 + Math.min(item.crowd, 100) / 8
									: 9
							}
							pathOptions={{
								color: riskColors[item.risk] ?? "#94a3b8",
								fillColor: riskColors[item.risk] ?? "#94a3b8",
								fillOpacity: 0.7,
								weight: 2,
							}}
						>
							<Popup>
								<strong>{item.name}</strong>
								<br />
								Type: {item.type}
								{item.type === "Crowd Zone" && (
									<>
										<br />
										Illustrative crowd level: {item.crowd}%
										<br />
										Risk category: {item.risk}
									</>
								)}
								<br />
								<small>Demo data — verify before real-world use.</small>
							</Popup>
						</CircleMarker>
					))}
				</MapContainer>
			</div>

			<div className="map-legend">
				{Object.entries(riskColors).map(([label, color]) => (
					<div className="legend-item" key={label}>
						<span style={{ backgroundColor: color }} />
						{label}
					</div>
				))}
			</div>

			<p className="data-note">
				Crowd levels and risk categories use dashboard demo data.
				Facility and exit locations are illustrative, not verified.
				Map tiles require an internet connection.
			</p>
		</section>
	);
}
