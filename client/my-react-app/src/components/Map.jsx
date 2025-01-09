import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issues with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Map = ({ locations }) => {
  return (
    <MapContainer
      center={[41.902782, 12.496366]} // Default to Rome
      zoom={5}
      style={{ height: "400px", width: "100%", marginBottom: "20px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[parseFloat(location.Latitude), parseFloat(location.Longitude)]}
        >
          <Popup>
            <strong>{location.Destination}</strong>
            <br />
            {location.Country}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
