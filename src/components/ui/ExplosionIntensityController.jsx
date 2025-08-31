import { useState } from "react";
import { GameState } from "../../App";

export function ExplosionIntensityController() {
  const [intensity, setIntensity] = useState(1.0);

  const handleIntensityChange = (e) => {
    const newIntensity = parseFloat(e.target.value);
    setIntensity(newIntensity);
    GameState.explosionIntensity = newIntensity;
  };

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "rgba(0, 0, 0, 0.8)",
      padding: "15px",
      borderRadius: "8px",
      color: "white",
      fontFamily: "Arial, sans-serif",
      zIndex: 1000,
      minWidth: "200px"
    }}>
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
        💥 Explosion Intensity
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={intensity}
          onChange={handleIntensityChange}
          style={{
            flex: 1,
            height: "6px",
            borderRadius: "3px",
            background: "linear-gradient(to right, #ff4444, #ffaa00, #ffff00)",
            outline: "none",
            cursor: "pointer"
          }}
        />
        <span style={{ 
          minWidth: "40px", 
          textAlign: "center",
          fontWeight: "bold",
          color: intensity > 2.0 ? "#ff4444" : intensity > 1.5 ? "#ffaa00" : "#ffffff"
        }}>
          {intensity.toFixed(1)}x
        </span>
      </div>
      <div style={{ 
        fontSize: "12px", 
        marginTop: "5px", 
        opacity: 0.8,
        textAlign: "center"
      }}>
        {intensity < 0.5 && "💨 Weak"}
        {intensity >= 0.5 && intensity < 1.0 && "💣 Normal"}
        {intensity >= 1.0 && intensity < 1.5 && "💥 Strong"}
        {intensity >= 1.5 && intensity < 2.0 && "🔥 Powerful"}
        {intensity >= 2.0 && "☢️ Nuclear"}
      </div>
    </div>
  );
}
