// Database cleanup functions to run in browser console
// Copy and paste these functions into your browser console on the app

// Function to clean up orphaned members
async function cleanupOrphanedMembers() {
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('Cleaning up orphaned members...');
    
    // Get all teams
    const { data: teams } = await supabase.from('teams').select('id');
    const teamIds = teams?.map(t => t.id) || [];
    
    console.log('Team IDs:', teamIds);
    
    // Delete members without valid team_id
    const { data: orphanedMembers, error: deleteError } = await supabase
      .from('members')
      .delete()
      .not('team_id', 'in', `(${teamIds.join(',')})`);
    
    if (deleteError) {
      console.error('Error deleting orphaned members:', deleteError);
    } else {
      console.log('Orphaned members deleted successfully');
    }
    
    // Show remaining members
    const { data: remainingMembers } = await supabase.from('members').select('*');
    console.log('Remaining members:', remainingMembers);
    
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
}

// Function to completely reset the database
async function resetDatabase() {
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('Resetting database...');
    
    // Delete all data from all tables
    const tables = [
      'members', 'teams', 'surveys', 'survey_questions', 
      'survey_responses', 'survey_insights', 'survey_completions',
      'meetings', 'signals', 'insights', 'billing_info',
      'payment_sessions', 'customers', 'invitations', 'profiles',
      'alerts', 'team_health'
    ];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.log(`Error deleting from ${table}:`, error);
      } else {
        console.log(`Cleared ${table}`);
      }
    }
    
    console.log('Database reset complete!');
    
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

// Function to check current database state
async function checkDatabaseState() {
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('Checking database state...');
    
    const tables = [
      'members', 'teams', 'surveys', 'survey_questions', 
      'survey_responses', 'survey_insights', 'survey_completions',
      'meetings', 'signals', 'insights', 'billing_info',
      'payment_sessions', 'customers', 'invitations', 'profiles',
      'alerts', 'team_health'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.log(`${table}: Error - ${error.message}`);
      } else {
        console.log(`${table}: ${data?.length || 0} records`);
      }
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Export functions for use
window.cleanupOrphanedMembers = cleanupOrphanedMembers;
window.resetDatabase = resetDatabase;
window.checkDatabaseState = checkDatabaseState;

console.log('Database cleanup functions loaded!');
console.log('Run these functions in the console:');
console.log('- cleanupOrphanedMembers() - Clean up orphaned members');
console.log('- resetDatabase() - Completely reset the database');
console.log('- checkDatabaseState() - Check current database state'); 