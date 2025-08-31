import React from 'react';

export function AmmoUI({ ammo, canShoot, shootCooldown }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: '150px'
    }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Ammo:</strong> {ammo}/10
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Status:</strong> {canShoot ? 'Ready' : 'Reloading...'}
      </div>
      {shootCooldown > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Cooldown:</strong> {shootCooldown.toFixed(1)}s
        </div>
      )}
      <div style={{ 
        width: '100%', 
        height: '4px', 
        background: '#333', 
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(shootCooldown / 1.0) * 100}%`,
          height: '100%',
          background: canShoot ? '#4CAF50' : '#FF5722',
          transition: 'width 0.1s ease'
        }} />
      </div>
    </div>
  );
}
