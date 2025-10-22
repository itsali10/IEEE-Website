import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
      opacity: isCompleted ? 0.75 : 1,
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
      fontSize: '1.125rem',
      fontWeight: '600',
      color: isCompleted ? '#9ca3af' : '#0f172a',
      textDecoration: isCompleted ? 'line-through' : 'none',
      margin: 0,
    },
    description: {
      color: '#6b7280',
      marginTop: '0.25rem',
      fontSize: '0.9375rem',
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
      color: '#6b7280',
    },
    metaLabel: {
      color: '#6b7280',
    },
    metaValue: {
      fontWeight: '500',
      color: '#0f172a',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.container}>
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
        <div style={styles.content}>
          <div style={styles.header}>
            <div style={styles.titleSection}>
              <h3 style={styles.title}>{task.title}</h3>
              <p style={styles.description}>{task.description}</p>
            </div>

            {/* Priority Badge */}
            <span style={styles.priorityBadge}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {/* Meta Information */}
          <div style={styles.metaInfo}>
            <div style={styles.metaItem}>
              <AccessTimeIcon style={{ fontSize: '16px' }} />
              <span>{formatDate(task.due_date)}</span>
              {isOverdue && <ErrorOutlineIcon style={{ fontSize: '16px', color: '#dc2626' }} />}
            </div>

            {showAssignedBy && task.assigned_by_name && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Assigned by:</span>
                <span style={styles.metaValue}>{task.assigned_by_name}</span>
              </div>
            )}

            {showAssignedTo && task.assigned_to_names && (
              <div style={styles.metaItem}>
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

