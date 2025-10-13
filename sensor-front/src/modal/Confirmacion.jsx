import React from 'react';

export default function Confirmacion({ sensorName, onConfirm, onCancel }) {
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar ocultar sensor</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p>¿Está seguro que desea ocultar el sensor "{sensorName}"?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>Ocultar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
