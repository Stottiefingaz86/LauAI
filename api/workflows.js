import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowType } = req.body;

    console.log('Executing workflow:', workflowType);

    switch (workflowType) {
      case 'performance_alerts':
        return await handlePerformanceAlerts(res);
      
      case 'one_on_one_reminders':
        return await handleOneOnOneReminders(res);
      
      case 'team_health_analysis':
        return await handleTeamHealthAnalysis(res);
      
      case 'recurring_surveys':
        return await handleRecurringSurveys(res);
      
      case 'weekly_reports':
        return await handleWeeklyReports(res);
      
      default:
        return res.status(400).json({ error: 'Invalid workflow type' });
    }
  } catch (error) {
    console.error('Workflow execution error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handlePerformanceAlerts(res) {
  try {
    // Get all members
    const { data: members, error } = await supabase
      .from('members')
      .select('*');
    
    if (error) throw error;
    
    const alerts = [];
    
    for (const member of members || []) {
      const signals = member.signals || 0;
      
      if (signals < 3) {
        alerts.push({
          type: 'low_performance',
          member_id: member.id,
          member_name: member.name,
          message: `${member.name} has low performance signals (${signals}/10)`,
          severity: 'high',
          created_at: new Date().toISOString()
        });
      }
      
      if (signals === 0) {
        alerts.push({
          type: 'no_activity',
          member_id: member.id,
          member_name: member.name,
          message: `${member.name} has no recent activity`,
          severity: 'critical',
          created_at: new Date().toISOString()
        });
      }
    }
    
    // Store alerts
    if (alerts.length > 0) {
      await supabase
        .from('alerts')
        .insert(alerts);
    }
    
    return res.status(200).json({ 
      success: true, 
      alerts: alerts.length,
      message: `Generated ${alerts.length} performance alerts`
    });
  } catch (error) {
    console.error('Performance alerts error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleOneOnOneReminders(res) {
  try {
    // Get members who haven't had a 1:1 in 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .or(`last_meeting.is.null,last_meeting.lt.${twoWeeksAgo.toISOString()}`);
    
    if (error) throw error;
    
    let remindersSent = 0;
    
    for (const member of members || []) {
      // Send reminder email
      const emailResult = await sendOneOnOneReminder(member.email, member.name);
      if (emailResult.success) {
        remindersSent++;
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      remindersSent,
      message: `Sent ${remindersSent} 1:1 reminders`
    });
  } catch (error) {
    console.error('1:1 reminders error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleTeamHealthAnalysis(res) {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('*');
    
    if (error) throw error;
    
    const teamHealth = {
      total_members: members?.length || 0,
      active_members: members?.filter(m => (m.signals || 0) > 0).length || 0,
      high_performers: members?.filter(m => (m.signals || 0) >= 8).length || 0,
      needs_attention: members?.filter(m => (m.signals || 0) < 5).length || 0,
      average_signals: members?.reduce((sum, m) => sum + (m.signals || 0), 0) / (members?.length || 1) || 0
    };
    
    // Store team health data
    await supabase
      .from('team_health')
      .upsert({
        id: 1,
        data: teamHealth,
        updated_at: new Date().toISOString()
      });
    
    return res.status(200).json({ 
      success: true, 
      teamHealth,
      message: 'Team health analysis completed'
    });
  } catch (error) {
    console.error('Team health analysis error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleRecurringSurveys(res) {
  try {
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', 'active')
      .eq('is_recurring', true);
    
    if (error) throw error;
    
    let surveysSent = 0;
    
    for (const survey of surveys || []) {
      const shouldSend = shouldSendRecurringSurvey(survey);
      if (shouldSend) {
        const result = await sendRecurringSurvey(survey);
        if (result.success) {
          surveysSent++;
        }
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      surveysSent,
      message: `Sent ${surveysSent} recurring surveys`
    });
  } catch (error) {
    console.error('Recurring surveys error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleWeeklyReports(res) {
  try {
    // Get team health data
    const { data: teamHealth, error } = await supabase
      .from('team_health')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    // Get admin users to send reports to
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');
    
    if (adminError) throw adminError;
    
    let reportsSent = 0;
    
    for (const admin of admins || []) {
      const emailResult = await sendTeamHealthReport(admin.email, teamHealth.data);
      if (emailResult.success) {
        reportsSent++;
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      reportsSent,
      message: `Sent ${reportsSent} weekly reports`
    });
  } catch (error) {
    console.error('Weekly reports error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Helper functions
function shouldSendRecurringSurvey(survey) {
  const now = new Date();
  const lastSent = new Date(survey.last_sent || 0);
  const interval = survey.recurring_interval || 7; // days
  
  return (now - lastSent) >= (interval * 24 * 60 * 60 * 1000);
}

async function sendRecurringSurvey(survey) {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('*');
    
    if (error) throw error;
    
    let emailsSent = 0;
    
    for (const member of members || []) {
      const emailResult = await sendSurveyInvitation(
        member.email,
        survey.title,
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/survey/${survey.id}/member/${member.id}`,
        member.name
      );
      
      if (emailResult.success) {
        emailsSent++;
      }
    }
    
    // Update last sent date
    await supabase
      .from('surveys')
      .update({ last_sent: new Date().toISOString() })
      .eq('id', survey.id);
    
    return { success: true, emailsSent };
  } catch (error) {
    console.error('Error sending recurring survey:', error);
    return { success: false, error: error.message };
  }
}

async function sendSurveyInvitation(email, surveyTitle, surveyLink, memberName) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        surveyTitle,
        surveyLink,
        memberName,
        template: 'survey_invitation'
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to send email' };
    }
  } catch (error) {
    console.error('Error sending survey invitation:', error);
    return { success: false, error: error.message };
  }
}

async function sendOneOnOneReminder(email, memberName) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        template: 'one_on_one_reminder',
        memberName
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to send reminder' };
    }
  } catch (error) {
    console.error('Error sending 1:1 reminder:', error);
    return { success: false, error: error.message };
  }
}

async function sendTeamHealthReport(email, teamHealth) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        template: 'team_health_report',
        teamHealth
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to send report' };
    }
  } catch (error) {
    console.error('Error sending team health report:', error);
    return { success: false, error: error.message };
  }
} 