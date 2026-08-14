import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiCalendar, FiClock, FiMapPin, FiUsers, 
  FiPlusCircle, FiTrash2, FiSend, FiCheckCircle, 
  FiAlertCircle, FiActivity, FiLogOut, FiMonitor
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { campAPI, authAPI, hospitalAPI } from '../../services/api';

function StudentRegistrationsTable({ filteredRegistrations, regSearch, setRegSearch, handleToggleStatus, handleDeleteRegistration }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '24px auto 0 auto', width: '100%' }}>
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📋 Health Camp Student Attendance & Registrations
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>
              Real-time table of all campus students registered to attend active health camps.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="🔍 Search student, UID, email, camp..."
              value={regSearch}
              onChange={(e) => setRegSearch(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                width: '260px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            <button
              type="button"
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + ["S.No,Student Name,Student UID,Email,Phone,Department,Camp Title,Venue,Event Date,Registration Date,Status"]
                  .concat(filteredRegistrations.map((r, i) => `${i+1},"${r.studentName}","${r.studentUid}","${r.studentEmail}","${r.studentPhone}","${r.department}","${r.campTitle}","${r.venue}","${r.campDate}","${r.registeredAt}","${r.status}"`))
                  .join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Health_Camp_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Exported student registrations table to CSV!');
              }}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Count Banner */}
        <div style={{ marginBottom: '16px', padding: '10px 16px', background: 'rgba(13, 148, 136, 0.06)', borderLeft: '4px solid #0d9488', borderRadius: '0 10px 10px 0', color: '#0f766e', fontWeight: 600, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Total Registrations Recorded: <strong>{filteredRegistrations.length}</strong> student(s)</span>
          <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '700' }}>● Auto-synced from Student Portal</span>
        </div>

        {/* Responsive Table Container */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #cbd5e1', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#334155', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>#</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>Student Name & UID</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>Contact & Dept</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>Registered Health Camp</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>Venue & Event Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1' }}>Registered On</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No student registrations recorded matching "{regSearch}".
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9' }}>{idx + 1}</td>
                    
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>🎓 {item.studentName}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '700' }}>UID: {item.studentUid}</span>
                    </td>
                    
                    <td style={{ padding: '12px 14px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>📧 {item.studentEmail}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>📞 {item.studentPhone}</div>
                      <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {item.department}
                      </span>
                    </td>
                    
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong style={{ color: '#0f766e', display: 'block', fontSize: '0.88rem' }}>🏥 {item.campTitle}</strong>
                    </td>
                    
                    <td style={{ padding: '12px 14px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>📍 {item.venue}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>📅 {item.campDate}</div>
                    </td>
                    
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      {item.registeredAt}
                    </td>
                    
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        style={{
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '30px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          minWidth: '105px',
                          lineHeight: '1.2',
                          background: item.status === 'Attending' ? '#dcfce7' : item.status === 'Completed' ? '#dbeafe' : '#fee2e2',
                          color: item.status === 'Attending' ? '#16a34a' : item.status === 'Completed' ? '#2563eb' : '#ef4444',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                        }}
                        title="Click to toggle status"
                      >
                        <span style={{ fontSize: '0.7rem' }}>●</span> {item.status}
                      </button>
                    </td>
                    
                    <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRegistration(item.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: '1px solid #fca5a5',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

function RecordDetailModal({ recordUser, onClose }) {
  if (!recordUser) return null;

  const role = recordUser.role || 'PATIENT';
  const name = recordUser.name || recordUser.hospitalName || recordUser.doctorName || 'User Record';
  const email = recordUser.email || 'N/A';
  const phone = recordUser.phone || recordUser.contact || '+91 98765 12345';
  const id = recordUser.id || recordUser.uid || 'MED-2026-99';
  const department = recordUser.department || recordUser.specialization || recordUser.type || 'General Healthcare';

  const downloadSummary = () => {
    const content = `MEDASTRAQ UNIFIED HEALTHCARE PLATFORM
==============================================
HEALTH RECORD SUMMARY REPORT
Generated On: ${new Date().toLocaleString()}

PATIENT / USER DETAILS:
-----------------------
Name: ${name}
Role / Portal: ${role}
Platform UID: ${id}
Email: ${email}
Phone: ${phone}
Department / Specialty: ${department}

CLINICAL & MEDICAL PROFILE:
---------------------------
Blood Group: ${recordUser.bloodGroup || 'O+ Positive'}
Height / Weight: ${recordUser.height || '170 cm'} / ${recordUser.weight || '65 kg'}
Known Allergies: ${recordUser.allergies || 'No known drug allergies (NKDA)'}
Chronic Conditions: ${recordUser.conditions || 'Nil - Cleared in Campus Screening'}
Emergency Contact: ${recordUser.emergencyContact || 'Gaurav Sharma (+91 98123 99887)'}

RECENT HEALTH CHECKUPS & CONSULTATIONS:
--------------------------------------
1. 10 Aug 2026 - Campus Health Checkup Camp - Attended (Vitals Normal)
2. 15 Jul 2026 - General OPD Consultation - Prescribed Multivitamins
3. 02 May 2026 - Annual Campus Physical Screening - Approved Fit

==============================================
CONFIDENTIAL - MedAstraQ Health System`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Health_Record_${name.replace(/\s+/g, '_')}_${id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded patient health record summary!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          padding: '28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: '#0d9488', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ● {role} Profile
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
              {name}
            </h2>
            <span style={{ fontSize: '0.84rem', color: '#0d9488', fontWeight: 700 }}>UID: {id}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Contact Details Grid */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px 20px', border: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Email Address</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>📧 {email}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Phone Number</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>📞 {phone}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Department / Field</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f766e' }}>🏛️ {department}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Account Security</span>
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '2px' }}>
                ✓ Verified Account
              </span>
            </div>
          </div>

          {/* Medical Profile Summary */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🩺 Medical & Health Record Summary
            </h3>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Blood Group</span>
                <strong style={{ color: '#ef4444', fontSize: '1rem' }}>🩸 {recordUser.bloodGroup || 'O+ (Positive)'}</strong>
              </div>
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Vitals (Ht / Wt)</span>
                <strong style={{ color: '#0f172a' }}>📏 {recordUser.height || '172 cm'} / ⚖️ {recordUser.weight || '68 kg'}</strong>
              </div>
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Allergies</span>
                <strong style={{ color: '#334155' }}>⚠️ {recordUser.allergies || 'No Drug Allergies (NKDA)'}</strong>
              </div>
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>Emergency Contact</span>
                <strong style={{ color: '#0d9488' }}>🚨 {recordUser.emergencyContact || '+91 98123 99887'}</strong>
              </div>
            </div>
          </div>

          {/* Recent Consultations Log */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 Recent Consultations & Camp Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #0d9488', fontSize: '0.85rem' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>🏥 Campus Health Checkup Camp - Attended</strong>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Date: 10 Aug 2026 | Status: Completed (Vitals Normal)</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #2563eb', fontSize: '0.85rem' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>🩺 General Physician OPD Visit</strong>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Date: 15 Jul 2026 | Prescribed: Multivitamins & B-Complex</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={downloadSummary}
            style={{
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
            }}
          >
            📥 Download Health Record
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Health Records Hub & Camp Registrations State
  const [activeTab, setActiveTab] = useState('camps');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedRecordUser, setSelectedRecordUser] = useState(null);

  const defaultMockRegistrations = [
    {
      id: 'reg-101',
      campTitle: 'Campus Free Eye & Dental Checkup Camp',
      campDate: '2026-08-10',
      venue: 'CU Auditorium Hall 2',
      studentName: 'Rahul Sharma',
      studentUid: '22BCS10145',
      studentEmail: 'rahul.sharma@cumail.in',
      studentPhone: '+91 98765 12345',
      department: 'Computer Science (BE)',
      registeredAt: '8/10/2026, 10:15:00 AM',
      status: 'Attending'
    },
    {
      id: 'reg-102',
      campTitle: 'Campus Free Eye & Dental Checkup Camp',
      campDate: '2026-08-10',
      venue: 'CU Auditorium Hall 2',
      studentName: 'Priya Verma',
      studentUid: '22BCS10189',
      studentEmail: 'priya.verma@cumail.in',
      studentPhone: '+91 98765 67890',
      department: 'Biotechnology',
      registeredAt: '8/10/2026, 11:30:00 AM',
      status: 'Attending'
    },
    {
      id: 'reg-103',
      campTitle: 'Mega Blood Donation Drive 2026',
      campDate: '2026-08-15',
      venue: 'CU Sports Complex Hall',
      studentName: 'Amanpreet Singh',
      studentUid: '22BBA10022',
      studentEmail: 'aman.singh@cumail.in',
      studentPhone: '+91 98123 45678',
      department: 'Business Administration',
      registeredAt: '8/11/2026, 09:05:00 AM',
      status: 'Attending'
    },
    {
      id: 'reg-104',
      campTitle: 'Mega Blood Donation Drive 2026',
      campDate: '2026-08-15',
      venue: 'CU Sports Complex Hall',
      studentName: 'Simran Kaur',
      studentUid: '22BCS10411',
      studentEmail: 'simran.kaur@cumail.in',
      studentPhone: '+91 99887 76655',
      department: 'Computer Science (BE)',
      registeredAt: '8/11/2026, 02:40:00 PM',
      status: 'Attending'
    }
  ];

  const [registrations, setRegistrations] = useState([]);
  const [regSearch, setRegSearch] = useState('');

  const loadRegistrations = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('MedAstraQ_camp_registrations') || localStorage.getItem('MedAstraX_camp_registrations') || '[]');
      const combined = [...stored, ...defaultMockRegistrations];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
      });
      setRegistrations(Array.from(uniqueMap.values()));
    } catch (e) {
      setRegistrations(defaultMockRegistrations);
    }
  };

  useEffect(() => {
    loadRegistrations();
    window.addEventListener('medastraq_camp_registered', loadRegistrations);
    window.addEventListener('medastrax_camp_registered', loadRegistrations);
    return () => {
      window.removeEventListener('medastraq_camp_registered', loadRegistrations);
      window.removeEventListener('medastrax_camp_registered', loadRegistrations);
    };
  }, []);

  const handleToggleStatus = (id) => {
    const updated = registrations.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'Attending' ? 'Completed' : r.status === 'Completed' ? 'Cancelled' : 'Attending';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRegistrations(updated);
    localStorage.setItem('MedAstraQ_camp_registrations', JSON.stringify(updated.filter(r => r.id.startsWith('reg-') && !r.id.startsWith('reg-10'))));
    toast.success('Registration status updated');
  };

  const handleDeleteRegistration = (id) => {
    const updated = registrations.filter(r => r.id !== id);
    setRegistrations(updated);
    localStorage.setItem('MedAstraQ_camp_registrations', JSON.stringify(updated.filter(r => r.id.startsWith('reg-') && !r.id.startsWith('reg-10'))));
    toast.success('Student registration removed');
  };

  const filteredRegistrations = registrations.filter(r => {
    if (!regSearch.trim()) return true;
    const query = regSearch.toLowerCase();
    return (
      (r.studentName && r.studentName.toLowerCase().includes(query)) ||
      (r.studentUid && r.studentUid.toLowerCase().includes(query)) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(query)) ||
      (r.campTitle && r.campTitle.toLowerCase().includes(query)) ||
      (r.department && r.department.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('medastraq_reopen_camp_popup'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Blood Donation Drive');
  const [venue, setVenue] = useState('CU Sports Complex Hall');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 04:00 PM');
  const [targetAudience, setTargetAudience] = useState('All Portals (Students, Faculty, Staff & Doctors)');
  const [description, setDescription] = useState('');

  const campCategories = [
    { value: 'Blood Donation Drive', label: '🩸 Blood Donation Drive' },
    { value: 'General Health Checkup', label: '🩺 General Health Checkup' },
    { value: 'Eye & Vision Care Camp', label: '👁️ Eye & Vision Care Camp' },
    { value: 'Dental Care & Hygiene Camp', label: '🦷 Dental Care & Hygiene Camp' },
    { value: 'Fitness & Body Composition Assessment', label: '🏋️ Fitness & Body Composition Assessment' },
    { value: 'Mental Health Awareness Drive', label: '🧠 Mental Health Awareness Drive' },
    { value: 'Vaccination & Immunization Drive', label: '💉 Vaccination & Immunization Drive' }
  ];

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await campAPI.getAll();
      setCamps(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load scheduled camps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    fetchUsersAndHospitals();
  }, []);

  const fetchUsersAndHospitals = async () => {
    try {
      setUsersLoading(true);
      const [usersRes, hospitalsRes] = await Promise.all([
        authAPI.getAllUsers(),
        hospitalAPI.getAll()
      ]);
      setUsers(usersRes.data || []);
      // Map hospitals to look like users with a role
      const hospitalsData = (hospitalsRes.data || []).map(h => ({
        ...h,
        role: 'HOSPITAL',
        id: h.id.toString().startsWith('hospital') ? h.id : `hospital-${h.id}`,
        email: h.email || 'contact@hospital.com'
      }));
      setHospitals(hospitalsData);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load records.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleScheduleCamp = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a Camp Title.');
      return;
    }
    if (!venue.trim()) {
      toast.error('Please specify a Venue / Location.');
      return;
    }
    if (!date) {
      toast.error('Please choose a Date.');
      return;
    }

    try {
      setSubmitting(true);
      const newCampData = {
        title: title.trim(),
        category,
        venue: venue.trim(),
        date,
        timeSlot: timeSlot.trim(),
        targetAudience,
        description: description.trim() || 'Free health assessment and consultation provided for all participants.'
      };

      const res = await campAPI.create(newCampData);
      const createdCamp = res.data;

      localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(createdCamp || newCampData));
      window.dispatchEvent(new Event('medastrax_camp_updated'));

      toast.success(`Health Camp "${createdCamp.title || title}" scheduled & broadcasted to all portals! 📢`, { duration: 5000 });

      setTitle('');
      setDescription('');
      fetchCamps();
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule camp. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCamp = async (campId) => {
    try {
      await campAPI.delete(campId);
      toast.success('Camp removed successfully.');
      window.dispatchEvent(new Event('medastrax_camp_updated'));
      fetchCamps();
    } catch (err) {
      toast.error('Failed to delete camp.');
    }
  };

  const handleRebroadcast = (camp) => {
    localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(camp));
    window.dispatchEvent(new Event('medastrax_camp_updated'));
    toast.success(`Re-broadcasted notification for "${camp.title}" to all portals! 📢`);
  };

  const allRecords = [...users.filter(u => u.role !== 'HOSPITAL'), ...hospitals];

  const filteredUsers = allRecords.filter(u => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'STUDENT') return u.role === 'PATIENT' && !u.isFaculty;
    if (roleFilter === 'FACULTY') return u.role === 'PATIENT' && u.isFaculty;
    return u.role === roleFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', color: '#0f172a', fontFamily: 'sans-serif' }}>
      
      {/* Admin Portal Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#ffffff', padding: '12px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)' }}>
            <FiShield size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Admin Portal
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Manage scheduled drives and monitor role-aware health records across the platform.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* [BOUNTY 4] Button to access the Agent Observability Dashboard */}
          <button 
            type="button"
            onClick={() => navigate('/admin/observability')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            <FiMonitor /> Observability
          </button>
          
          <button 
            type="button" 
            className="cuims-icon-btn"
            title="Active Health Camp Announcement - Click to view details"
            onClick={() => window.dispatchEvent(new Event('medastrax_reopen_camp_popup'))}
            style={{ 
              fontSize: '1.15rem', 
              position: 'relative',
              background: 'rgba(13, 148, 136, 0.12)',
              border: '1px solid rgba(13, 148, 136, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🏥
            <span 
              style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)'
              }} 
            />
          </button>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d9488', background: '#ccfbf1', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#0d9488', borderRadius: '50%', display: 'inline-block' }}></span>
            Logged in as {user?.name || 'System Admin'}
          </span>
          <button 
            type="button"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* High-Visibility Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('camps')}
          style={{ 
            background: activeTab === 'camps' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#ffffff',
            color: activeTab === 'camps' ? '#ffffff' : '#334155',
            border: activeTab === 'camps' ? 'none' : '1px solid #cbd5e1',
            padding: '10px 22px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: activeTab === 'camps' ? '0 4px 14px rgba(13, 148, 136, 0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🏥 Camp Management
        </button>
        <button 
          onClick={() => setActiveTab('student-registrations')}
          style={{ 
            background: activeTab === 'student-registrations' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#ffffff',
            color: activeTab === 'student-registrations' ? '#ffffff' : '#334155',
            border: activeTab === 'student-registrations' ? 'none' : '1px solid #cbd5e1',
            padding: '10px 22px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: activeTab === 'student-registrations' ? '0 4px 14px rgba(13, 148, 136, 0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          📋 Student Camp Registrations
          <span style={{ background: activeTab === 'student-registrations' ? '#ffffff' : '#0d9488', color: activeTab === 'student-registrations' ? '#0d9488' : '#ffffff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.78rem', fontWeight: 900 }}>
            {registrations.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('records')}
          style={{ 
            background: activeTab === 'records' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#ffffff',
            color: activeTab === 'records' ? '#ffffff' : '#334155',
            border: activeTab === 'records' ? 'none' : '1px solid #cbd5e1',
            padding: '10px 22px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: activeTab === 'records' ? '0 4px 14px rgba(13, 148, 136, 0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          📂 Health Records Hub
        </button>
      </div>

      {activeTab === 'camps' && (
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Schedule Camp Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        >
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiPlusCircle color="#0d9488" /> Schedule New Health Camp
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.85rem' }}>
            This camp will be instantly broadcasted via notifications &amp; floating icon on Student, Faculty, Doctor, Pharmacy &amp; Hospital portals.
          </p>

          <form onSubmit={handleScheduleCamp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Camp Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Mega Blood Donation Drive 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Category / Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff' }}
              >
                {campCategories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Grid 2: Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Event Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Time Slot *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 04:00 PM"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Venue / Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Venue / Location *
              </label>
              <input
                type="text"
                placeholder="e.g. CU Sports Complex Hall / Block B Lawn"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Description &amp; Instructions
              </label>
              <textarea
                rows="3"
                placeholder="Details regarding checkup, blood tests, free consultation, donor certificate, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '8px',
                padding: '14px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiSend /> {submitting ? 'Broadcasting...' : 'Schedule & Broadcast Health Camp'}
            </button>

          </form>
        </motion.div>

        {/* RIGHT COLUMN: Scheduled Camps List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCalendar color="#0d9488" /> Active &amp; Scheduled Camps ({camps.length})
              </h2>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading camps...</div>
            ) : camps.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FiAlertCircle size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#475569' }}>No Health Camps Scheduled Yet</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>Fill out the form on the left to schedule a camp for campus users.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
                {camps.map((camp) => (
                  <div 
                    key={camp.id} 
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '3px 8px', borderRadius: '8px', display: 'inline-block', marginBottom: '6px' }}>
                          {camp.category}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {camp.title}
                        </h3>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
                        ✓ Broadcasted
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar color="#0d9488" size={14} /> <strong>Date:</strong> {camp.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock color="#0d9488" size={14} /> <strong>Time:</strong> {camp.timeSlot}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: '1 / -1' }}>
                        <FiMapPin color="#0d9488" size={14} /> <strong>Venue:</strong> {camp.venue}
                      </div>
                    </div>

                    {camp.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', lineHeight: '1.4' }}>
                        {camp.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => handleRebroadcast(camp)}
                        style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiSend size={12} /> Re-Broadcast Popup
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCamp(camp.id)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiTrash2 size={12} /> Cancel Camp
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}

      {activeTab === 'student-registrations' && (
        <StudentRegistrationsTable 
          filteredRegistrations={filteredRegistrations} 
          regSearch={regSearch} 
          setRegSearch={setRegSearch} 
          handleToggleStatus={handleToggleStatus} 
          handleDeleteRegistration={handleDeleteRegistration} 
        />
      )}

      {activeTab === 'records' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUsers color="#0d9488" /> Role-Aware Health Record Filters
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Filter health records and user profiles based on platform roles (Patient, Doctor, Hospital, Admin).
            </p>

            {/* Role Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['ALL', 'STUDENT', 'FACULTY', 'DOCTOR', 'HOSPITAL', 'ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  style={{
                    padding: '8px 20px', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    background: roleFilter === role ? '#0d9488' : '#f1f5f9',
                    color: roleFilter === role ? '#fff' : '#64748b',
                    border: 'none', boxShadow: roleFilter === role ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none'
                  }}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                </button>
              ))}
            </div>

            {/* Visible Count */}
            <div style={{ marginBottom: '24px', padding: '12px 20px', background: 'rgba(13, 148, 136, 0.05)', borderLeft: '4px solid #0d9488', borderRadius: '0 8px 8px 0', color: '#0f766e', fontWeight: 600 }}>
              Scoped Results: <span style={{ fontSize: '1.1rem' }}>{filteredUsers.length}</span> record(s) found for {roleFilter === 'ALL' ? 'All Roles' : roleFilter}.
            </div>

            {/* Scoped List Results */}
            {usersLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading records...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                <FiAlertCircle size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No records found for the selected role.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredUsers.map(u => {
                  const roleBadgeGradient = 
                    u.role === 'HOSPITAL' ? 'linear-gradient(135deg, #0284c7, #0369a1)' :
                    u.role === 'DOCTOR' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' :
                    u.role === 'PHARMACY' ? 'linear-gradient(135deg, #ec4899, #db2777)' :
                    u.role === 'ADMIN' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                    u.role === 'FACULTY' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                    'linear-gradient(135deg, #0d9488, #0f766e)';

                  return (
                    <div key={u.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <div>
                        {/* Header: Title + Role Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>
                            {u.role === 'HOSPITAL' ? '🏥 ' : u.role === 'DOCTOR' ? '🩺 ' : u.role === 'PHARMACY' ? '💊 ' : u.role === 'ADMIN' ? '🛡️ ' : '🎓 '}
                            {u.name || u.hospitalName}
                          </h3>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '5px 12px',
                            borderRadius: '20px',
                            background: roleBadgeGradient,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}>
                            {u.role}
                          </span>
                        </div>

                        {/* Details */}
                        <div style={{ color: '#475569', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div><strong style={{ color: '#64748b' }}>ID:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem', color: '#0f766e' }}>{u.id}</code></div>
                          <div><strong style={{ color: '#64748b' }}>Email:</strong> 📧 {u.email}</div>
                          {u.phone && <div><strong style={{ color: '#64748b' }}>Phone:</strong> 📞 {u.phone}</div>}
                          {u.address && <div><strong style={{ color: '#64748b' }}>Address:</strong> 📍 {u.address}</div>}
                          {u.specialization && <div><strong style={{ color: '#64748b' }}>Specialization:</strong> 🩺 {u.specialization}</div>}
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Verified Record</span>
                        <button 
                          type="button"
                          onClick={() => setSelectedRecordUser(u)}
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#0d9488',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s'
                          }}
                        >
                          👁️ View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      <AnimatePresence>
        {selectedRecordUser && (
          <RecordDetailModal
            recordUser={selectedRecordUser}
            onClose={() => setSelectedRecordUser(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
