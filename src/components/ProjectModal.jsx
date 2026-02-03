import React, { useState, useEffect } from 'react';
import './ProjectModal.css';

const ProjectModal = ({ project, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        client: '',
        productName: '',
        rawMaterial: '',
        capacity: '',
        startDate: '',
        endDate: '',
        dueDate: '',
        progress: 0,
        color: '#3b82f6',
        manager: {
            production: '',
            admin: '',
            delivery: ''
        },
        note: ''
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            // New project default dates
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, startDate: today, endDate: today, dueDate: today }));
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{project ? '프로젝트 편집' : '새 프로젝트 등록'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>발주처</label>
                            <input name="client" value={formData.client} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>제품명</label>
                            <input name="productName" value={formData.productName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>원료명</label>
                            <input name="rawMaterial" value={formData.rawMaterial} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>용량 (Kg)</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>색상 테마</label>
                            <input type="color" name="color" value={formData.color} onChange={handleChange} className="color-picker" />
                        </div>
                        <div className="form-group">
                            <label>진행률 (%)</label>
                            <input type="number" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} />
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="includeHolidays"
                                    checked={formData.includeHolidays}
                                    onChange={(e) => setFormData(prev => ({ ...prev, includeHolidays: e.target.checked }))}
                                />
                                <span>주말/공휴일 생산 포함</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>생산 시작일</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>생산 종료일</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>납기일</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label>담당자 (생산 / 관리 / 배송)</label>
                            <div className="manager-inputs">
                                <input placeholder="생산" name="manager.production" value={formData.manager.production} onChange={handleChange} />
                                <input placeholder="관리" name="manager.admin" value={formData.manager.admin} onChange={handleChange} />
                                <input placeholder="배송" name="manager.delivery" value={formData.manager.delivery} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label>기타 메모</label>
                            <textarea name="note" value={formData.note} onChange={handleChange} rows="3"></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {project && (
                            <button type="button" className="danger-btn" onClick={() => {
                                if (window.confirm('정말 삭제하시겠습니까?')) onDelete(project.id);
                            }}>삭제하기</button>
                        )}
                        <div className="footer-right">
                            <button type="button" onClick={onClose}>취소</button>
                            <button type="submit" className="primary">저장하기</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;
