import React from 'react';
import jsPDF from 'jspdf';
import type { Estudiante } from '../../api/estudiantes';


interface ExpedienteAlumnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
}

const ExpedienteAlumnoModal: React.FC<ExpedienteAlumnoModalProps> = ({ isOpen, onClose, estudiante }) => {
  if (!isOpen || !estudiante) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text('EXPEDIENTE DEL ESTUDIANTE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Sistema de Gestión Educativa INBACOOP', 105, 28, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Datos Personales', 20, 45);
    
    doc.setFontSize(11);
    doc.text(`Nombre Completo: ${estudiante.persona.nombres} ${estudiante.persona.apellidos}`, 20, 55);
    doc.text(`CUI: ${estudiante.persona.cui}`, 20, 62);
    doc.text(`Fecha de Nacimiento: ${new Date(estudiante.persona.fecha_nacimiento).toLocaleDateString()}`, 20, 69);
    doc.text(`Dirección: ${estudiante.persona.direccion || 'No registrada'}`, 20, 76);
    doc.text(`Estado actual: ${estudiante.estado_nombre}`, 20, 83);

    doc.line(20, 90, 190, 90);
    
    doc.text(`Reporte generado el: ${new Date().toLocaleDateString()}`, 20, 100);

    doc.save(`Expediente_${estudiante.persona.cui}.pdf`);
  };


  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>Expediente Académico</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={handleDownloadPDF}>
              📥 Descargar PDF
            </button>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-form" style={{ padding: '32px' }}>
          <div className="expediente-header" style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div className="user-avatar-lg" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800 }}>
              {estudiante.persona.nombres.charAt(0)}
            </div>
            <div className="expediente-info">
              <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{estudiante.persona.nombres} {estudiante.persona.apellidos}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>CUI: {estudiante.persona.cui}</p>
              <span className={`badge ${estudiante.estado_nombre === 'Activo' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                {estudiante.estado_nombre}
              </span>
            </div>
          </div>

          <div className="expediente-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="info-section">
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '14px', textTransform: 'uppercase' }}>Datos Personales</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Fecha de Nacimiento</label>
                  <span>{new Date(estudiante.persona.fecha_nacimiento).toLocaleDateString()}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Dirección</label>
                  <span>{estudiante.persona.direccion || 'No registrada'}</span>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '14px', textTransform: 'uppercase' }}>Resumen Académico</h4>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  El historial de inscripciones y notas se cargará en la siguiente fase de desarrollo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Cerrar Expediente</button>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteAlumnoModal;
