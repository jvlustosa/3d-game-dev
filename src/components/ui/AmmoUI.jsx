import { useSnapshot } from "valtio";
import { GameState } from "../../App";

export function AmmoUI() {
  const { ammo, canShoot, shootCooldown } = useSnapshot(GameState);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      minWidth: '150px'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '20px' }}>💣</span>
          <span>Ammo: {ammo}/10</span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          marginBottom: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(ammo / 10) * 100}%`,
            height: '100%',
            background: ammo > 3 ? '#4CAF50' : ammo > 1 ? '#FF9800' : '#F44336',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {!canShoot && shootCooldown > 0 && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.3)',
            padding: '5px',
            borderRadius: '5px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Cooldown: {shootCooldown.toFixed(1)}s
            <div style={{
              width: '100%',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              marginTop: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((0.3 - shootCooldown) / 0.3) * 100}%`,
                height: '100%',
                background: '#ff4444',
                transition: 'width 0.1s ease'
              }} />
            </div>
          </div>
        )}
        
        {canShoot && (
          <div style={{
            background: 'rgba(0, 255, 0, 0.3)',
            padding: '5px',
            borderRadius: '5px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Ready to fire!
          </div>
        )}
      </div>
      
      <div style={{
        fontSize: '12px',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        Hold left click to charge
      </div>
    </div>
  );
}
