import React from 'react';

export default function Sensores({ hiddenSensors, showSensor, onClose }) {
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Sensores ocultos</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {hiddenSensors.length > 0 ? (
              hiddenSensors.map(name => (
                <div key={name} style={{ marginBottom: '0.5rem' }}>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => showSensor(name)}
                  >
                    {name} - Mostrar
                  </button>
                </div>
              ))
            ) : (
              <p>No existen más sensores ocultos para mostrar</p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
