import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './taskCardStyles.css';

const TaskCard = ({
  task,
  isCompleted,
  onToggleCompletion,
  showAssignedBy = false,
  showAssignedTo = false,
}) => {
  const getPriorityColor = (priority) => {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'urgent':
        return { bg: '#fee2e2', color: '#991b1b', darkBg: '#7f1d1d', darkColor: '#fecaca' };
      case 'high':
        return { bg: '#ffedd5', color: '#9a3412', darkBg: '#7c2d12', darkColor: '#fed7aa' };
      case 'medium':
        return { bg: '#fef3c7', color: '#92400e', darkBg: '#78350f', darkColor: '#fde68a' };
      case 'low':
        return { bg: '#d1fae5', color: '#065f46', darkBg: '#064e3b', darkColor: '#a7f3d0' };
      default:
        return { bg: '#f3f4f6', color: '#1f2937', darkBg: '#1f2937', darkColor: '#e5e7eb' };
    }
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return 'Normal';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const getPriorityIcon = (priority) => {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'urgent': return '●';
      case 'high':   return '●';
      case 'medium': return '●';
      case 'low':    return '●';
      default:       return '●';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const priorityColors = getPriorityColor(task.priority);

  const styles = {
    card: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      opacity: isCompleted ? 0.72 : 1,
    },
    container: {
      display: 'flex',
      gap: '1rem',
    },
    checkboxButton: {
      flexShrink: 0,
      marginTop: '0.25rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      color: isCompleted ? '#16a34a' : '#00629b',
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity 0.2s',
    },
    content: {
      flex: 1,
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1rem',
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: '1rem',
      fontWeight: '700',
      color: isCompleted ? '#9ca3af' : '#0f172a',
      textDecoration: isCompleted ? 'line-through' : 'none',
      margin: 0,
      lineHeight: 1.4,
    },
    description: {
      color: '#4b5563',
      marginTop: '0.375rem',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    priorityBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      flexShrink: 0,
      background: priorityColors.bg,
      color: priorityColors.color,
    },
    metaInfo: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1rem',
      fontSize: '0.875rem',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#4b5563',
    },
    metaLabel: {
      color: '#4b5563',
    },
    metaValue: {
      fontWeight: '500',
      color: '#0f172a',
    },
  };

  return (
    <div className="task-card" style={styles.card}>
      <div className="task-container" style={styles.container}>
        {/* Checkbox */}
        {onToggleCompletion && (
          <button
            onClick={onToggleCompletion}
            style={styles.checkboxButton}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {isCompleted ? (
              <CheckCircleIcon style={{ fontSize: '24px' }} />
            ) : (
              <RadioButtonUncheckedIcon style={{ fontSize: '24px' }} />
            )}
          </button>
        )}

        {/* Content */}
        <div className="task-content" style={styles.content}>
          <div className="task-header" style={styles.header}>
            <div className="task-title-section" style={styles.titleSection}>
              <h3 style={styles.title}>{task.title}</h3>
              <p style={styles.description}>{task.description}</p>
            </div>

            {/* Priority Badge */}
            <span className="task-priority-badge" style={styles.priorityBadge}>
              <span aria-hidden="true" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginRight: '0.3rem' }}>{getPriorityIcon(task.priority)}</span>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {/* Meta Information */}
          <div className="task-meta-info" style={styles.metaInfo}>
            <div className="task-meta-item" style={styles.metaItem}>
              <AccessTimeIcon style={{ fontSize: '16px' }} />
              <span>{formatDate(task.due_date)}</span>
              {isOverdue && <ErrorOutlineIcon style={{ fontSize: '16px', color: '#dc2626' }} />}
            </div>

            {showAssignedBy && task.assigned_by_name && (
              <div className="task-meta-item" style={styles.metaItem}>
                <span style={styles.metaLabel}>Assigned by:</span>
                <span style={styles.metaValue}>{task.assigned_by_name}</span>
              </div>
            )}

            {showAssignedTo && task.assigned_to_names && (
              <div
                className="task-meta-item"
                style={{
                  ...styles.metaItem,
                  ...(isCompleted
                    ? {
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '0.35rem',
                        marginTop: '0.15rem',
                      }
                    : {}),
                }}
              >
                <span style={styles.metaLabel}>Assigned to:</span>
                <span style={styles.metaValue}>{task.assigned_to_names}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

