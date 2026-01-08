import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from '../styles/ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className={styles.iconWrapper}>
                    <AlertTriangle size={32} className={styles.icon} />
                </div>

                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${isDangerous ? styles.danger : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
