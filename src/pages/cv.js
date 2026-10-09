import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react"


export default function CvPortal() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [user, setUser] = useState(null)
    const [fullName, setfFullName] = useState("");

    useEffect(() => {
            async function restoreSession() {
            const { data, error } = await supabase.auth.getSession();   
            
            if (error) {
                setMessage(error.message);
            } else {
                setUser(data.session?.user ?? null);
            }
        }
    restoreSession();
    }, [])

    async function handlelogin(event) {
        event.preventDefault();
        setMessage("Logging in...")

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            setMessage(error.message);

        } else {
            setUser(data.user);
            setMessage(`Logged in as ${data.user.email}`);
        }

    }
    
    async function handleRegister() {
        setMessage("Creating account...")

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
        });


        if (error){
            setMessage(error.message);
        
        } else if (data.session) {

            setUser(data.user);
            setMessage("Account created. You are logged in!")
        
        } else {
        
            setMessage("Check your email to confirm your account before logging in.")
        }
    }

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setMessage(error.message);
        
        } else {
            setUser(null);
            setPassword("");
            setMessage("Your are logged out.")
        }
    }

return (
    <div>
        <h1>CV portal</h1>

        {user ? (
            <div>
                <h2>Member dashboard</h2>
                <p>Welcome, {user.email}!</p>
                <input 
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={event => setFullName(event.target.value)}
                    />

                <p>You profile name: { fullName }</p>

                <button type="button" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        ) : (
            <form onSubmit={handlelogin}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />

                <button type="submit">Log in</button>

                <button type="button" onClick={handleRegister}>
                    Create account
                </button>
            </form>
        )}

        <p role="status">{message}</p>
    </div>
);
}

