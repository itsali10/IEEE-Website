import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient';

const HRReviews = () => {
  const { user, profile } = useAuth() || {};

  const [hrCommitteeData, setHrCommitteeData] = useState([]);
  const [hrOverviewLoading, setHrOverviewLoading] = useState(false);
  const [hrOverviewError, setHrOverviewError] = useState('');
  const [expandedMemberIds, setExpandedMemberIds] = useState(new Set());

  // Determine if user can view HR / leadership committee overview
  const userRole = (profile?.role || '').toString().trim().toLowerCase();
  const rawCommittee = (
    profile?.committee ||
    profile?.firstCommittee ||
    profile?.first_committee ||
    profile?.primaryCommittee ||
    profile?.primary_committee ||
    ''
  ).toString().trim();
  const userCommittee = rawCommittee.toLowerCase();

  const isBoa = userRole === 'advisor';
  const isHrCommitteeMember = userCommittee === 'human_resources';
  const isLeadershipRole = userRole === 'officer' || userRole === 'board' || userRole === 'vice';
  const isCoordinator = userRole === 'coordinator';
  const canSeeHrReviews = isSupabaseConfigured && (isBoa || isHrCommitteeMember || isLeadershipRole || isCoordinator);

  // Helper to display names in proper Title Case even if stored in uppercase
  const capitalizeText = (text) => {
    if (!text) return '';
    const str = String(text).trim();
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    let cancelled = false;

    const fetchHrOverview = async () => {
      if (!user || !profile || !canSeeHrReviews) {
        if (!cancelled) {
          setHrCommitteeData([]);
          setHrOverviewLoading(false);
          setHrOverviewError('');
        }
        return;
      }

      setHrOverviewLoading(true);
      setHrOverviewError('');

      try {
        let committees = [];
        let memberRows = [];

        if (isBoa) {
          // Advisors: Only see BOARD and OFFICER roles, no committees, no vices
          const { data, error: membersError } = await supabase
            .from('student')
            .select('id, full_name, student_id, committee, role')
            .or('role.ilike.officer,role.ilike.board')
            .order('full_name', { ascending: true });

          if (membersError) throw membersError;
          memberRows = data || [];

          // For advisors, organize by role instead of committee
          if (memberRows.length === 0) {
            if (!cancelled) {
              setHrCommitteeData([]);
              setHrOverviewLoading(false);
            }
            return;
          }

          const memberList = memberRows || [];
          const studentIds = Array.from(
            new Set(memberList.map((m) => m.id).filter(Boolean))
          );

          if (!studentIds.length) {
            if (!cancelled) {
              setHrCommitteeData([]);
              setHrOverviewLoading(false);
            }
            return;
          }

          // Fetch task assignments for these students
          const { data: assignmentRows, error: assignmentsError } = await supabase
            .from('task_assignees')
            .select('task_id, student_id')
            .in('student_id', studentIds);

          if (assignmentsError) throw assignmentsError;

          const taskIds = Array.from(
            new Set((assignmentRows || []).map((r) => r.task_id).filter(Boolean))
          );

          let taskRows = [];
          if (taskIds.length) {
            const { data: tasksData, error: tasksError } = await supabase
              .from('task')
              .select('id, title, due_date, completed')
              .in('id', taskIds);

            if (tasksError) throw tasksError;
            taskRows = tasksData || [];
          }

          // Build maps for quick lookup
          const tasksById = new Map(taskRows.map((t) => [t.id, t]));
          const taskIdsByStudentId = new Map();

          (assignmentRows || []).forEach((row) => {
            if (!row.student_id || !row.task_id) return;
            const list = taskIdsByStudentId.get(row.student_id) || [];
            list.push(row.task_id);
            taskIdsByStudentId.set(row.student_id, list);
          });

          // Group by role for advisors
          const roleGroups = {
            'Officers': [],
            'Board': []
          };

          memberList.forEach((m) => {
            const studentTaskIds = taskIdsByStudentId.get(m.id) || [];
            const studentTasks = studentTaskIds
              .map((id) => tasksById.get(id))
              .filter(Boolean);

            const memberRole = (m.role || '').toString().trim().toLowerCase();
            if (memberRole === 'officer') {
              roleGroups['Officers'].push({
                id: m.id,
                name: m.full_name || 'Unknown',
                studentId: m.student_id || '',
                role: m.role || '',
                tasks: studentTasks,
              });
            } else if (memberRole === 'board') {
              roleGroups['Board'].push({
                id: m.id,
                name: m.full_name || 'Unknown',
                studentId: m.student_id || '',
                role: m.role || '',
                tasks: studentTasks,
              });
            }
          });

          // Convert to committee-like structure for consistent rendering
          const result = [];
          if (roleGroups['Officers'].length > 0) {
            result.push({
              committee: 'Officers',
              members: roleGroups['Officers'].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
              ),
            });
          }
          if (roleGroups['Board'].length > 0) {
            result.push({
              committee: 'Board',
              members: roleGroups['Board'].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
              ),
            });
          }

          if (!cancelled) {
            setHrCommitteeData(result);
          }
          return;
        }

        if (isHrCommitteeMember) {
          // HR members only see committees explicitly assigned to them in hr_assignations
          // hr_assignations schema: id (uuid), student_id (text), committee (varchar)
          // We match on profile.student_id (university ID), not the auth/user UUID.
          const hrStudentId = (profile?.student_id || '').toString().trim();

          if (!hrStudentId) {
            if (!cancelled) {
              setHrCommitteeData([]);
              setHrOverviewLoading(false);
              setHrOverviewError('Your profile is missing a student_id, so HR assignations cannot be loaded.');
            }
            return;
          }

          const { data: hrRows, error: hrError } = await supabase
            .from('hr_assignations')
            .select('committee')
            .eq('student_id', hrStudentId);

          if (hrError) throw hrError;

          committees = Array.from(
            new Set((hrRows || []).map((r) => r.committee).filter(Boolean))
          );

          // If this HR member has no assignations, show nothing
          if (!committees.length) {
            if (!cancelled) {
              setHrCommitteeData([]);
              setHrOverviewLoading(false);
            }
            return;
          }
        } else if (isCoordinator) {
          // Coordinators can see all committees EXCEPT their own and board_of_advisors
          const { data: allCommitteeRows, error: committeesError } = await supabase
            .from('student')
            .select('committee')
            .not('committee', 'is', null)
            .neq('committee', '');

          if (committeesError) throw committeesError;

          const allCommittees = Array.from(
            new Set((allCommitteeRows || []).map((r) => r.committee).filter(Boolean))
          );

          // Filter out the coordinator's own committee and board_of_advisors
          committees = allCommittees.filter((c) => {
            const normalizedC = (c || '').toString().trim().toLowerCase();
            return normalizedC !== userCommittee && 
                   normalizedC !== 'board_of_advisors' && 
                   normalizedC !== 'board of advisors';
          });
        } else if (isLeadershipRole) {
          if ((userRole === 'board' || userRole === 'vice') && rawCommittee) {
            // Board/Vice members see only their own committee
            committees = [rawCommittee];
          } else {
            // Officers can see all committees EXCEPT board_of_advisors
            const { data: allCommitteeRows, error: committeesError } = await supabase
              .from('student')
              .select('committee')
              .not('committee', 'is', null)
              .neq('committee', '');

            if (committeesError) throw committeesError;

            const allCommittees = Array.from(
              new Set((allCommitteeRows || []).map((r) => r.committee).filter(Boolean))
            );

            // Filter out board_of_advisors committee
            committees = allCommittees.filter((c) => {
              const normalizedC = (c || '').toString().trim().toLowerCase();
              return normalizedC !== 'board_of_advisors' && normalizedC !== 'board of advisors';
            });
          }
        }

        if (!committees.length) {
          if (!cancelled) {
            setHrCommitteeData([]);
            setHrOverviewLoading(false);
          }
          return;
        }

        // Fetch members in these committees (for non-advisors)
        const { data, error: membersError } = await supabase
          .from('student')
          .select('id, full_name, student_id, committee, role')
          .in('committee', committees)
          .order('full_name', { ascending: true });

        if (membersError) throw membersError;
        
        // Filter out BOA (Board of Advisors) members - they should never appear in performance reviews
        memberRows = (data || []).filter((m) => {
          const role = (m.role || '').toString().trim().toLowerCase();
          const committee = (m.committee || '').toString().trim().toLowerCase();
          // Exclude advisors and board of advisors committee members
          return role !== 'advisor' && 
                 committee !== 'board_of_advisors' && 
                 committee !== 'board of advisors';
        });

        const memberList = memberRows || [];
        const studentIds = Array.from(
          new Set(memberList.map((m) => m.id).filter(Boolean))
        );

        if (!studentIds.length) {
          if (!cancelled) {
            setHrCommitteeData([]);
          }
          return;
        }

        // Fetch task assignments for these students
        const { data: assignmentRows, error: assignmentsError } = await supabase
          .from('task_assignees')
          .select('task_id, student_id')
          .in('student_id', studentIds);

        if (assignmentsError) throw assignmentsError;

        const taskIds = Array.from(
          new Set((assignmentRows || []).map((r) => r.task_id).filter(Boolean))
        );

        let taskRows = [];
        if (taskIds.length) {
          const { data: tasksData, error: tasksError } = await supabase
            .from('task')
            .select('id, title, due_date, completed')
            .in('id', taskIds);

          if (tasksError) throw tasksError;
          taskRows = tasksData || [];
        }

        // Build maps for quick lookup
        const tasksById = new Map(taskRows.map((t) => [t.id, t]));
        const taskIdsByStudentId = new Map();

        (assignmentRows || []).forEach((row) => {
          if (!row.student_id || !row.task_id) return;
          const list = taskIdsByStudentId.get(row.student_id) || [];
          list.push(row.task_id);
          taskIdsByStudentId.set(row.student_id, list);
        });

        // Organize by committee -> members -> tasks (only for non-advisors)
        const committeeMap = new Map();
        committees.forEach((c) => committeeMap.set(c, []));

        memberList.forEach((m) => {
          const studentTaskIds = taskIdsByStudentId.get(m.id) || [];
          const studentTasks = studentTaskIds
            .map((id) => tasksById.get(id))
            .filter(Boolean);

          const committeeName = m.committee || 'Unassigned';

          if (!committeeMap.has(committeeName)) {
            committeeMap.set(committeeName, []);
          }

          committeeMap.get(committeeName).push({
            id: m.id,
            name: m.full_name || 'Unknown',
            studentId: m.student_id || '',
            role: m.role || '',
            tasks: studentTasks,
          });
        });

        const result = Array.from(committeeMap.entries())
          .sort(([a], [b]) => (a || '').localeCompare(b || ''))
          .map(([committeeName, membersForCommittee]) => ({
            committee: committeeName,
            members: (membersForCommittee || []).sort((a, b) =>
              (a.name || '').localeCompare(b.name || '')
            ),
          }));

        if (!cancelled) {
          setHrCommitteeData(result);
        }
      } catch (err) {
        console.error('[HRReviews] Failed to load HR committee overview:', err);
        if (!cancelled) {
          setHrCommitteeData([]);
          setHrOverviewError(
            `Failed to load committee tasks overview. ${err?.message || String(err)}`
          );
        }
      } finally {
        if (!cancelled) {
          setHrOverviewLoading(false);
        }
      }
    };

    fetchHrOverview();

    return () => {
      cancelled = true;
    };
  }, [user, profile, canSeeHrReviews, isHrCommitteeMember, isBoa, isCoordinator, isLeadershipRole, rawCommittee, userCommittee, userRole]);

  const styles = {
    container: {
      padding: '2rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#0f172a',
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#4b5563',
      marginBottom: '1.5rem',
    },
    card: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
      overflowX: 'hidden',
    },
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
  };

  const toggleMemberExpanded = (memberId) => {
    setExpandedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  if (!canSeeHrReviews) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>HR Reviews</h1>
        <p style={styles.subtitle}>
          This section is only available to Human Resources, Board, Officers, and Vice.
        </p>
        <div style={{ color: '#4b5563' }}>
          You do not have permission to view HR Reviews.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>HR Reviews</h1>
      <p style={styles.subtitle}>
        Review each committee&apos;s members and the tasks assigned to them, including whether
        they are completed or still pending.
      </p>

      {hrOverviewLoading ? (
        <div style={{ color: '#00629b' }}>Loading committee tasks overview...</div>
      ) : hrOverviewError ? (
        <div style={styles.error}>{hrOverviewError}</div>
      ) : hrCommitteeData.length === 0 ? (
        <div style={{ color: '#4b5563' }}>No committee data or tasks found yet.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
            marginTop: '0.5rem',
          }}
        >
          {hrCommitteeData.map((committee) => (
            <div
              key={committee.committee || 'unknown-committee'}
              style={styles.card}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    color: '#0f172a',
                  }}
                >
                  {committee.committee
                    ? capitalizeText(committee.committee)
                    : 'Unassigned Committee'}
                </h3>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#4b5563',
                  }}
                >
                  {committee.members.length} member
                  {committee.members.length !== 1 ? 's' : ''}
                </span>
              </div>

              {committee.members.length === 0 ? (
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '0.9rem',
                  }}
                >
                  No members found in this committee.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {committee.members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: '#f9fafb',
                        cursor: 'pointer',
                        maxWidth: '100%',
                        overflowX: 'hidden',
                      }}
                      onClick={() => toggleMemberExpanded(member.id)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: '#111827',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {capitalizeText(member.name)}
                            {member.role && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 400,
                                  color: '#4b5563',
                                  marginLeft: '0.5rem',
                                  textTransform: 'capitalize',
                                }}
                              >
                                ({member.role})
                              </span>
                            )}
                          </div>
                          {member.studentId && (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: '#4b5563',
                              }}
                            >
                              ID: {member.studentId}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#4b5563',
                          }}
                        >
                          {member.tasks.length} task
                          {member.tasks.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {member.tasks.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#4b5563',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {expandedMemberIds.has(member.id)
                            ? 'Click to hide tasks'
                            : 'Click to view tasks'}
                        </div>
                      )}

                      {member.tasks.length > 0 && expandedMemberIds.has(member.id) && (
                        <ul
                          style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          {member.tasks.map((task) => (
                            <li
                              key={task.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '0.75rem',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.9rem',
                                    color: '#111827',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {task.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: '#4b5563',
                                  }}
                                >
                                  {task.due_date &&
                                    `Due: ${new Date(
                                      task.due_date
                                    ).toLocaleDateString()}`}
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: task.completed
                                    ? '#dcfce7'
                                    : '#fee2e2',
                                  color: task.completed
                                    ? '#166534'
                                    : '#991b1b',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {task.completed ? 'Completed' : 'Pending'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRReviews;


