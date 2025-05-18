// import React, { useState } from 'react';
// import { createClient } from '@supabase/supabase-js';

// // Initialize Supabase client
// const supabaseUrl = ;
// const supabaseAnonKey = ;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// const Auth = ({ onAuth }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       if (isLogin) {
//         // Login
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });
//         if (error) throw error;
//         onAuth(data.user);
//       } else {
//         // Register
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//         });
//         if (error) throw error;
//         onAuth(data.user);
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
//       <h2>{isLogin ? 'Login' : 'Register'}</h2>
//       {error && (
//         <div style={{ color: 'red', marginBottom: '10px' }}>
//           {error}
//         </div>
//       )}
//       <form onSubmit={handleAuth}>
//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>
//             Email:
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             style={{ width: '100%', padding: '8px' }}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>
//             Password:
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={{ width: '100%', padding: '8px' }}
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
//         </button>
//       </form>
//       <div style={{ marginTop: '15px', textAlign: 'center' }}>
//         <button
//           onClick={() => setIsLogin(!isLogin)}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: '#007bff',
//             cursor: 'pointer'
//           }}
//         >
//           {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Auth; 