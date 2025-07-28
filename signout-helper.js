// Sign Out Helper Script
// Run this in the browser console to sign out

// Method 1: Try to access supabase from window object
if (window.supabase) {
    console.log('Found supabase on window object');
    window.supabase.auth.signOut().then(() => {
        console.log('Signed out successfully');
        window.location.reload();
    }).catch(err => {
        console.error('Sign out error:', err);
    });
} else {
    console.log('Supabase not found on window object');
}

// Method 2: Try to access from React app context
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected, trying to find supabase in React context');
    // This might help find the supabase instance
}

// Method 3: Clear local storage and reload
console.log('Clearing auth data from localStorage...');
localStorage.removeItem('supabase.auth.token');
localStorage.removeItem('sb-REACT_APP_SUPABASE_URL-auth-token');
sessionStorage.removeItem('supabase.auth.token');
sessionStorage.removeItem('sb-REACT_APP_SUPABASE_URL-auth-token');

console.log('Reloading page...');
window.location.reload(); 