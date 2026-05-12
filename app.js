// Supabase initialization
const SUPABASE_URL = 'https://wwummihoiklnnqjncgmd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dW1taWhvaWtsbm5xam5jZ21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODI0OTAsImV4cCI6MjA5NDE1ODQ5MH0.ZY7M1lngXz2MaTDaLGXn8uQgNvKJiKvHcygPsy7o1Ks';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose to global scope
window._sb = sb;

window._fbSignIn = async function(email, password) {
  return await sb.auth.signInWithPassword({ email, password });
};
window._fbSignUp = async function(email, password) {
  return await sb.auth.signUp({ email, password });
};
window._fbSignOut = async function() {
  return await sb.auth.signOut();
};
window._fbOnAuthStateChanged = function(cb) {
  sb.auth.onAuthStateChange((event, session) => {
    cb(session ? session.user : null);
  });
};
