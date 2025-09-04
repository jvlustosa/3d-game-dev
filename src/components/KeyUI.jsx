import { FaKey } from "react-icons/fa";
import { useState, useEffect } from "react";

export const KeyUI = ({ collectedKeys, totalKeys = 3 }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  useEffect(() => {
    if (collectedKeys.length > 0) {
      setNotificationText(`Chave ${collectedKeys.length}/${totalKeys} coletada!`);
      setShowNotification(true);
      
      // Hide notification after 2 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [collectedKeys.length, totalKeys]);

  return (
    <>
      {/* Key Counter */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          zIndex: 1000,
        }}
      >
        <FaKey color="#FFD700" size={20} />
        <span>{collectedKeys.length}/{totalKeys}</span>
      </div>

      {/* Notification */}
      {showNotification && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#FFD700",
            padding: "15px 25px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 1001,
            animation: "fadeInOut 2s ease-in-out",
          }}
        >
          <FaKey size={24} />
          <span>{notificationText}</span>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </>
  );
};
